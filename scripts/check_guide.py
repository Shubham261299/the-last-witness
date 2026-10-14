"""Verify spoiler-free guidance on a disposable game; no tests touch normal player data."""

import json
import os
import re
from pathlib import Path
from uuid import uuid4

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = "http://127.0.0.1:3000"


def main():
    temp = ROOT / ".cache/browser-temp"
    temp.mkdir(parents=True, exist_ok=True)
    os.environ["TEMP"] = os.environ["TMP"] = str(temp)
    checks, errors = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        assert context.request.get(URL + "/api/health").json()["test_mode"], "Disposable test backend required."

        def state(): return context.request.get(URL + "/api/bootstrap").json()
        existing = state()["run"]
        if existing:
            assert context.request.post(URL + f"/api/runs/{existing['id']}/reset", data={"command_id": str(uuid4()), "expected_revision": existing["revision"]}).ok
        else:
            assert context.request.post(URL + "/api/start", data={"command_id": str(uuid4())}).ok

        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        writes = []
        page.on("request", lambda request: writes.append(request.url) if request.method in {"POST", "PUT", "DELETE"} and "/api/" in request.url else None)

        def nav(label):
            page.locator("nav[aria-label='Main navigation']").get_by_role("button", name=re.compile(label)).click()

        def open_guide():
            page.get_by_role("button", name="How to investigate", exact=True).click()
            expect(page.get_by_role("dialog")).to_be_visible()

        def close_guide():
            page.get_by_role("dialog").get_by_role("button", name="Back to the game", exact=True).click()
            expect(page.get_by_role("dialog")).to_have_count(0)

        def help_summary(label):
            return page.locator(".help-tip summary").filter(has_text=label)

        page.goto(URL, wait_until="networkidle")
        initial = state()
        open_guide()
        assert page.evaluate("document.activeElement.getAttribute('aria-label')") == "Close dialog"
        chapters = page.get_by_role("navigation", name="Guide chapters").get_by_role("button")
        expect(chapters).to_have_count(6)
        for index in range(6):
            chapters.nth(index).click()
            expect(chapters.nth(index)).to_have_attribute("aria-current", "step")
            expect(page.locator(".guide-page .eyebrow")).to_contain_text(f"STEP {index + 1} OF 6")
            text = page.locator(".investigation-guide").inner_text()
            for secret in ["Maya Chen", "23:11:42", "$180,000", "E05", "E12", "west service alcove"]:
                assert secret not in text, secret
        chapters.first.click()
        page.get_by_role("button", name="Next step", exact=True).click()
        expect(chapters.nth(1)).to_have_attribute("aria-current", "step")
        page.get_by_role("button", name="Previous step", exact=True).click()
        expect(chapters.first).to_have_attribute("aria-current", "step")
        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog")).to_have_count(0)
        assert page.evaluate("document.activeElement.textContent").strip().endswith("How to investigate")
        assert state() == initial and not writes
        checks.append("Six spoiler-free chapters, next/previous, default safe focus, Escape restoration; no game writes or state changes")

        page.get_by_role("button", name="Dismiss this screen's hint", exact=True).click()
        expect(page.locator(".guide-hint strong")).to_have_count(0)
        page.reload(wait_until="networkidle")
        expect(page.locator(".guide-hint strong")).to_have_count(0)
        open_guide()
        close_guide()
        checks.append("Screen hint dismissal survives reload; the guide remains reopenable")

        open_guide()
        chapters = page.get_by_role("navigation", name="Guide chapters").get_by_role("button")
        chapters.nth(1).click()
        page.get_by_role("dialog").get_by_role("button", name="Open Evidence & timeline", exact=True).click()
        expect(page.get_by_role("heading", name="Follow the records.", exact=True)).to_be_visible()
        expect(page.get_by_role("dialog")).to_have_count(0)
        help_summary("How record requests work").click()
        expect(page.locator(".help-tip[open]:visible")).to_contain_text("Follow a lead")
        assert state() == initial and not writes
        checks.append("Guide navigation reaches Records; record-request help opens without inspection, collection or report changes")

        nav("Interrogation")
        help_summary("How to question and present evidence").click()
        expect(page.locator(".help-tip[open]:visible")).to_contain_text("explicitly presented together")
        nav("Evidence & timeline")
        page.get_by_role("button", name="Timeline", exact=True).click()
        help_summary("How this timeline works").click()
        expect(page.locator(".help-tip[open]:visible")).to_contain_text("do not need to drag")
        page.get_by_role("button", name=re.compile("Your notes")).click()
        help_summary("How private notes work").click()
        expect(page.locator(".help-tip[open]:visible")).to_contain_text("excluded from submissions")
        nav("Final deduction")
        help_summary("How to cite evidence").click()
        expect(page.locator(".help-tip[open]:visible")).to_contain_text("several roles can require several sources")
        assert state() == initial and not writes
        checks.append("Questioning, evidence gating, timeline, private notes and per-role citations explain current mechanics without mutations")

        page.get_by_role("button", name=re.compile("^Submissions")).click()
        help_summary("What happens after submission").click()
        expect(page.locator(".help-tip[open]:visible")).to_contain_text("never regrades")
        assert state() == initial and not writes
        page.get_by_role("button", name="Report draft", exact=True).click()
        page.locator(".report-progress button").last.click()
        expect(page.get_by_role("heading", name="Review report", exact=True)).to_be_visible()
        expect(page.locator(".topbar-status")).to_contain_text("Report saved locally")
        before_review_help = state()
        help_summary("How to review and submit").click()
        expect(page.locator(".help-tip[open]:visible")).to_contain_text("does not create an attempt")
        assert state() == before_review_help
        assert len(state()["attempts"]) == len(initial["attempts"])
        checks.append("Review and history help distinguish draft saving, confirmation, frozen attempts, continued play and spoiler reveal")

        nav("Evidence & timeline")
        page.get_by_role("button", name="Records", exact=True).click()
        page.locator(".reader-actions").get_by_role("button", name="Compare", exact=True).click()
        expect(page.locator(".comparison-readers .record-paper")).to_have_count(2)
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("button", name="Replay this case", exact=True)).to_be_enabled()
        before_compare_help = state()
        help_summary("How to compare sources").click()
        expect(page.locator(".help-tip[open]:visible")).to_contain_text("private note")
        assert state() == before_compare_help
        assert not state()["run"]["notes"]
        checks.append("Focused comparison help explains claim-level reasoning without creating a note or scoring it")

        for width in [1440, 768, 390, 320]:
            page.set_viewport_size({"width": width, "height": 900})
            for label in ["Case archive", "Interrogation", "Evidence & timeline", "Final deduction"]:
                nav(label)
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), (width, label)
                open_guide()
                expect(page.get_by_role("heading", name="First-time investigation guide", exact=True)).to_be_in_viewport()
                assert page.evaluate("document.querySelector('dialog').scrollWidth <= document.querySelector('dialog').clientWidth"), (width, "guide")
                page.keyboard.press("Tab")
                assert page.evaluate("document.activeElement === document.body || !!document.activeElement.closest('dialog')")
                if width == 390 and label == "Case archive":
                    page.screenshot(path=str(ROOT / "docs/verification/guide-mobile.png"), full_page=True)
                close_guide()
        page.set_viewport_size({"width": 1440, "height": 1000})
        nav("Case archive")
        open_guide()
        page.screenshot(path=str(ROOT / "docs/verification/guide-desktop.png"), full_page=True)
        close_guide()
        checks.append("All four screens and guide reflow at 320/390/768/1440px; keyboard focus stays within the dialog")

        before_offline = state()
        page.route("**/api/**", lambda route: route.abort("failed"))
        page.reload(wait_until="networkidle")
        expect(page.locator(".connection-banner")).to_be_visible()
        open_guide()
        expect(page.locator(".guide-chapter")).to_have_count(6)
        close_guide()
        assert state() == before_offline
        checks.append("Guide remains usable when the backend is disconnected; no fake progress or attempts")
        assert not errors, errors
        result = {"passed": len(checks), "checks": checks, "page_errors": errors}
        (ROOT / "docs/verification/guide-results.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(result, indent=2))
        browser.close()


if __name__ == "__main__": main()
