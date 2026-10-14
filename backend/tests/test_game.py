import copy
import json
import sqlite3
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from witness.app import create_app
from witness.case import INITIAL
from witness.case import RECORDS

from test_scoring import complete_draft


def test_player_records_contain_no_author_annotations():
    for record in RECORDS.values():
        text = json.dumps(record).lower()
        for forbidden in ["subplot", "author-only", "player asset", "scoring key", "profile flag"]:
            assert forbidden not in text
    assert "correspondent never appears" not in RECORDS["E12"]["limitation"]


def test_initial_projection_and_disclosure(player):
    run = player.run
    assert [record["id"] for record in run["records"]] == INITIAL
    assert all(not record["inspected"] for record in run["records"])
    assert not run["leads"] and not run["conversations"] and not run["notes"]
    assert len(run["report_fields"]) == 8
    payload = json.dumps(run)
    for forbidden in ["west service alcove", "$180,000", "E08", "E12", '"correct":', '"required":']:
        assert forbidden not in payload
    assert player.act("retrieve", {"request_id": "R08"}).status_code == 400
    assert player.act("inspect", {"record_id": "E12"}).status_code == 400


def test_both_routes_and_idempotent_requests(player):
    player.act("inspect", {"record_id": "E07"})
    for request in ["R04", "R07", "R08", "R03"]:
        assert player.act("retrieve", {"request_id": request}).is_success
    player.act("inspect", {"record_id": "E03"})
    for request in ["R01", "R02"]:
        assert player.act("retrieve", {"request_id": request}).is_success
    assert len(player.run["records"]) == 10
    before = {record["id"] for record in player.run["records"]}
    assert player.act("retrieve", {"request_id": "R04"}).is_success
    assert {record["id"] for record in player.run["records"]} == before
    player.act("inspect", {"record_id": "E02"})
    player.act("retrieve", {"request_id": "R05"})
    player.act("retrieve", {"request_id": "R06"})
    assert len(player.run["records"]) == 12


def test_timeline_and_record_limits_are_source_specific(player):
    player.act("inspect", {"record_id": "E03"})
    player.act("retrieve", {"request_id": "R01"})
    player.act("retrieve", {"request_id": "R02"})
    player.act("retrieve", {"request_id": "R06"})
    events = player.run["timeline"]
    absence = next(event for event in events if event["source_id"] == "E05" and event["id"] == "T06")
    assert "Maya" not in absence["text"]
    assert not any("call" in event["text"].lower() for event in events)
    signoff = next(event for event in events if event["id"] == "T07")
    assert signoff["kind"] == "Statement" and "claiming" in signoff["text"]
    player.act("inspect", {"record_id": "E02"})
    player.act("retrieve", {"request_id": "R05"})
    e09 = next(record for record in player.run["records"] if record["id"] == "E09")
    assert "west service alcove" not in json.dumps(e09)
    assert "calculated" in json.dumps(e09) and "consent" in json.dumps(e09)


def test_options_do_not_preview_hidden_execution_or_motive(player):
    def options(field):
        return {opt["value"] for item in player.run["report_fields"] if item["id"] == field for opt in item["options"]}
    assert "sale" not in options("D07")
    assert "skipped" not in options("D06")
    assert "delayed" not in options("D01")
    player.collect_all()
    assert "sale" in options("D07") and "skipped" in options("D06") and "delayed" in options("D01")


