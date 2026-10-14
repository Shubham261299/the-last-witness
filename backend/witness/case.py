"""Authored case configuration. Scoring keys never leave this module."""

import copy
import json
from pathlib import Path

CASE_VERSION = "case001-v1.0"
RUBRIC_VERSION = "roles-v1.0"
CONTENT = json.loads((Path(__file__).parent / "content/case001.json").read_text(encoding="utf-8"))
RECORDS = CONTENT["records"]
PROFILES = CONTENT["profiles"]
SOLUTION = CONTENT["solution"]
INITIAL = ["E01", "E02", "E03", "E07"]
CASE = {
    "id": "case-001", "title": "The 11:17 Incident", "setting": "Bellwether Museum",
    "duration": "10–20 minutes", "date": "12 October 2026", "review_time": "00:05 · 13 October 2026",
    "brief": [
        "At 11:17 PM, an alarm sounded in the Bellwether Museum's North Gallery. The Vesper Diamond was gone from its locked display case.",
        "The gallery camera had been offline for three minutes. A security credential opened the gallery door seconds after the alarm. Three members of staff were working nearby: the guard, the curator, and the technician.",
        "Their statements are on your desk. So are the first incident records. Establish when the diamond disappeared, who removed it, and which evidence supports your conclusion.",
    ],
}
CHARACTERS = [
    {"id": "alex", "name": "Alex Reed", "role": "Security guard", "initial_statement": RECORDS["E02"]["body"][0],
     "topics": [{"id": k, "label": v} for k, v in [
         ("shift", "Your shift"), ("badge", "Your badge entry"), ("found", "What you found"),
         ("camera", "The camera gap"), ("timing", "Record timing"), ("conclusion", "Your conclusion")]]},
    {"id": "maya", "name": "Maya Chen", "role": "Curator", "initial_statement": RECORDS["E02"]["body"][1],
     "topics": [{"id": k, "label": v} for k, v in [
         ("check", "Your condition check"), ("cart", "Your conservation cart"), ("window", "The work window"),
         ("correspondence", "Correspondence"), ("conclusion", "Your conclusion")]]},
    {"id": "daniel", "name": "Daniel Morgan", "role": "Systems technician", "initial_statement": RECORDS["E02"]["body"][2],
     "topics": [{"id": k, "label": v} for k, v in [
         ("maintenance", "Your maintenance work"), ("notification", "Notification times"),
         ("scope", "What the reboot affects"), ("compare", "Compare record times"), ("conclusion", "Your conclusion")]]},
]
REQUESTS = {
    "R01": ("E04", ["E03"], "Retrieve the maintenance work order"),
    "R02": ("E05", ["E03", "E04"], "Retrieve raw capsule occupancy history"),
    "R03": ("E06", ["E07"], "Compare display-case access"),
    "R04": ("E08", ["E07"], "Inspect corridor recording"),
    "R05": ("E09", ["E02"], "Check Alex's desk account"),
    "R06": ("E10", ["E04"], "Inspect maintenance execution"),
    "R07": ("E11", ["E08"], "Trace cart C2"),
    "R08": ("E12", ["E11"], "Review correspondence referencing VC-04"),
}


def field(key, label, section, points, correct, roles, partial, partial_points, options):
    return {"id": key, "label": label, "section": section, "max_points": points,
            "correct": correct, "roles": roles, "partial": partial,
            "partial_points": partial_points, "options": options}


