"""Exercise the connected prototype. Requires an explicitly disposable test service."""

import argparse
import json
import os
import re
from pathlib import Path
from uuid import uuid4

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "docs/verification"
PROOF = {
    "D01": ("Notification after an earlier absence", {"event": "E03", "procedure": "E04", "state": "E05"}),
    "D02_timing": ("During the condition check, before closure", {"state": "E05", "boundary": "E06"}),
    "D02_return": ("Not returned before closure", {"account": "E04", "state": "E05", "closure": "E06"}),
    "D03": ("Maya Chen", {"timing": "E05", "access": "E06", "identity": "E08"}),
    "D04": ("Left in the curator's cart", {"movement": "E08", "location": "E11"}),
    "D05": ("Alarm response", {"notification": "E03", "entry": "E07", "timing": "E05"}),
    "D06": ("Approved restart, required export skipped", {"procedure": "E04", "execution": "E10", "timing": "E05"}),
    "D07": ("Planned private sale", {"purpose": "E12", "connection": "E11"}),
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:3000")
    args = parser.parse_args()
    temp = ROOT / ".cache/browser-temp"
    temp.mkdir(parents=True, exist_ok=True)
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    os.environ["TEMP"] = os.environ["TMP"] = str(temp)
    checks, errors = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        assert context.request.get(args.url + "/api/health").json()["test_mode"], "Refusing to change a normal investigation. Start the disposable test service with WITNESS_TEST_MODE=1."

        def state(): return context.request.get(args.url + "/api/bootstrap").json()
        def ready(): expect(page.locator(".connection-banner")).to_have_count(0)
        def nav(label): page.locator("nav[aria-label='Main navigation']").get_by_role("button", name=re.compile(label)).click()
        def shot(name): page.screenshot(path=str(ARTIFACTS / name), full_page=True)

        existing = state()["run"]
        if existing:
            result = context.request.post(args.url + f"/api/runs/{existing['id']}/reset", data={"command_id": str(uuid4()), "expected_revision": existing["revision"]})
            assert result.ok
        page.goto(args.url, wait_until="networkidle")
        shot("archive-desktop.png")
        if page.get_by_role("button", name="Open investigation", exact=True).count():
            page.get_by_role("button", name="Open investigation", exact=True).click()
            expect(page.get_by_role("dialog")).to_be_visible()
            assert "Return to archive" in page.evaluate("document.activeElement.textContent")
            page.keyboard.press("Escape")
            expect(page.get_by_role("dialog")).to_have_count(0)
            page.get_by_role("button", name="Open investigation", exact=True).click()
            page.get_by_role("dialog").get_by_role("button", name="Begin investigation", exact=True).click()
        else:
            page.get_by_role("button", name="Resume investigation", exact=True).click()
        expect(page.get_by_role("heading", name="Every account has a gap.", exact=True)).to_be_visible()
        checks.append("Archive start/resume and safe briefing; dialog keyboard dismissal")

        page.get_by_label("Your question", exact=True).fill("Did you stay at the desk?")
        page.get_by_role("button", name="Send question", exact=True).click()
        expect(page.locator(".exchange")).to_have_count(1)
        expect(page.get_by_label("Your question", exact=True)).to_have_value("")
        shot("interview-desktop.png")
        checks.append("Free-text scripted question with one complete authored reply")

        nav("Final deduction")
        page.locator(".report-progress button").last.click()
        expect(page.get_by_role("heading", name="Review report", exact=True)).to_be_visible()
        page.get_by_role("button", name="Confirm submission", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Return to review", exact=True).click()
        before = len(state()["attempts"])
        page.get_by_role("button", name="Confirm submission", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Submit report", exact=True).dblclick()
        expect(page.locator(".result-score strong")).to_have_text("0")
        assert len(state()["attempts"]) == before + 1
        early_id = state()["attempts"][0]["id"]
        early = context.request.get(args.url + f"/api/attempts/{early_id}").json()
        assert "rows" not in early["score"]
        assert page.locator(".solution-review").count() == 0
        checks.append("Incomplete report; cancelled confirmation; double-click creates one attempt; no automatic spoilers")

        page.get_by_role("button", name="Continue investigation", exact=True).click()
        nav("Evidence & timeline")
        for record in ["E01", "E02", "E03", "E07"]:
            page.locator(".catalogue-record").filter(has_text=record).click()
            expect(page.locator(".catalogue-record").filter(has_text=record).locator(".read-state")).to_have_text("Opened")
        labels = ["Retrieve the maintenance work order", "Compare display-case access", "Inspect corridor recording",
                  "Check Alex's desk account", "Inspect maintenance execution", "Retrieve raw capsule occupancy history",
                  "Trace cart C2", "Review correspondence referencing VC-04"]
        for label in labels:
            page.locator(".lead-list").get_by_role("button", name=label, exact=True).click()
            expect(page.locator(".lead-list").get_by_role("button", name=label, exact=True)).to_have_count(0)
        assert len(state()["run"]["records"]) == 12
        assert context.request.get(args.url + f"/api/attempts/{early_id}").json() == early
        shot("evidence-desktop.png")
        checks.append("Normal dossier route retrieves all twelve records; discovery leaves original attempt unchanged")

        page.locator(".catalogue-record").filter(has_text="E05").click()
        page.locator(".reader-actions").get_by_role("button", name="Compare", exact=True).click()
        page.get_by_label("Compare with", exact=True).select_option("E04")
        expect(page.locator(".comparison-readers .record-paper")).to_have_count(2)
        page.get_by_role("button", name="Save an interpretation", exact=True).click()
        page.locator(".note-editor .check-row").filter(has_text="E06").get_by_role("checkbox").check()
        page.get_by_label("Your relation", exact=True).select_option("Contradicts")
        page.get_by_label("Specific claim or passage (optional)", exact=True).fill("Return sign-off")
        page.get_by_label("Your interpretation", exact=True).fill("The cradle stays absent after closure; this challenges the sign-off claim.")
        page.get_by_role("button", name="Save note", exact=True).click()
        expect(page.locator(".note-card")).to_have_count(1)
        expect(page.locator(".note-editor")).to_have_count(0)
        page.get_by_role("button", name="Edit note", exact=True).click()
        page.get_by_label("Your interpretation", exact=True).fill("A revised private comparison of the sensor, closure and signed return.")
        page.get_by_role("button", name="Save changes", exact=True).click()
        expect(page.locator(".note-card")).to_contain_text("A revised private comparison")
        checks.append("Focused comparison and multi-source directional note create/view/edit")

        nav("Interrogation")
        page.get_by_label(re.compile("Maya Chen.*Curator")).check()
        page.locator(".topic-list").get_by_role("button", name="Your condition check", exact=True).click()
        page.get_by_role("button", name="Present evidence", exact=True).click()
        for record in ["E04", "E05", "E06"]:
            page.locator(".evidence-checks label").filter(has_text=record).get_by_role("checkbox").check()
        page.get_by_role("button", name="Present to Maya", exact=True).click()
        expect(page.locator(".character-reply").last).to_contain_text("contradicts what I signed")
        expect(page.get_by_role("button", name="Later account available", exact=True)).to_be_visible()
        checks.append("Evidence presentation challenges Maya without a confession or rewritten initial statement")

        nav("Evidence & timeline")
        page.get_by_role("button", name="Timeline", exact=True).click()
        expect(page.locator(".timeline-event")).not_to_have_count(0)
        assert "Maya steals" not in page.locator(".timeline-list").inner_text()
        shot("timeline-desktop.png")
        checks.append("Source-labelled timeline remains distinct from hypotheses")

        nav("Final deduction")
        page.get_by_role("button", name="Report draft", exact=True).click()
        page.locator(".report-progress button").first.click()
        for section, keys in enumerate([["D01", "D02_timing", "D02_return"], ["D03", "D04"], ["D05", "D06", "D07"]]):
            for key in keys:
                answer, roles = PROOF[key]
                page.locator(".deduction-field").filter(has=page.locator(f"#{key}-{next(iter(roles))}")).get_by_role("radio", name=answer, exact=True).check()
                for role, record in roles.items():
                    page.locator(f"#{key}-{role}").select_option(record)
            if section == 2:
                page.get_by_label(re.compile("Your report explanation")).fill("The independent records support this reconstruction.")
            page.get_by_role("button", name="Continue", exact=True).click()
        expect(page.locator(".review-claim")).to_have_count(9)
        shot("report-review-desktop.png")
        page.get_by_role("button", name="Confirm submission", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Submit report", exact=True).click()
        expect(page.locator(".result-score strong")).to_have_text("100")
        full_id = state()["attempts"][0]["id"]
        full = context.request.get(args.url + f"/api/attempts/{full_id}").json()
        assert "notes" not in full and "A revised private" not in json.dumps(full)
        assert "rows" not in full["score"]
        shot("submission-desktop.png")
        checks.append("All eight claims and 21 independently selected roles produce 100; private notes excluded")

        nav("Evidence & timeline")
        page.get_by_role("button", name=re.compile("Your notes")).click()
        page.get_by_role("button", name="Delete", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Keep note", exact=True).click()
        expect(page.locator(".note-card")).to_have_count(1)
        page.get_by_role("button", name="Delete", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Delete note", exact=True).click()
        expect(page.locator(".note-card")).to_have_count(0)
        assert context.request.get(args.url + f"/api/attempts/{full_id}").json() == full
        checks.append("Note deletion/cancellation cannot alter evidence, draft or attempt")

        nav("Final deduction")
        page.get_by_role("button", name="Reveal solution · spoilers", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Reveal solution", exact=True).click()
        expect(page.locator(".score-breakdown")).to_be_visible()
        expect(page.locator(".solution-review")).to_be_visible()
        assert len(state()["run"]["records"]) == 12
        assert context.request.get(args.url + f"/api/attempts/{early_id}").json()["score"]["total"] == 0
        checks.append("Explicit spoiler reveal unlocks reasons/reconstruction without regrading old attempts")

        for width in [1440, 1200, 768, 390, 320]:
            page.set_viewport_size({"width": width, "height": 900})
            for label in ["Interrogation", "Evidence & timeline", "Final deduction"]:
                nav(label)
                assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"Horizontal overflow at {width} on {label}"
            if width == 390:
                nav("Interrogation"); shot("interview-mobile.png")
                nav("Evidence & timeline"); shot("evidence-mobile.png")
                nav("Final deduction"); shot("report-mobile.png")
        page.set_viewport_size({"width": 1440, "height": 1000})
        checks.append("All investigation views reflow at 320/390/768/1200/1440 CSS px with no horizontal page overflow")

        page.get_by_role("button", name="Replay this case", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Keep investigation", exact=True).click()
        assert len(state()["run"]["records"]) == 12
        page.get_by_role("button", name="Replay this case", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Reset investigation", exact=True).click()
        expect(page.get_by_role("heading", name="Every account has a gap.", exact=True)).to_be_visible()
        fresh = state()["run"]
        assert len(fresh["records"]) == 4 and not fresh["notes"] and not fresh["conversations"] and not fresh["solution_revealed"]
        assert all(not record["inspected"] for record in fresh["records"])
        assert len(state()["attempts"]) == before + 2
        checks.append("Replay cancellation/confirmation; fresh permissions and records; original submission history retained")

        page.reload(wait_until="networkidle")
        assert state()["run"]["id"] == fresh["id"]
        assert len(state()["attempts"]) == before + 2
        ready()
        assert not errors, errors
        checks.append("Page reload/resume; no browser JavaScript errors")
        result = {"browser": browser.version, "checks": checks, "passed": len(checks), "page_errors": errors}
        (ARTIFACTS / "browser-results.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(result, indent=2))
        browser.close()


if __name__ == "__main__": main()
