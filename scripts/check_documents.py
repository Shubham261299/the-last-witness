"""Check local documentation links, case export identity and acceptance traceability."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
files = [ROOT / name for name in ["README.md", "AGENTS.md", "project.md"]]
files += list((ROOT / "docs").rglob("*.md"))
broken = []
for file in files:
    text = file.read_text(encoding="utf-8")
    for target in re.findall(r"\]\(([^)]+)\)", text):
        if target.startswith(("http:", "https:", "#", "app:")):
            continue
        target = target.split("#")[0]
        if target and not (file.parent / target).exists():
            broken.append((str(file.relative_to(ROOT)), target))
assert not broken, broken
content = json.loads((ROOT / "backend/witness/content/case001.json").read_text(encoding="utf-8"))
assert set(content["records"]) == {f"E{i:02d}" for i in range(1, 13)}
assert len(content["profiles"]) == 29 and len(content["solution"]) == 5
case_text = (ROOT / "docs/case-001/CASE_DESIGN.md").read_text(encoding="utf-8")
assert "no forged-account subplot is permitted" in case_text
assert "The correspondent never appears in the museum." in case_text
safe = json.dumps(content["records"])
assert "subplot" not in safe and "correspondent never appears" not in safe
mapping = (ROOT / "docs/V1_ACCEPTANCE_MAP.md").read_text(encoding="utf-8")
ids = re.findall(r"^\| ((?:P|L|S|RY|CN|AT|U)\d{2}) \|", mapping, re.M)
assert len(ids) == 116 and len(set(ids)) == 116
assert sum(item.startswith("U") for item in ids) == 18
print(f"PASS: {len(files)} Markdown files have valid local links; 12 records/29 profiles/5 solution paragraphs; 116 unique mapped scenarios; author-only E12 boundaries preserved.")
