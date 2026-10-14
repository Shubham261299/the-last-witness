"""Real browser fault injection against an explicitly disposable local service."""

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
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        assert context.request.get(URL + "/api/health").json()["test_mode"], "Disposable test service required."

        def state(): return context.request.get(URL + "/api/bootstrap").json()
        def nav(label): page.locator("nav[aria-label='Main navigation']").get_by_role("button", name=re.compile(label)).click()
        def reconnect():
            page.get_by_role("button", name="Reconnect / retry", exact=True).click()
            expect(page.locator(".connection-banner")).to_have_count(0)

        run = state()["run"]
        if run:
            assert context.request.post(URL + f"/api/runs/{run['id']}/reset", data={"command_id": str(uuid4()), "expected_revision": run["revision"]}).ok
        else:
            assert context.request.post(URL + "/api/start", data={"command_id": str(uuid4())}).ok
        page.goto(URL + "#interview", wait_until="networkidle")
        expect(page.get_by_label("Your question", exact=True)).to_be_visible()

        def lose_ack(route):
            route.fetch()
            route.abort("failed")

        page.route("**/api/runs/*/interactions", lose_ack, times=1)
        page.get_by_label("Your question", exact=True).fill("Your shift?")
        page.get_by_role("button", name="Send question", exact=True).click()
        expect(page.locator(".connection-banner")).to_be_visible()
        page.get_by_label("Your question", exact=True).fill("A newer unsent question")
        page.get_by_label(re.compile("Maya Chen.*Curator")).check()
        reconnect()
        expect(page.locator(".exchange")).to_have_count(0)
        page.get_by_label(re.compile("Alex Reed.*Security guard")).check()
        expect(page.locator(".exchange")).to_have_count(1)
        expect(page.get_by_label("Your question", exact=True)).to_have_value("A newer unsent question")
        assert len(state()["run"]["conversations"]) == 1
        checks.append("Lost dialogue acknowledgement reconciles once, keeps newer text and preserves character attribution")

        nav("Evidence & timeline")
        page.locator(".reader-actions").get_by_role("button", name="Compare", exact=True).click()
        page.get_by_role("button", name="Save an interpretation", exact=True).click()
        page.get_by_label("Your interpretation", exact=True).fill("First saved interpretation")
        page.route("**/api/runs/*/notes", lose_ack, times=1)
        page.get_by_role("button", name="Save note", exact=True).click()
        expect(page.locator(".connection-banner")).to_be_visible()
        page.get_by_label("Your interpretation", exact=True).fill("Newer local interpretation")
        reconnect()
        expect(page.get_by_role("button", name="Save changes", exact=True)).to_be_visible()
        expect(page.get_by_label("Your interpretation", exact=True)).to_have_value("Newer local interpretation")
        page.get_by_role("button", name="Save changes", exact=True).click()
        expect(page.locator(".note-editor")).to_have_count(0)
        assert len(state()["run"]["notes"]) == 1
        assert state()["run"]["notes"][0]["interpretation"] == "Newer local interpretation"
        checks.append("Lost note-create acknowledgement recovers its ID; newer edit updates one note instead of creating another")

        nav("Final deduction")
        page.locator(".report-progress button").last.click()
        before = len(state()["attempts"])
        page.route("**/api/runs/*/submit", lose_ack, times=1)
        page.get_by_role("button", name="Confirm submission", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Submit report", exact=True).click()
        expect(page.locator(".connection-banner")).to_be_visible()
        expect(page.get_by_role("dialog").get_by_role("button", name="Submit report", exact=True)).to_be_disabled()
        page.get_by_role("dialog").get_by_role("button", name="Check saved action", exact=True).click()
        expect(page.get_by_role("dialog")).to_have_count(0)
        expect(page.locator(".result-score strong")).to_have_text("0")
        assert len(state()["attempts"]) == before + 1
        checks.append("Committed submission with lost acknowledgement opens its existing result and closes confirmation; no duplicate attempt")

        page.get_by_role("button", name="Report draft", exact=True).click()
        page.locator(".report-progress button").last.click()
        page.route("**/api/runs/*/submit", lambda route: route.abort("failed"), times=1)
        page.get_by_role("button", name="Confirm submission", exact=True).click()
        page.get_by_role("dialog").get_by_role("button", name="Submit report", exact=True).click()
        expect(page.locator(".connection-banner")).to_be_visible()
        assert len(state()["attempts"]) == before + 1
        page.get_by_role("dialog").get_by_role("button", name="Check saved action", exact=True).click()
        expect(page.get_by_role("dialog")).to_have_count(0)
        expect(page.locator(".result-score strong")).to_have_text("0")
        assert len(state()["attempts"]) == before + 2
        checks.append("Submission lost before server receipt retries the original confirmation exactly once")

        page.get_by_role("button", name="Report draft", exact=True).click()
        page.locator(".report-progress button").nth(2).click()
        explanation = page.get_by_label(re.compile("Your report explanation"))
        page.route("**/api/runs/*/draft", lambda route: route.abort("failed"), times=1)
        explanation.fill("Original queued draft")
        expect(page.locator(".connection-banner")).to_be_visible()
        explanation.fill("Newer draft written while disconnected")
        nav("Evidence & timeline")
        page.get_by_role("button", name="Records", exact=True).click()
        expect(page.locator(".record-paper").first).to_be_visible()
        reconnect()
        nav("Final deduction")
        expect(explanation).to_have_value("Newer draft written while disconnected")
        expect(page.locator(".topbar-status")).to_contain_text("Report saved locally")
        assert state()["run"]["draft"]["explanation"] == "Newer draft written while disconnected"
        assert len(state()["attempts"]) == before + 2
        checks.append("Disconnected reading and local report editing work; acknowledgement of older save preserves and then saves newer text")

        def competing_save(route):
            current = state()["run"]
            current["draft"]["explanation"] = "Another tab's confirmed report"
            assert context.request.put(URL + f"/api/runs/{current['id']}/draft", data={"command_id": str(uuid4()), "expected_revision": current["revision"], "draft": current["draft"]}).ok
            route.fulfill(response=route.fetch())

        page.route("**/api/runs/*", competing_save, times=1)
        explanation.fill("My conflicting local report")
        expect(page.get_by_role("button", name="Reload saved report", exact=True)).to_be_visible()
        assert state()["run"]["draft"]["explanation"] == "Another tab's confirmed report"
        expect(explanation).to_have_value("My conflicting local report")
        page.get_by_role("button", name="Reload saved report", exact=True).click()
        expect(explanation).to_have_value("Another tab's confirmed report")
        try:
            expect(page.get_by_role("button", name="Replay this case", exact=True)).to_be_enabled(timeout=5000)
        except AssertionError:
            print(page.locator("body").inner_text(), flush=True)
            raise
        checks.append("Another-tab draft conflict preserves both versions until explicit Reload saved draft; no silent overwrite")

        page.keyboard.press("Tab")
        assert page.evaluate("document.activeElement.tagName") != "BODY"
        page.get_by_role("button", name="Replay this case", exact=True).click()
        dialog = page.get_by_role("dialog")
        expect(dialog).to_be_visible()
        for _ in range(12):
            page.keyboard.press("Tab")
            assert page.evaluate("document.activeElement === document.body || !!document.activeElement.closest('dialog')")
        page.keyboard.press("Escape")
        expect(dialog).to_have_count(0)
        assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
        page.set_viewport_size({"width": 720, "height": 900})
        for label in ["Interrogation", "Evidence & timeline", "Final deduction"]:
            nav(label)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        checks.append("Keyboard dialog focus stays contained, Escape restores game, reduced-motion preference enabled, 200%-equivalent viewport reflows")
        nav("Evidence & timeline")
        page.get_by_role("button", name="Records", exact=True).click()
        contrast = page.evaluate("""() => {
            const rgb = text => (text.match(/[\\d.]+/g) || []).map(Number);
            const luminance = values => values.slice(0, 3).map(v => {
                v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
            }).reduce((total, v, i) => total + v * [.2126, .7152, .0722][i], 0);
            return Object.fromEntries(['.record-body p', '.source-provenance', '.source-limits p', '.record-meta dd', '.source-kind'].map(selector => {
                const node = document.querySelector(selector);
                let parent = node, background;
                while (parent) {
                    const values = rgb(getComputedStyle(parent).backgroundColor);
                    if (values.length === 3 || values[3] > 0) { background = values; break; }
                    parent = parent.parentElement;
                }
                const foreground = luminance(rgb(getComputedStyle(node).color)), bg = luminance(background);
                const ratio = (Math.max(foreground, bg) + .05) / (Math.min(foreground, bg) + .05);
                return [selector, {ratio: Math.round(ratio * 100) / 100, size: getComputedStyle(node).fontSize}];
            }));
        }""")
        assert all(sample["ratio"] >= 4.5 for sample in contrast.values()), contrast
        assert contrast[".record-body p"]["size"] == "16px"
        checks.append("Rendered source body, provenance, limits, time values and category labels exceed 4.5:1 text contrast")
        assert not errors, errors
        result = {"checks": checks, "passed": len(checks), "page_errors": errors,
                  "rendered_contrast": contrast,
                  "limits": "720 CSS px simulates reflow at 200% of a 1440px viewport; full assistive-technology and browser-zoom testing remain manual."}
        (ROOT / "docs/verification/recovery-results.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(result, indent=2))
        browser.close()


if __name__ == "__main__": main()
