"""Authoritative game actions, projections and snapshot isolation."""

import copy
import json
from datetime import datetime, timezone
from uuid import uuid4

from . import case
from .dialogue import CHARACTER_MAP, apply_delivery, response_for, route_question, topic_ids
from .storage import GameError, Store, encode, fingerprint


def now():
    return datetime.now(timezone.utc).isoformat()


class Game:
    def __init__(self, path):
        self.store = Store(path)
        self.recover_pending()

    def projection(self, db, row):
        state = json.loads(row["state"])
        result = case.player_projection(state)
        result.update({"id": row["id"], "revision": row["revision"], "created_at": row["created_at"],
                       "solution_revealed": bool(row["revealed"])})
        result["attempt_count"] = db.execute("SELECT COUNT(*) FROM attempts WHERE run_id=?", (row["id"],)).fetchone()[0]
        return result

    def history(self, db):
        rows = db.execute("SELECT a.*, r.active, r.created_at AS run_created, r.revealed FROM attempts a JOIN runs r ON a.run_id=r.id ORDER BY a.id DESC").fetchall()
        result = []
        for row in rows:
            score = json.loads(row["snapshot"])["score"]
            result.append({"id": row["id"], "run_id": row["run_id"], "created_at": row["created_at"],
                           "run_created_at": row["run_created"], "is_current": bool(row["active"]),
                           "solution_revealed": bool(row["revealed"]),
                           "total": score["total"], "outcome": score["outcome"], "accusation": score["accusation"]})
        return result

    def bootstrap(self):
        with self.store.connection() as db:
            row = db.execute("SELECT * FROM runs WHERE active=1").fetchone()
            return {"case": case.CASE, "characters": case.CHARACTERS,
                    "run": self.projection(db, row) if row else None, "attempts": self.history(db)}

    def get_run(self, run_id):
        with self.store.connection() as db:
            row, _ = self.store.current(db, run_id)
            return self.projection(db, row)

    def command_status(self, command_id):
        with self.store.connection() as db:
            row = db.execute("SELECT response FROM commands WHERE id=?", (command_id,)).fetchone()
            if row:
                return {"status": "complete", "result": json.loads(row["response"])}
            current = db.execute("SELECT state FROM runs WHERE active=1").fetchone()
            pending = json.loads(current["state"])["pending"] if current else None
            return {"status": "pending" if pending and pending["command_id"] == command_id else "not_found"}

    def start(self, command):
        payload = command.model_dump(mode="json")
        command_id = str(command.command_id)
        digest = fingerprint("start", payload)
        with self.store.transaction() as db:
            cached = self.store.retry(db, command_id, digest)
            if cached is not None:
                return cached
            row = db.execute("SELECT * FROM runs WHERE active=1").fetchone()
            if not row:
                run_id = str(uuid4())
                db.execute("INSERT INTO runs(id, created_at, state) VALUES (?, ?, ?)", (run_id, now(), encode(case.new_state())))
                row = db.execute("SELECT * FROM runs WHERE id=?", (run_id,)).fetchone()
            result = {"run": self.projection(db, row)}
            self.store.remember(db, command_id, row["id"], digest, result)
            return result

    def validate_records(self, state, ids):
        if any(record not in state["collected"] for record in ids):
            raise GameError("One or more records are not available in this investigation.", "invalid_record")

    def validate_draft(self, state, draft):
        if set(draft["fields"]) != set(case.FIELD_MAP):
            raise GameError("The report must include all eight fields; unanswered fields may be unestablished.", "invalid_report")
        available = {item["id"]: {option["value"] for option in item["options"]} for item in case.public_fields(state["collected"])}
        for key, claim in draft["fields"].items():
            roles = {role[0] for role in case.FIELD_MAP[key]["roles"]}
            if set(claim["citations"]) != roles or claim["choice"] not in available[key]:
                raise GameError("Review the highlighted report choices and evidence roles.", "invalid_report")
            self.validate_records(state, [record for record in claim["citations"].values() if record is not None])

    def validate_note(self, state, note):
        note["source_ids"] = list(dict.fromkeys(note["source_ids"]))
        self.validate_records(state, note["source_ids"] + [note["target_id"]])
        if note["target_id"] in note["source_ids"] or not note["interpretation"].strip():
            raise GameError("Choose distinct source and target records and write your interpretation.", "invalid_note")
        if not set(note["passages"]) <= set(note["source_ids"] + [note["target_id"]]) or any(len(value) > 300 for value in note["passages"].values()):
            raise GameError("Passage labels must belong to a linked source and be at most 300 characters.", "invalid_note")

    def action(self, run_id, kind, command, target=None):
        payload = command.model_dump(mode="json")
        command_id = str(command.command_id)
        digest = fingerprint(kind, {"run_id": run_id, "target": target, **payload})
        with self.store.transaction() as db:
            cached = self.store.retry(db, command_id, digest)
            if cached is not None:
                return cached
            row, state = self.store.current(db, run_id)
            if row["revision"] != command.expected_revision:
                # Two fresh confirmations of the identical saved draft remain separate valid attempts.
                identical_submission = kind == "submit" and payload["draft"] == state["draft"] and command.expected_revision < row["revision"]
                if not identical_submission:
                    raise GameError("The investigation changed. Refresh and review before retrying.", "revision_conflict", 409)
            extras = {}
            if kind == "inspect":
                self.validate_records(state, [command.record_id])
                if command.record_id not in state["inspected"]:
                    state["inspected"].append(command.record_id)
                extras["record_id"] = command.record_id
            elif kind == "retrieve":
                request = case.REQUESTS.get(command.request_id)
                if not request or not set(request[1]) <= set(state["inspected"]):
                    raise GameError("That record request is not currently available.", "unavailable_request")
                record = request[0]
                if record not in state["collected"]:
                    state["collected"].append(record)
                if record not in state["inspected"]:
                    state["inspected"].append(record)
                extras["record_id"] = record
            elif kind == "draft":
                self.validate_draft(state, payload["draft"])
                state["draft"] = payload["draft"]
            elif kind in {"note_create", "note_edit"}:
                note = payload["note"]
                self.validate_note(state, note)
                if kind == "note_edit":
                    existing = next((item for item in state["notes"] if item["id"] == target), None)
                    if not existing:
                        raise GameError("This note is no longer available.", "missing_note", 404)
                    note_id = target
                else:
                    note_id = str(uuid4())
                note.update({"id": note_id, "saved_at": now()})
                state["notes"] = [item for item in state["notes"] if item["id"] != note_id] + [note]
                extras["note_id"] = note_id
            elif kind == "note_delete":
                if not any(note["id"] == target for note in state["notes"]):
                    raise GameError("This note is no longer available.", "missing_note", 404)
                state["notes"] = [note for note in state["notes"] if note["id"] != target]
            elif kind == "submit":
                if state["pending"]:
                    raise GameError("Wait for the pending reply before confirming your report.", "reply_pending", 409)
                draft = payload["draft"]
                self.validate_draft(state, draft)
                state["draft"] = draft
                cited = {record for claim in draft["fields"].values() for record in claim["citations"].values() if record}
                snapshot = {"draft": copy.deepcopy(draft), "score": case.score(draft), "report_fields": case.public_fields(state["collected"]),
                            "collected_ids": state["collected"].copy(), "delivered": state["delivered"].copy(),
                            "records": {key: copy.deepcopy(case.RECORDS[key]) for key in cited},
                            "review": {"records": copy.deepcopy(case.RECORDS), "paragraphs": case.SOLUTION.copy()},
                            "case_version": case.CASE_VERSION, "rubric_version": case.RUBRIC_VERSION}
                cursor = db.execute("INSERT INTO attempts(run_id, command_id, created_at, snapshot) VALUES (?, ?, ?, ?)", (run_id, command_id, now(), encode(snapshot)))
                extras["attempt_id"] = cursor.lastrowid
            elif kind == "reveal":
                if not db.execute("SELECT 1 FROM attempts WHERE run_id=?", (run_id,)).fetchone():
                    raise GameError("Submit a report before opening the solution review.", "no_submission")
                db.execute("UPDATE runs SET revealed=1 WHERE id=?", (run_id,))
            elif kind == "reset":
                # Clear all working-state copies in command caches; retain attempt reconciliation IDs.
                for saved in db.execute("SELECT id, response FROM commands WHERE run_id=?", (run_id,)).fetchall():
                    previous = json.loads(saved["response"])
                    replacement = {"archived": True}
                    if "attempt_id" in previous:
                        replacement["attempt_id"] = previous["attempt_id"]
                    db.execute("UPDATE commands SET response=? WHERE id=?", (encode(replacement), saved["id"]))
                db.execute("UPDATE runs SET active=0, state=?, revision=revision+1 WHERE id=?", (encode({"archived": True}), run_id))
                new_id = str(uuid4())
                db.execute("INSERT INTO runs(id, created_at, state) VALUES (?, ?, ?)", (new_id, now(), encode(case.new_state())))
                row = db.execute("SELECT * FROM runs WHERE id=?", (new_id,)).fetchone()
                result = {"run": self.projection(db, row), "reset": True}
                self.store.remember(db, command_id, new_id, digest, result)
                return result
            else:
                raise GameError("Unknown action.")
            updated = self.store.save(db, row, state)
            result = {"run": self.projection(db, updated), **extras}
            self.store.remember(db, command_id, run_id, digest, result)
            return result

    def attempt(self, attempt_id, solution=False):
        with self.store.connection() as db:
            row = db.execute("SELECT a.*, r.active, r.revealed FROM attempts a JOIN runs r ON a.run_id=r.id WHERE a.id=?", (attempt_id,)).fetchone()
            if not row:
                raise GameError("This submission is not available.", "missing_attempt", 404)
            snapshot = json.loads(row["snapshot"])
            if solution:
                if not row["revealed"]:
                    raise GameError("Confirm solution reveal in that investigation first.", "solution_locked", 403)
                return {"paragraphs": snapshot["review"]["paragraphs"],
                        "records": [dict(record, review_only=key not in snapshot["collected_ids"]) for key, record in snapshot["review"]["records"].items()],
                        "testimony_review_only": "A05" not in snapshot["delivered"]}
            result = {"id": row["id"], "run_id": row["run_id"], "created_at": row["created_at"],
                      "is_current": bool(row["active"]), "solution_revealed": bool(row["revealed"]),
                      "draft": snapshot["draft"], "records": snapshot["records"], "report_fields": snapshot["report_fields"],
                      "case_version": snapshot["case_version"], "rubric_version": snapshot["rubric_version"],
                      "score": {key: value for key, value in snapshot["score"].items() if key not in {"rows", "core_proof"}}}
            if row["revealed"]:
                result["score"]["rows"] = snapshot["score"]["rows"]
            return result

    async def interact(self, run_id, command):
        payload = command.model_dump(mode="json")
        command_id = str(command.command_id)
        digest = fingerprint("interaction", {"run_id": run_id, **payload})
        character = command.character_id
        if command.topic_id is not None and command.topic_id not in topic_ids(character):
            raise GameError("Choose a visible topic for this person.", "invalid_topic")
        if not command.question.strip() and not command.topic_id:
            raise GameError("Ask a question or choose a topic.", "empty_question")
        if command.evidence_ids and not command.topic_id:
            raise GameError("Choose the topic you are presenting evidence about.", "missing_topic")
        with self.store.transaction() as db:
            cached = self.store.retry(db, command_id, digest)
            if cached is not None:
                return cached
            row, state = self.store.current(db, run_id, command.expected_revision)
            if state["pending"]:
                raise GameError("A reply is already pending. You can keep reading.", "reply_pending", 409)
            self.validate_records(state, command.evidence_ids)
            topic_label = next((item["label"] for item in CHARACTER_MAP[character]["topics"] if item["id"] == command.topic_id), None)
            question = command.question.strip() or f"Tell me about: {topic_label}."
            state["pending"] = {"command_id": command_id, "digest": digest, "character": character,
                                "question": question, "topic": command.topic_id,
                                "evidence": list(dict.fromkeys(command.evidence_ids)), "accepted_at": now()}
            self.store.save(db, row, state)
        try:
            topic, mode, notice = await route_question(character, question, command.topic_id)
        except Exception:
            from .dialogue import scripted_topic
            topic, mode, notice = command.topic_id or scripted_topic(character, question), "scripted", "Scripted dialogue active."
        return self.finish_interaction(run_id, command_id, topic, mode, notice)

    def finish_interaction(self, run_id, command_id, topic, mode, notice=None):
        with self.store.transaction() as db:
            row, state = self.store.current(db, run_id)
            pending = state["pending"]
            if not pending or pending["command_id"] != command_id:
                cached = db.execute("SELECT response FROM commands WHERE id=?", (command_id,)).fetchone()
                if cached:
                    return json.loads(cached["response"])
                raise GameError("This reply belongs to an earlier investigation.", "stale_reply", 409)
            reply = response_for(state, pending["character"], topic, pending["evidence"])
            apply_delivery(state, reply)
            exchange_id = str(uuid4())
            state["conversations"].append({"id": exchange_id, "character_id": pending["character"],
                                           "question": pending["question"], "reply": reply["text"], "kind": reply["kind"],
                                           "source_ids": pending["evidence"], "corrects": reply["corrects"],
                                           "topic_id": topic, "created_at": pending["accepted_at"]})
            state["pending"] = None
            updated = self.store.save(db, row, state)
            result = {"run": self.projection(db, updated), "dialogue_mode": mode, "notice": notice}
            self.store.remember(db, command_id, run_id, pending["digest"], result)
            return result

    def recover_pending(self):
        from .dialogue import scripted_topic
        with self.store.connection() as db:
            row = db.execute("SELECT * FROM runs WHERE active=1").fetchone()
        if row:
            pending = json.loads(row["state"])["pending"]
            if pending:
                topic = pending["topic"] or scripted_topic(pending["character"], pending["question"])
                self.finish_interaction(row["id"], pending["command_id"], topic, "scripted", "Interrupted reply recovered with authored dialogue.")

    def scripted_reply(self, run_id, interaction_id, command):
        from .dialogue import scripted_topic
        command_id = str(command.command_id)
        digest = fingerprint("scripted_reply", {"run_id": run_id, "interaction_id": interaction_id, **command.model_dump(mode="json")})
        with self.store.transaction() as db:
            cached = self.store.retry(db, command_id, digest)
            if cached is not None:
                return cached
            _, state = self.store.current(db, run_id, command.expected_revision)
            pending = state["pending"]
            if not pending or pending["command_id"] != interaction_id:
                raise GameError("That reply has already finished. Refresh the conversation.", "reply_finished", 409)
            topic = pending["topic"] or scripted_topic(pending["character"], pending["question"])
        result = self.finish_interaction(run_id, interaction_id, topic, "scripted", "Your pending question was answered with authored dialogue.")
        with self.store.transaction() as db:
            self.store.current(db, run_id)
            self.store.remember(db, command_id, run_id, digest, result)
        return result