# Role tuples are (key, public label, private acceptable source).
FIELDS = [
    field("D01", "What does the 23:17 entry establish?", 0, 15, "delayed",
          [("event", "Reported event", "E03"), ("procedure", "Procedure", "E04"), ("state", "Recorded state", "E05")],
          ["event", "procedure"], 8, [("removal", "Removal time"), ("delayed", "Notification after an earlier absence")]),
    field("D02_timing", "When does the evidence place the removal?", 0, 15, "check",
          [("state", "Recorded state", "E05"), ("boundary", "Interval boundary", "E06")], ["state"], 8,
          [("check", "During the condition check, before closure"), ("gap", "During the camera gap"), ("entry", "After Alex's entry")]),
    field("D02_return", "How does the return account compare with the records?", 0, 10, "not_returned",
          [("account", "Account and obligation", "E04"), ("state", "Recorded state", "E05"), ("closure", "Closure", "E06")],
          ["account", "state"], 5, [("returned", "Returned before closure"), ("not_returned", "Not returned before closure")]),
    field("D03", "Who, if anyone, does the evidence identify?", 1, 25, "maya",
          [("timing", "Removal timing", "E05"), ("access", "Display access", "E06"), ("identity", "Physical identity", "E08")],
          ["access", "identity"], 10, [("alex", "Alex Reed"), ("maya", "Maya Chen"), ("daniel", "Daniel Morgan")]),
    field("D04", "Where does the evidence place the capsule afterward?", 1, 15, "cart",
          [("movement", "Observed movement", "E08"), ("location", "Object location", "E11")], ["location"], 7,
          [("cart", "Left in the curator's cart"), ("alex", "Left with Alex"), ("daniel", "Moved by Daniel")]),
    field("D05", "What does Alex's entry establish?", 2, 5, "response",
          [("notification", "Notification", "E03"), ("entry", "Entry", "E07"), ("timing", "Wider timing", "E05")],
          ["notification", "entry"], 2, [("response", "Alarm response"), ("opening", "Display-case opening"), ("removal", "Time of removal")]),
    field("D06", "How does the maintenance account compare with the records?", 2, 5, "skipped",
          [("procedure", "Authorized procedure", "E04"), ("execution", "Actual execution", "E10"), ("timing", "Wider timing", "E05")],
          ["procedure", "execution"], 2, [("skipped", "Approved restart, required export skipped"), ("deleted", "Theft footage deleted"), ("consistent", "No discrepancy")]),
    field("D07", "What, if anything, establishes intent?", 2, 10, "sale",
          [("purpose", "Expressed purpose", "E12"), ("connection", "Connection to the missing object", "E11")], ["purpose"], 5,
          [("sale", "Planned private sale"), ("relocation", "Authorized relocation"), ("accident", "Accidental misplacement")]),
]
FIELD_MAP = {item["id"]: item for item in FIELDS}


def public_fields(collected):
    result = []
    for item in FIELDS:
        options = []
        for key, label in item["options"]:
            if item["id"] == "D01" and key == "delayed" and not {"E04", "E05"} & set(collected):
                continue
            if item["id"] == "D06" and key in {"skipped", "deleted"} and "E10" not in collected:
                continue
            if item["id"] == "D07" and key == "sale" and "E12" not in collected:
                continue
            options.append({"value": key, "label": label})
        result.append({"id": item["id"], "label": item["label"], "section": item["section"],
                       "max_points": item["max_points"], "options": options + [{"value": "unknown", "label": "Unestablished"}],
                       "roles": [{"key": key, "label": label} for key, label, _ in item["roles"]]})
    return result


def blank_draft():
    return {"fields": {item["id"]: {"choice": "unknown", "citations": {role[0]: None for role in item["roles"]}} for item in FIELDS},
            "explanation": "", "section": 0}


def new_state():
    return {"collected": INITIAL.copy(), "inspected": [], "conversations": [], "delivered": [],
            "flags": [], "notes": [], "draft": blank_draft(), "pending": None}


def score(draft):
    rows = []
    for item in FIELDS:
        claim = draft["fields"][item["id"]]
        supported = {key for key, _, record in item["roles"] if claim["citations"][key] == record}
        points = 0
        if claim["choice"] == item["correct"]:
            if supported == {role[0] for role in item["roles"]}:
                points = item["max_points"]
            elif supported == set(item["partial"]):
                points = item["partial_points"]
        rows.append({"id": item["id"], "label": item["label"], "points": points, "max_points": item["max_points"],
                     "required": [{"role": label, "record_id": record} for _, label, record in item["roles"]],
                     "reason": "Full evidence support" if points == item["max_points"] else "Partial evidence support" if points else "Conclusion or supporting roles unestablished"})
    total = sum(row["points"] for row in rows)
    core = all(next(r for r in rows if r["id"] == key)["points"] == FIELD_MAP[key]["max_points"] for key in ["D01", "D02_timing", "D03"])
    outcome = "Inconclusive report"
    if total >= 70 and core:
        outcome = "Case established — " + ("comprehensive reconstruction" if total >= 90 else "supported reconstruction")
    elif total >= 40:
        outcome = "Incomplete reconstruction"
    culprit = draft["fields"]["D03"]["choice"]
    accusation = "Accusation unsupported" if culprit in {"alex", "daniel"} else "No supported accusation submitted" if culprit == "unknown" else None
    return {"total": total, "outcome": outcome, "accusation": accusation, "rows": rows, "core_proof": core}


