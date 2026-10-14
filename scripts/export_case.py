"""Export explicitly selected author content into backend-only case data."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
text = (ROOT / "docs/case-001/CASE_DESIGN.md").read_text(encoding="utf-8")
dialogue = (ROOT / "docs/case-001/CHARACTER_DIALOGUE.md").read_text(encoding="utf-8")
records = {}
kinds = {
    "E01": "Recorded observation", "E02": "Statement", "E03": "Machine record",
    "E04": "Procedure and statement", "E05": "Machine record", "E06": "Machine record",
    "E07": "Machine record", "E08": "Recorded observation", "E09": "Machine record",
    "E10": "Machine record", "E11": "Recorded observation", "E12": "Correspondence",
}
times = {
    "E01": ("23:40", "23:17:00–23:17:14"), "E02": ("23:35", "Opening accounts"),
    "E03": ("23:28", "23:17:00"), "E04": ("22:55; sign-off 23:12:16", "23:10–23:17"),
    "E05": ("23:29", "23:09:00–23:25:00"), "E06": ("Response-team export", "23:10:55–23:25:00"),
    "E07": ("Response-team export", "23:16:50–23:18:00"),
    "E08": ("Preserved recording", "23:09–23:14; 23:17:02–23:18"),
    "E09": ("23:38; witnessed at collection", "23:14:08–23:16:56"),
    "E10": ("23:30", "23:14:00–23:17:02"), "E11": ("Response-team property report", "23:22; 23:26"),
    "E12": ("23:45 export", "19:42"),
}
for match in re.finditer(r"^### (E\d{2}) — ([^\n]+)\n(.*?)(?=^### |^## |\Z)", text, re.M | re.S):
    record_id, title, section = match.groups()
    source = re.search(r"^- Source: (.+)$", section, re.M)[1]
    limitation = re.search(r"^- Reliability(?: \(player-visible\))?: (.+)$", section, re.M)[1]
    limitation = limitation.replace(" Do not mark lies in the player's initial presentation.", "")
    limitation = limitation.replace(" Do not name an uncollected supporting record in the player's reliability text.", "")
    if record_id == "E12":
        source = source.replace("; no forged-account subplot is permitted", "")
        limitation = limitation.replace(" The correspondent never appears in the museum.", "")
    if record_id == "E02":
        body = [re.search(rf"^- {name}: “(.+)”$", section, re.M)[1] for name in ("Alex", "Maya", "Daniel")]
        body = [f"{name} — {quote}" for name, quote in zip(("Alex Reed", "Maya Chen", "Daniel Morgan"), body)]
    elif record_id == "E05":
        body = re.findall(r'^  - “(.+)”\.?$', section, re.M)
    elif record_id == "E08":
        body = [re.search(r"^- Player content: (.+)$", section, re.M)[1]]
    else:
        body = [re.search(r"^- Player content: “(.+?)”", section, re.M)[1]]
    if record_id == "E01":
        body += [
            "The staff corridor connects the security desk, North Gallery, conservation bay and equipment room. The gallery has one usable entrance, a glass-panelled door from the corridor, and no other usable exit or opening. The display case has a separate keyed lid.",
            "The corridor camera covers the gallery threshold and identifies people at the case through the glass panels. Small objects and hands behind a cart may be obscured. Gallery credentials and display keys are separate; ownership alone does not identify a holder.",
            "All machine times are museum local time, 12 October 2026, verified within one second. Logs are authentic response-team exports. Testimony remains fallible. Capsule VC-04 has an engraved serial and a tamper-evident seal; the inventory identifies the Vesper Diamond inside.",
        ]
    if record_id == "E03":
        body += ["Legend: this is the time the notification was emitted, not a measurement of the first absent state."]
    if record_id == "E04":
        body += ["Maya Chen's signed entry — " + re.search(r"^- Signed entry: “(.+)”", section, re.M)[1]]
    if record_id == "E07":
        body += ["Coverage: alarm-response interval only, not the full evening. This controller records the gallery door, not the display-case lid."]
    if record_id == "E09":
        body += ["The call end, 23:16:48, is calculated from start 23:14:12 plus duration 02:36. This record contains neither audio nor location data."]
    records[record_id] = {
        "id": record_id, "title": title, "kind": kinds[record_id], "source": source,
        "created_at": times[record_id][0], "event_range": times[record_id][1],
        "body": body, "limitation": limitation,
    }

profiles = {}
for row in dialogue.splitlines():
    if re.match(r"^\| [AMN]\d{2} —", row):
        profile = re.search(r"[AMN]\d{2}", row)[0]
        profiles[profile] = re.search(r"“(.+?)”", row)[1]

solution = []
for paragraph in text.splitlines():
    if paragraph.startswith("> ") and "The combined evidence establishes" in paragraph:
        start = text.index(paragraph)
        solution = [line[2:] for line in text[start:].splitlines() if line.startswith("> ")]
        break
assert len(records) == 12 and len(profiles) == 29 and len(solution) == 5
destination = ROOT / "backend/witness/content/case001.json"
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps({"records": records, "profiles": profiles, "solution": solution}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Exported 12 player-safe records, 29 private reply profiles and the private reconstruction.")
