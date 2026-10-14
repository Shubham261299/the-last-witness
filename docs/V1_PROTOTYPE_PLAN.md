# The Last Witness — V1 prototype delivery plan

Status: Approved for V1 implementation on 14 October 2026; local implementation complete; handover checks and documented limitations below.  
Prepared: 14 October 2026.  
References: [project brief](../project.md), [UI specification](UI_DESIGN.md), [case design](case-001/CASE_DESIGN.md), [dialogue rules](case-001/CHARACTER_DIALOGUE.md), [acceptance scenarios](case-001/REVIEW_CHECKLIST.md).

## 1. What V1 will deliver

A complete locally runnable browser prototype of Case 001, playable from briefing through investigation, evidence-backed reporting, continued investigation, and replay. This is a functioning frontend/backend game with persistent state, not a static screen demonstration.

- One fixed case, three characters, twelve evidence records and twelve source-dependent timeline events.
- Four responsive views: Case Archive, Investigation Room, Evidence & Timeline, and Final Deduction with submission history.
- Free-text questions, stable topic controls, evidence presentation and bounded character responses.
- Explicit evidence retrieval, readable source records, comparison-note create/view/edit/delete, and a source-labelled timeline.
- Progressive report sections, eight scored fields, deliberate evidence-role citations and deterministic scoring out of 100.
- Unlimited immutable attempts; editable drafts and continued investigation; replay preserves submission history.
- SQLite persistence, resume, safe recovery, scripted fallback and local Ollama integration later in the build sequence.
- Cinematic noir presentation, useful illustrated/static case material, keyboard access and usable mobile layouts.
- Documented Windows setup/start/test instructions and an exercised end-to-end demo route.

No public deployment, accounts, cloud inference, additional cases, random culprit, draggable evidence board, multiplayer, live image generation, or result-deletion feature is included. There is no need for additional infrastructure services.

## 2. Decisions included in the approval request

The user approved all V1 defaults on 14 October 2026, with the clarification below. Approval authorizes the full local prototype build and validation.

**Approved citation clarification:** one selected record for each required evidence role, not one record for an entire claim. Claims requiring two or three supporting records retain their existing combinations. Tests must explicitly exercise every complete combination, partial combination and other support subset.

| Item | Proposed V1 decision |
|---|---|
| Case baseline | Use the current corrected Case 001 exactly as documented, with Maya as the fixed culprit for this prototype. Do not expand or rewrite the mystery |
| Q1: feedback and solution | After submission show total score, outcome and the player's frozen report. Keep category reasons, missing-proof recipes and the full reconstruction behind a separate explicit Reveal solution action with a spoiler warning, available after at least one valid submission in that run |
| Reveal permissions | Reveal never grants collected evidence, dialogue permissions or extra credit. Subsequent attempts remain allowed. Preserve previously authorized review access in its historical run context; reset does not authorize that solution in the fresh run or rewrite an attempt |
| Q2: citation interaction | One deliberately selected record per source role, using the existing full/partial combinations and score weights. No bulk attach, automatic relevance selection, best-subset scoring, or negative points |
| Q2: report options | Adopt the UI document's neutral prompts and discovery-based options: execution alternatives after E10 collection, private-sale alternative after E12, later-notification alternative after E04 or E05. An incomplete report always remains submittable |
| Q3: report workload | Keep three progressive sections plus complete review. Preserve the eight fields and 21 full-support source assignments; assess pacing in a first-time playtest rather than claim the 10–20 minute target is already met |
| Q4: visual defaults | Use the existing charcoal/burgundy/brass palette, system serif/sans typography, neutral character treatment, focused comparison and responsive layout. Keep motion restrained and respect reduced motion |
| Q4: initial limits | Questions: 2,000 characters; optional report explanation: 4,000. Slow-reply notice at 10 seconds; fall back by a proposed 30-second model deadline. Validate actual behaviour and document measurements |
| Model boundaries | Use authored factual response fragments/variants; the model routes or selects only authorized content. Do not rely on unrestricted generated prose or prompt instructions alone to protect the mystery |

