# V1 verification and handover

Local V1 implements the approved fixed Case 001. This report separates executed checks from unverified setup, assistive-technology and pacing claims. No public deployment, extra case, model download or cloud inference was performed.

## Executed checks — 14 October 2026

| Check | Result / evidence |
|---|---|
| Python game/API/dialogue suite | 170 passed. Every full/partial/other proof subset, wrong-role and irrelevant-role support, worked scores, hidden projections, note exclusion, immutable attempts, restart, concurrent confirmations and replay guards are covered |
| TypeScript | `npm --prefix frontend run typecheck` passed |
| ESLint | `npm --prefix frontend run lint` passed with existing Windows native resolver; no pending postinstall approval |
| Formatting | `npm --prefix frontend run format:check` passed |
| Production build | Next 16.4.0 optimized build passed; production server launches on localhost:3000 |
| Full Chromium browser flow | 13 checks passed, no JavaScript page errors. Start, scripted interview, initial 0-point report, all twelve sources, note CRUD, challenge, timeline, 21 deliberate roles / 100-point report, explicit reveal, continued play and history-preserving replay. 320/390/768/1200/1440 CSS px without horizontal page overflow. [Results](verification/browser-results.json) |
| Chromium failure/recovery | 8 checks passed, no JavaScript page errors. Lost dialogue/note/submission acknowledgements, not-yet-received submission retry, disconnected reading/editing, newer queued edits and another-tab conflict tested. Keyboard dialog containment/Escape and reduced-motion preference checked. Five source-text samples measure 8.54–14.17:1 contrast. [Results](verification/recovery-results.json) |
| Local candidate comparison | Four real routed questions each on installed Qwen 2.5 14B and Llama 3.1 8B. Qwen exact intended topic 3/4 (hostile request safely clarified); Llama 4/4. All eight replies stayed authored and bounded. Median 3.854s versus 2.977s; maximum sample 14.640s versus 9.626s. Small sample, not a p95 or a reliability guarantee. [Results](verification/model-results.json) |
| Real model through application API | Llama 3.1 8B produced one committed authored reply, no evidence unlock, no pending interaction, and persisted through factory/service restart. [Results](verification/live-api-results.json) |
| Source export | Twelve player-safe records, 29 private authored profiles and five private reconstruction paragraphs exported. E12 author boundary annotations separated from player source/limits; case facts preserved |
| Dependency compatibility | Installed direct/transitive Python closure satisfies its package requirements; exact 23-package Windows/Python 3.13 lock recorded. Matching Next/ESLint config retained. Online npm audit unavailable in agent sandbox; user supplied five-high summary |
| Documentation / launch | 12 Markdown files have valid local links; 116 unique scenario mappings; PowerShell launch/setup scripts parse; documented test and production backend launch command exercised |
| Normal handover | Production frontend and normal backend running; test mode false, Ollama available, clean first-run archive, no JavaScript errors, read-only check leaves player data unchanged. [Results](verification/handover-results.json) |

Browser walkthroughs use disposable data and refuse a normal service. Screenshots capture that test investigation, not user history. The production frontend can connect to either test or normal backend without rebuilding because both bind the documented localhost endpoint.

## Remaining limitations

- **Fresh isolated installation:** Network downloads are blocked in the sandbox. Python verification used a virtual environment with access to existing system packages; the pinned compatible closure and setup script are provided, but a fresh isolated network install has not been executed. npm install succeeded in the user's terminal. No claim of an independently reproduced fresh npm ci installation.
- **npm advisory:** Five reported high findings remain in the development lint chain ending in braces 3.0.3. The current [reviewed advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) lists no patched version. The known chain is absent from `npm ls braces --omit=dev`; player input never becomes a lint glob. This does not remove the dependency finding or constitute a complete production security assessment. No force-downgrade, custom fork or pending install-script approval. [Details](DEPENDENCY_REVIEW.md).
- **Accessibility/device review:** Real desktop Chromium viewport checks, native keyboard dialogs, visible focus, source text alternatives, reduced-motion preference and sample rendered text contrast were checked. A 720 CSS px viewport checks reflow equivalent to 200% of 1440px. Actual browser zoom, NVDA/VoiceOver, physical mobile software keyboards, Safari/Firefox and complete assistive-technology review remain unexecuted. No WCAG certification claim.
- **First-time pacing:** No independent first-time player was available. The 10–20 minute target and 21 source-role workload remain unmeasured. Author/automated walkthroughs are not a pacing playtest.
- **Live model sample:** Candidate evaluation is eight questions plus one real application API reply. The comprehensive safety boundary is authored rendering and deterministic eligibility, not a claim that every natural-language topic choice is accurate. Compound/unrelated requests can require clarification. Ollama outage/malformed output/deadline and player-requested authored completion are automated regression cases.
- **Coverage:** [98 case / 18 UI mapping](V1_ACCEPTANCE_MAP.md) records partial/manual permutations. Do not interpret the scenario count as 116 separately passed browser tests.

## Handover

Use [README](../README.md) to start backend and frontend, configure an installed model or scripted mode, run checks and play. Normal data is `backend/data/witness.db`; test data stays under `.cache`. Replay retains historical attempts. No database deletion is required or part of normal setup.

The next review is the user's first playthrough, focusing on clarity, reading effort and the report. Public deployment, additional cases or unrestricted generated dialogue require separate decisions.

## First-time guide update — 14 October 2026

Added a six-step spoiler-free walkthrough accessible from every screen, dismissible browser-local screen hints, and expandable contextual help for records, interrogation, comparison, timeline, private notes, citations, review and results. The guide uses existing native dialogs; its close control receives initial focus and the guide is centered. No case facts, backend rules, rubric, dependencies or normal game data were changed by the feature.

Eight dedicated Chromium guide checks pass with no page errors: disclosure safety, unchanged game state, dismissal/reopen, screen navigation, contextual help, review/history distinctions, comparison, keyboard/mobile reflow and disconnected use. Tested widths: 320/390/768/1440 CSS px. Type, lint, formatting and production build checks pass. The complete scripted investigation browser flow also passes its 13 checks, including 100-point reporting and replay. Full screen-reader review remains outside these checks.

Evidence: [guide results](verification/guide-results.json), [desktop](verification/guide-desktop.png), [mobile](verification/guide-mobile.png). Run the browser check with scripts/check_guide.py against the explicitly disposable test backend.