def test_notes_crud_and_snapshot_exclusion(player):
    player.collect_all()
    note = {"source_ids": ["E05", "E06", "E05"], "target_id": "E04", "relation": "Contradicts",
            "interpretation": "The sign-off claim conflicts with the logged absence after closure.", "passages": {"E04": "Return sign-off"}}
    result = player.act("notes", {"note": note})
    assert result.is_success
    note_id = result.json()["note_id"]
    assert player.run["notes"][0]["source_ids"] == ["E05", "E06"]
    assert not player.client.get("/api/bootstrap").json()["attempts"]
    edited = dict(note, interpretation="My revised interpretation.")
    assert player.act(f"notes/{note_id}", {"note": edited}, method="put").is_success
    submission = player.act("submit", {"draft": complete_draft()})
    attempt_id = submission.json()["attempt_id"]
    frozen = player.client.get(f"/api/attempts/{attempt_id}").json()
    assert frozen["score"]["total"] == 100
    assert "notes" not in frozen and "My revised interpretation" not in json.dumps(frozen)
    # DELETE with JSON uses the generic request method because httpx.delete has no json argument.
    body = {"command_id": str(uuid4()), "expected_revision": player.run["revision"]}
    response = player.client.request("DELETE", f"/api/runs/{player.run['id']}/notes/{note_id}", json=body)
    player.run = response.json()["run"]
    assert not player.run["notes"]
    assert player.client.get(f"/api/attempts/{attempt_id}").json() == frozen


@pytest.mark.parametrize("note", [
    {"source_ids": ["E01"], "target_id": "E01", "interpretation": "Same source"},
    {"source_ids": ["E01"], "target_id": "E12", "interpretation": "Hidden source"},
    {"source_ids": ["E01"], "target_id": "E02", "interpretation": " "},
])
def test_invalid_note_has_no_side_effect(player, note):
    assert player.act("notes", {"note": note}).status_code == 400
    assert not player.client.get("/api/bootstrap").json()["run"]["notes"]


def test_unlimited_attempts_and_retry_identity(player):
    command_id = str(uuid4())
    draft = player.run["draft"]
    revision = player.run["revision"]
    first = player.act("submit", {"draft": draft}, command_id=command_id).json()
    retried = player.act("submit", {"draft": draft}, command_id=command_id, expected=revision).json()
    assert retried["attempt_id"] == first["attempt_id"]
    second = player.act("submit", {"draft": draft}).json()
    assert second["attempt_id"] == first["attempt_id"] + 1
    assert len(player.client.get("/api/bootstrap").json()["attempts"]) == 2
    first_snapshot = player.client.get(f"/api/attempts/{first['attempt_id']}").json()
    assert first_snapshot["score"]["total"] == 0
    assert "rows" not in first_snapshot["score"]
    assert player.act("inspect", {"record_id": "E03"}).is_success


def test_attempts_never_change_after_discovery_or_draft_edit(player):
    old_id = player.act("submit", {"draft": player.run["draft"]}).json()["attempt_id"]
    original = player.client.get(f"/api/attempts/{old_id}").json()
    player.collect_all()
    assert player.act("draft", {"draft": complete_draft()}, method="put").is_success
    assert player.client.get(f"/api/attempts/{old_id}").json() == original
    new_id = player.act("submit", {"draft": complete_draft()}).json()["attempt_id"]
    assert player.client.get(f"/api/attempts/{new_id}").json()["score"]["total"] == 100


def test_reveal_is_explicit_and_does_not_grant_inventory_or_credit(player):
    assert player.act("reveal").status_code == 400
    attempt_id = player.act("submit", {"draft": player.run["draft"]}).json()["attempt_id"]
    assert player.client.get(f"/api/attempts/{attempt_id}/solution").status_code == 403
    assert player.act("reveal").is_success
    review = player.client.get(f"/api/attempts/{attempt_id}/solution").json()
    assert len(review["records"]) == 12 and review["testimony_review_only"]
    assert next(record for record in review["records"] if record["id"] == "E12")["review_only"]
    assert [record["id"] for record in player.run["records"]] == INITIAL
    assert player.client.get(f"/api/attempts/{attempt_id}").json()["score"]["total"] == 0
    assert player.act("submit", {"draft": player.run["draft"]}).is_success