Approval authorized the stages below, including necessary contract documentation, local dependency setup, implementation and validation. It would not authorize publishing, external messaging, paid services or changes to case facts. Routine implementation details can be resolved within this scope; a material contradiction or scope change must be brought back for a decision.

## 3. Task list and completion gates

Completion is recorded below; unchecked items have explicit environmental/manual validation limits. Complete and validate each dependent stage before proceeding. Fix defects in the stage that owns them; do not leave a disconnected frontend demonstration as the final deliverable.

### Stage 0 — Approve the build baseline

- [x] V1-01 Obtain the user's explicit approval of this plan and its proposed defaults, or record requested changes.
- [x] V1-02 Record the approved defaults and per-role citation clarification. The existing case facts and scoring combinations remain the build baseline.

Gate: scope, solution disclosure and citation behaviour are unambiguous. No application setup or code before this gate.

### Stage 1 — Define implementation contracts

- [x] V1-03 Finalize the game-state contract: immutable case definitions; current run; collected/inspected records; conversations and delivered permissions; private notes; editable draft; immutable attempts; separately controlled solution-review access.
- [x] V1-04 Define state transitions for start, inspect, retrieve, question/present, note CRUD, draft save, confirm submission, reveal, resume and reset. Include revisions, stale-run rejection and retries that do not duplicate actions.
- [x] V1-05 Finalize the dialogue contract: stable topic mapping, authorized profiles/fragments, no/partial/full evidence responses, correction precedence, model routing, validation, timeout and scripted fallback.
- [x] V1-06 Define FastAPI/Pydantic request/response and error contracts, safe player projections and frontend types. Cover notes, draft and history separately; never expose author tables or scoring keys in normal client data.
- [x] V1-07 Map all 98 case and 18 UI scenarios to automated tests, manual checks or model evaluation. Record the fixture/state and expected observation for each; flag any remaining ambiguity before writing dependent code.

Gate: contracts cover every action and failure state; the agreed result policy is represented explicitly. Deliver concise state/API/dialogue documentation and an acceptance-test mapping. These are implementation preparation tasks after approval, not requests to redesign the game.

### Stage 2 — Set up the local project

- [x] V1-08 Inspect available Node/package manager, Python and Ollama versions from the repository working directory. Verify compatible package versions against official documentation when selecting them; do not assume earlier candidate versions are installed or supported.
- [ ] V1-09 Set up Next.js, TypeScript, React and Tailwind; use selected shadcn/ui primitives only where useful. Set up Python, FastAPI, Pydantic and pytest with manifests, lockfiles and isolated dependencies.
- [x] V1-10 Establish the approved frontend/backend/content/test layout, formatting, linting, type checks, environment examples and ignore rules. Keep generated dependencies, local databases and secrets out of tracked content.
- [x] V1-11 Document and verify Windows start/stop and test commands; update AGENTS.md to describe the actual layout and commands. Bind services locally and configure the local frontend/backend connection.

Gate: both applications start reliably, a health request succeeds, and basic build/type/lint checks run. No Git initialization, commit or push is required to deliver the prototype; any later Git operation must use the personal account.

### Stage 3 — Build case content and deterministic rules

- [x] V1-12 Encode the existing twelve records, twelve timeline events, retrieval prerequisites, original statements and 29 reply profiles as validated authored content. Keep author truth and player-safe content separate.
- [x] V1-13 Implement initial inventory, inspection, R01–R08 retrieval and repeat-request behaviour. Verify both documented investigation routes without any required dialogue.
- [x] V1-14 Implement source-by-source timeline projection and safe record metadata. Preserve E09 provenance/calculated timing, E12 future payment and the distinction between footage, recovery, testimony and inference.
- [x] V1-15 Implement deterministic topic/profile eligibility and delivered correction state. Free text cannot unlock sources, invent facts or bypass presentation prerequisites.
- [x] V1-16 Implement all eight scoring fields and explicit source-role matching, exact partial tiers, outcome thresholds and unsupported-accusation handling. Reject malformed/uncollected citations; preserve valid partial support when another role is irrelevant.

