"""Read-only check of the normal launch; does not start, reset or submit a run."""

import json
import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
temp = ROOT / ".cache/browser-temp"
temp.mkdir(parents=True, exist_ok=True)
os.environ["TEMP"] = os.environ["TMP"] = str(temp)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    health = context.request.get("http://127.0.0.1:3000/api/health").json()
    before = context.request.get("http://127.0.0.1:3000/api/bootstrap").json()
    assert not health["test_mode"]
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto("http://127.0.0.1:3000", wait_until="networkidle")
    label = "Resume investigation" if before["run"] else "Open investigation"
    expect(page.get_by_role("button", name=label, exact=True)).to_be_visible()
    expect(page.locator(".connection-banner")).to_have_count(0)
    after = context.request.get("http://127.0.0.1:3000/api/bootstrap").json()
    assert before == after and not errors
    if not before["run"] and not before["attempts"]:
        page.screenshot(path=str(ROOT / "docs/verification/archive-desktop.png"), full_page=True)
    result = {"passed": True, "production_frontend": True, "normal_backend": True,
              "test_mode": health["test_mode"], "dialogue_mode": health["dialogue_mode"],
              "fresh_first_run": before["run"] is None and not before["attempts"],
              "player_data_unchanged": before == after, "page_errors": errors}
    (ROOT / "docs/verification/handover-results.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))
    browser.close()