def test_reset_retains_history_and_isolates_old_permissions(player):
    player.collect_all()
    player.act("interactions", {"character_id": "alex", "topic_id": "shift", "evidence_ids": ["E02", "E09"]})
    first_id = player.act("submit", {"draft": complete_draft()}).json()["attempt_id"]
    player.act("reveal")
    before = player.client.get(f"/api/attempts/{first_id}").json()
    old_id = player.run["id"]
    assert player.act("reset").is_success
    assert player.run["id"] != old_id and not player.run["solution_revealed"]
    assert [record["id"] for record in player.run["records"]] == INITIAL
    assert not player.run["notes"] and not player.run["conversations"]
    assert all(not record["inspected"] for record in player.run["records"])
    assert player.client.get(f"/api/runs/{old_id}").status_code == 409
    historical = player.client.get(f"/api/attempts/{first_id}").json()
    assert historical["draft"] == before["draft"] and historical["score"] == before["score"]
    assert not historical["is_current"]
    assert player.client.get(f"/api/attempts/{first_id}/solution").is_success
    assert player.act("submit", {"draft": complete_draft()}).status_code == 400
    second_id = player.act("submit", {"draft": player.run["draft"]}).json()["attempt_id"]
    assert second_id > first_id


def test_attempt_rows_are_immutable_and_persist_after_restart(player, tmp_path):
    attempt_id = player.act("submit", {"draft": player.run["draft"]}).json()["attempt_id"]
    path = player.client.app.state.game.store.path
    with sqlite3.connect(path) as db:
        with pytest.raises(sqlite3.IntegrityError):
            db.execute("UPDATE attempts SET snapshot='{}' WHERE id=?", (attempt_id,))
        with pytest.raises(sqlite3.IntegrityError):
            db.execute("DELETE FROM attempts WHERE id=?", (attempt_id,))
    with TestClient(create_app(path)) as reopened:
        assert reopened.get("/api/bootstrap").json()["run"]["id"] == player.run["id"]
        assert reopened.get(f"/api/attempts/{attempt_id}").json()["score"]["total"] == 0


def test_bulk_or_uncollected_citations_are_invalid_without_attempt(player):
    draft = copy.deepcopy(player.run["draft"])
    draft["fields"]["D03"]["citations"]["timing"] = [f"E{i:02d}" for i in range(1, 13)]
    assert player.act("submit", {"draft": draft}).status_code == 422
    draft["fields"]["D03"]["citations"]["timing"] = "E05"
    assert player.act("submit", {"draft": draft}).status_code == 400
    assert not player.client.get("/api/bootstrap").json()["attempts"]


def test_stale_changed_draft_rejected_but_identical_confirmations_ordered(player):
    revision = player.run["revision"]
    draft = copy.deepcopy(player.run["draft"])
    first = player.act("submit", {"draft": draft}).json()["attempt_id"]
    second = player.act("submit", {"draft": draft}, expected=revision).json()["attempt_id"]
    assert second > first
    different = copy.deepcopy(draft)
    different["explanation"] = "A stale edit"
    assert player.act("submit", {"draft": different}, expected=revision).status_code == 409
    assert player.act("draft", {"draft": different}, method="put", expected=revision).status_code == 409


def test_concurrent_fresh_confirmations_create_distinct_ordered_attempts(player):
    from concurrent.futures import ThreadPoolExecutor
    run_id, revision = player.run["id"], player.run["revision"]
    draft = copy.deepcopy(player.run["draft"])

    def confirm(_):
        return player.client.post(f"/api/runs/{run_id}/submit", json={
            "command_id": str(uuid4()), "expected_revision": revision, "draft": draft})

    with ThreadPoolExecutor(max_workers=2) as pool:
        replies = list(pool.map(confirm, range(2)))
    assert all(reply.is_success for reply in replies)
    ids = [reply.json()["attempt_id"] for reply in replies]
    assert len(set(ids)) == 2 and max(ids) == min(ids) + 1


def test_historical_sources_and_score_stay_frozen_after_authored_changes(player, monkeypatch):
    from witness import case
    player.collect_all()
    attempt_id = player.act("submit", {"draft": complete_draft()}).json()["attempt_id"]
    player.act("reveal")
    before = player.client.get(f"/api/attempts/{attempt_id}").json()
    changed = copy.deepcopy(case.RECORDS)
    changed["E05"]["body"] = ["Changed future authored record"]
    monkeypatch.setattr(case, "RECORDS", changed)
    monkeypatch.setattr(case, "CASE_VERSION", "future-version")
    assert player.client.get(f"/api/attempts/{attempt_id}").json() == before