Gate: focused rules tests prove reachability, disclosure boundaries and scores, including 100/80/65/47/0 examples and the wrong-culprit gate. No LLM is needed for correctness.

### Stage 4 — Persist the investigation and expose the API

- [x] V1-17 Implement SQLite storage/schema initialization and transactions for runs, collection, delivered dialogue, notes, drafts and immutable attempts. Preserve source/rubric context for historical results.
- [x] V1-18 Implement note CRUD with discovered-source validation, direction/claim links and saved interpretation; notes never become evidence or submission content.
- [x] V1-19 Implement draft save and exact reviewed-snapshot submission. Store answers, role citations, optional report prose, score/outcome, run association, time and case-wide order atomically. New confirmations create new attempts; one retried confirmation returns one attempt.
- [x] V1-20 Implement resume, continued investigation, explicit reveal and history reads. Reset clears working state and starts a fresh run without deleting or renumbering attempts. Historical content cannot grant current-run permissions.
- [x] V1-21 Implement the approved API and validation/error responses; exercise competing saves, duplicate commands, disconnects and late old-run responses. A failed or uncertain action must not fabricate progress.

Gate: API integration tests demonstrate persistence across service restart, immutable history after new discoveries/edits, and reset retention/isolation.

### Stage 5 — Deliver the complete playable scripted UI

- [x] V1-22 Build the cinematic design foundation: responsive shell, navigation, typography, colours, focus states and shared accessible controls. Establish one coherent visual direction across all four views.
- [x] V1-23 Build Case Archive, safe briefing, start/resume and explicit replay confirmation, including loading and service-unavailable states.
- [x] V1-24 Build Investigation Room for all three characters: free-text composer, stable topics, evidence presentation, scripted replies, preserved initial statements, corrections and one pending interaction per run.
- [x] V1-25 Build evidence catalogue, meaningful empty states, authorized requests, full readers/transcripts and source labels. Add focused comparison plus private-note CRUD with honest save/error states.
- [x] V1-26 Build the source-limited timeline and distinct player hypotheses/notes. Support keyboard navigation and narrow layouts without horizontal page scrolling.
- [x] V1-27 Build all three report sections and the all-eight-field review; single-source role pickers, optional explanation, draft persistence and incomplete submission. Do not preselect answers or automatically attach evidence.
- [x] V1-28 Build confirmation, result history, read-only attempt details, explicit solution reveal, continued investigation and replay. Include exact reviewed-content handling and recovery from interrupted submission.
- [x] V1-29 Connect every screen to real backend state. Complete the normal and alternate routes with Ollama stopped, including a 100-point report, a second attempt and replay with retained history.

Gate: a complete playable local game exists with real persistence and authored dialogue. No required action depends on a model response or an unimplemented screen.

### Stage 6 — Add bounded local Ollama integration

- [x] V1-30 Implement the agreed local provider interface and Ollama adapter behind the already-working scripted path. Pass only permitted topic/profile content; validate outputs before delivery and commit the response/state together.
- [x] V1-31 Exercise free-text routing, ambiguous questions, malicious prompts, invalid outputs, slow replies and provider failure. Use authorized scripted fallback, with no cloud calls and no raw model output displayed.
- [x] V1-32 Evaluate an available suitable local model against the approved dialogue cases. Compare the documented Qwen/Llama candidates if both are available; record availability, latency, correctness/leakage results and the chosen configuration. Do not silently download large models or claim unavailable models were tested.

Gate: the adapter and fallback are tested, and at least one actual local-model path is exercised before claiming AI validation complete. If Ollama or a usable model is unavailable, report that blocker explicitly; the scripted game remains playable, but do not label the full AI-inclusive V1 fully verified.

### Stage 7 — Finish presentation and verify the complete game