# Each observation is independently projected; shared T IDs group sources without promoting inference to fact.
OBSERVATIONS = [
    ("T01", "19:42", "E12", "Correspondence", "Maya proposes a private sale, with payment due at future collection after inspection."),
    ("T02", "22:55", "E04", "Procedure", "Combined work order approved for the condition check and recorder restart."),
    ("T03", "23:09:30", "E08", "Recorded observation", "Maya enters the empty gallery with C2."),
    ("T04", "23:10:00", "E04", "Procedure", "Scheduled absence-notification hold begins; raw sensor logging continues."),
    ("T04", "23:10:00", "E05", "Machine record", "Controller logs notification hold ON and sensor logging ACTIVE."),
    ("T05", "23:10:55", "E06", "Machine record", "Display-case lid opens using assigned key M-1; assignment alone does not identify its holder."),
    ("T06", "23:10:55–23:12:10", "E08", "Recorded observation", "Maya is the sole recorded occupant at the case. Hands and capsule are obscured."),
    ("T06", "23:11:42", "E05", "Machine record", "Cradle sensor changes from present to absent and remains absent through 23:25."),
    ("T07", "23:12:10", "E06", "Machine record", "Display-case lid closes and locks; no later opening through 23:25."),
    ("T07", "23:12:16", "E04", "Statement", "Maya signs a confirmation claiming VC-04 was returned before closure."),
    ("T08", "23:12:28", "E08", "Recorded observation", "Maya leaves with C2; gallery empty afterward. Cart reaches the bay at 23:13:04."),
    ("T09", "23:14:00–23:17:02", "E10", "Machine record", "Recorder reboot runs; export was skipped. Preserved archive remains intact."),
    ("T09", "23:14:00–23:17:02", "E08", "Recorded observation", "Footage unavailable in this interval; recording resumes at 23:17:02. Unseen events remain unknown."),
    ("T09", "23:14:12–23:16:48", "E09", "Machine record", "Alex's call begins at 23:14:12; end calculated from 02:36 duration. No location or audio."),
    ("T10", "23:17:00", "E03", "Machine record", "Capsule-absence notification emitted."),
    ("T10", "23:17:00", "E05", "Machine record", "Notification hold expires and emits the current absent state."),
    ("T11", "23:17:06", "E07", "Machine record", "A-2 credential assigned to Alex grants gallery entry; door opens at 23:17:07."),
    ("T11", "23:17:06", "E08", "Recorded observation", "Restored footage identifies Alex entering the gallery."),
    ("T11", "23:17:14", "E01", "Statement", "Alex reports the capsule missing through the closed lid."),
    ("T12", "23:22:00 / 23:26:00", "E11", "Recorded observation", "C2 is secured, then opened by responders. Sealed VC-04 is recovered and inventoried."),
]


def player_projection(state):
    collected = state["collected"]
    records = [dict(copy.deepcopy(RECORDS[key]), inspected=key in state["inspected"]) for key in collected]
    leads = [{"id": key, "label": label, "source_ids": needed, "retrieved": record in collected}
             for key, (record, needed, label) in REQUESTS.items() if set(needed) <= set(state["inspected"])]
    observations = [{"id": event, "time": time, "source_id": source, "kind": kind, "text": body}
                    for event, time, source, kind, body in OBSERVATIONS if source in collected]
    if "A05" in state["flags"]:
        observations.append({"id": "T09", "time": "23:14:12–23:16:48", "source_id": "E09", "kind": "Corrected testimony",
                             "text": "Alex admits taking the call in the west service alcove; this location is testimony, not call metadata."})
    observations.sort(key=lambda entry: entry["time"])
    return {"records": records, "leads": leads, "timeline": observations, "conversations": copy.deepcopy(state["conversations"]),
            "notes": copy.deepcopy(state["notes"]), "draft": copy.deepcopy(state["draft"]),
            "report_fields": public_fields(collected), "pending": bool(state["pending"]),
            "pending_character_id": state["pending"]["character"] if state["pending"] else None,
            "pending_command_id": state["pending"]["command_id"] if state["pending"] else None}