- [x] V1-33 Complete neutral portraits, the room plan and useful evidence visuals, using original or appropriately licensed static assets. Provide full text equivalents, avoid hidden clues in filenames/alt text and maintain equal character treatment. Do not require a paid asset or live image service.
- [ ] V1-34 Check desktop, tablet and mobile, including 320 CSS px, 200% zoom, keyboard-only use, dialogs, visible focus, screen-reader labels, reduced motion and rendered contrast. Fix observed usability/accessibility defects.
- [x] V1-35 Run the mapped game-rule/API and browser checks. Exercise incomplete/wrong/correct reports, source-role misuse, note exclusion, unlimited attempts, retries, resume, reset/history and hidden-data boundaries.
- [x] V1-36 Exercise backend disconnection, save failure, stale tabs, timeouts, late replies and service restart. Verify no lost confirmed submissions, false Saved indicators or old-run permission leaks.
- [x] V1-37 Perform a first-time playtest where available; record actual duration, confusion and the 21-citation workload. Adjust layout/help within the approved rules. If only author walkthroughs are available, report that limitation rather than claim first-time pacing validation.

Gate: no unresolved defect that blocks completing the case, leaks hidden facts prematurely, changes scores incorrectly or loses/corrupts saved progress/results. Document any remaining cosmetic or environmental limitations.

### Stage 8 — Package and hand over V1

- [ ] V1-38 Verify a reproducible local setup using the documented commands; document model configuration, scripted mode and troubleshooting. Keep a clean first-run experience separate from developer test data.
- [x] V1-39 Finish README and a short demo/play guide; document all meaningful verification commands/results and any unexecuted checks. Include representative screenshots when the UI is ready.
- [x] V1-40 Deliver the runnable prototype, launch instructions, feature checklist, known limitations and implementation summary. Stop before public deployment or expanding scope.

Gate: another person can follow the instructions to launch and complete the local game. A running development session alone is not sufficient evidence of reproducible setup.

## 4. Dependencies and progress reporting

Execution order: approval → contracts → setup → deterministic rules → persistence/API → complete scripted UI → Ollama → polish/verification → handoff. Visual assets can be prepared after the visual baseline is approved, but game-critical work takes priority. Tests accompany the behaviour they verify rather than waiting for the final stage.

Report progress at each gate with completed task IDs, working player behaviour, checks/results and remaining blockers. Milestones are completion checkpoints, not automatic requests for repeated approval. No new framework, case fact, score weight or product feature should be introduced to work around a defect.

The critical uncertainties are local tool/model availability, first-time pacing and actual visual usability. No delivery-time promise or measured performance claim is made before environment checks and implementation. Keep the scope fixed and make the complete scripted path work before model tuning.

## 5. Final definition of done

- [x] All four views participate in a complete connected investigation using the preserved case facts.
- [x] All twelve records are reachable; dialogue and timeline disclose only permitted facts.
- [x] Notes, draft and historical attempts behave independently and survive/respect the correct lifecycle boundaries.
- [x] Eight fields score deterministically with a maximum of 100, without bulk-citation bypasses.
- [x] Incomplete reports, unlimited new attempts, explicit reveal and history-preserving replay work.
- [x] Local SQLite resume/restart and documented recovery cases pass.
- [x] The game is fully playable with scripted replies; actual Ollama operation and failure fallback have been exercised. If unavailable, record the blocker and leave this completion item open.
- [ ] Responsive/accessibility and visual checks are completed; no blocking gameplay, disclosure or data-integrity defects remain.
- [x] Setup/start/test documentation is verified; checks not run and remaining limitations are disclosed.

Current delivery: local V1 implemented, with runnable commands, contracts, test evidence and screenshots linked from README. V1-09/38 remain partial because a fresh isolated network installation could not be executed in the sandbox; tested Python used existing system packages and npm installation was run by the user. V1-34 remains partial for full screen-reader/device/browser-zoom review. V1-37 is checked because the unavailable first-time playtest and unmeasured pacing are explicitly reported, not because the duration target passed. See V1_VERIFICATION.md. No public deployment is included.
