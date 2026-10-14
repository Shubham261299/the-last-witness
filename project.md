# The Last Witness — Project Brief & Decision Log

**Document status:** V1 baseline approved; local prototype implemented with documented verification limits  
**Specification version:** 1.4  
**Last updated:** 14 October 2026  
**Project stage:** V1 local prototype — ready for user playthrough; documented validation limits remain
**Working title:** *The Last Witness*  
**First case:** *Case 001: The 11:17 Incident*

---

## 1. Executive Summary

**The Last Witness** is a cinematic, browser-based detective investigation game. The player investigates a fictional museum diamond theft by interrogating people of interest, examining fragmented digital evidence, reconstructing a timeline, connecting facts, and submitting a final deduction.

The central differentiator is that the game is **not merely an AI chatbot with suspects**. It is a structured mystery built around evidence provenance and contradictions. The player should be able to trace a conclusion back to the evidence that supports it. AI can make character dialogue feel natural, but it must not invent the authoritative facts of the case, change the culprit, or reveal secrets outside the character's permitted knowledge.

The project is intended to be:
- A distinctive, visually compelling, live-demoable portfolio project.
- A way to learn by building with Codex, rather than asking Codex to generate an opaque application all at once.
- Relevant to AI Automation, Agentic AI, and Forward Deployed Engineer (FDE) roles.
- Small enough to deliver as a polished first case before considering expansion.

**Process decision:** The user explicitly approved local V1 implementation on 14 October 2026 with the defaults in docs/V1_PROTOTYPE_PLAN.md. One selected record per required evidence role preserves the existing multi-record proof combinations. Approval does not include public deployment or scope expansion.

---

## 2. Goals and Success Criteria

### Product goals
1. Deliver one complete, coherent, replayable detective case.
2. Make investigation feel interactive through dialogue, evidence discovery, contradictions, and timeline reconstruction.
3. Make the interface feel like a polished noir investigation experience, not a generic chat application.
4. Keep case truth and game progression deterministic and testable.
5. Make the experience work locally even when the local LLM is unavailable.
6. Provide a credible public portfolio demonstration after the local MVP is validated.

### Learning and portfolio goals
- Practice a modern TypeScript/React frontend connected to a Python API.
- Learn provider abstraction, structured model outputs, prompt boundaries, and model evaluation.
- Apply testing, typed contracts, state management, persistence, and error handling.
- Use Codex as a development partner while retaining understanding of the design and implementation.

### MVP completion criteria
The first case should be playable from start to finish:
- The player can start and reset an investigation.
- The player can interrogate three people of interest.
- Evidence can be discovered and reviewed.
- The player can reconstruct or inspect the case timeline.
- The player can save, edit, and delete private evidence-comparison notes, separate from source facts and submissions.
- The player can make evidence-backed deductions through progressive report sections and a complete review.
- Each confirmed submission is evaluated deterministically against eight scored fields totalling 100 points and saved as an immutable attempt.
- Attempts are unlimited; continued investigation and later submissions do not require reset. Replay clears working investigation state and preserves historical submissions.
- The solution is consistent across the story, evidence, dialogue permissions, and scoring.
- The game remains usable if Ollama is unavailable, using a scripted fallback.
- Tests cover core game rules and important failure cases.
- Setup and operation are documented clearly for a fresh Windows development environment.

The target session length is approximately **10–20 minutes** for the first case.

---

## 3. Product Concept and Game Identity

### Working title
**The Last Witness**

### Core premise
A rare diamond disappears from a locked museum exhibition room. There is a gap in the camera recording and a suspicious access event. The player must determine what happened by comparing statements, records, and other evidence.

### Case 001
**Working title:** *The 11:17 Incident*  
**Setting:** A fictional museum and exhibition room  
**Crime:** Theft of a rare diamond  
**People of interest:**
- **Alex Reed** — security guard
- **Maya Chen** — curator
- **Daniel Morgan** — systems technician

The existing [Case 001 design](docs/case-001/CASE_DESIGN.md) is preserved, with Maya Chen provisionally agreed as culprit; this is not blanket approval of every case fact or design choice. Version 0.3 retains the E12 payment, E09 provenance, explanation and A08 corrections, all 12 evidence records, 12 timeline entries, 29 original dialogue profiles, retrieval prerequisites, and eight score tiers/weights. The [UI/UX specification](docs/UI_DESIGN.md) now incorporates the confirmed notes, topic gating, progressive report and unlimited-attempt decisions. Detailed citation interaction, answer presentation, and solution-feedback timing still need review.

### Tone and visual direction
- Dark, cinematic noir.
- Charcoal and near-black foundations.
- Muted burgundy accent.
- Warm amber/brass secondary accent.
- Editorial serif headlines paired with a readable sans-serif interface font.
- Strong visual hierarchy, intentional spacing, restrained motion, and evidence-focused layouts.
- Responsive presentation suitable for a portfolio demo.

The experience should feel like a private investigation archive or cinematic case room, not a generic admin dashboard.

---

## 4. Core Gameplay Loop

The intended loop is:

1. **Open the case** — review the case brief and initial known facts.
2. **Investigate** — question people of interest and inspect available records.
3. **Collect evidence** — unlock and review evidence items.
4. **Compare** — save private notes linking discovered records and specific claims; record interpretations without making them authoritative facts.
5. **Reconstruct** — use the timeline to reason about what could have happened.
6. **Deduce** — build a report in progressive sections, deliberately nominating relevant evidence for each claim.
7. **Review and confirm** — review all eight fields; incomplete reports are allowed. Confirming saves one new immutable attempt.
8. **Continue or replay** — review the saved result, keep investigating and submit again, or reset working state while retaining history. Detailed feedback/solution reveal timing is open Q1.

### Interaction style
- Free-text interrogation and stable visible topic controls address the same authored content; response eligibility and fact disclosure are separately gated by evidence.
- Evidence is represented as structured, inspectable records.
- Collected records are comparable through clickable views; saved comparison notes are editable/deletable private interpretations and are never submitted or scored.
- The player can inspect the timeline and make evidence-backed deductions.
- Dialogue should appear as a complete validated message initially, rather than token-by-token streaming.
- A visible thinking/loading indicator is acceptable while a response is prepared.

### Explicitly deferred gameplay feature
A draggable evidence board is **not** required for the MVP. Start with clear clickable evidence relationships and structured deduction controls. Reconsider a drag-and-drop board only if the simpler interaction proves insufficient.

---

## 5. First-Case Content Requirements

The case must be fully designed before implementation.

### Target content volume
- Three people of interest.
- Twelve authored evidence records.
- Twelve important timeline events.
- Distinct character voices, knowledge boundaries, motivations, and relationships.
- A complete canonical solution and a clear evaluation rubric.

This is the current Case 001 content budget. Do not expand it to implement the new interaction rules.

### Case design must define
1. **Canonical truth:** exactly what happened, how, when, why, and who was responsible.
2. **Canonical timeline:** ordered events, known timestamps, uncertainty ranges, and any deliberate ambiguity.
3. **Evidence catalogue:** each record's content, source, timestamp, reliability, and relevance.
4. **Evidence graph:** which items corroborate, contradict, contextualize, or unlock other items.
5. **Character knowledge:** what each character knows, believes, misunderstands, conceals, or cannot know.
6. **Dialogue boundaries:** facts a character may disclose and conditions for disclosure.
7. **Deception rules:** distinguish intentional lies, mistaken memories, incomplete knowledge, and model-generated errors. These must not be treated as equivalent.
8. **Unlock conditions:** explicit rules for when evidence or a new line of questioning becomes available.
9. **False leads:** plausible but fair distractions that do not break the canonical solution.
10. **Solution and scoring rubric:** acceptable conclusions, required supporting evidence, partial credit, and explanation of the correct reasoning.
11. **Replay/reset behaviour:** how working state returns to a clean start while immutable attempt history remains intact.
12. **Leakage tests:** ensure the model does not reveal the solution or unauthorized secrets prematurely.

### Fairness principle
The player should be able to solve the case using information available in the game. The solution must not depend on hidden facts that the player had no reasonable way to discover.

---

## 6. Screens and Information Architecture

The proposed MVP contains four primary screens or major views:

### 6.1 Case Archive
- Introduces the game and available case.
- Shows the first case as playable.
- Can later support additional cases, but multiple cases are out of MVP scope.

### 6.2 Investigation Room
- Main space for interrogating people of interest.
- Shows the active character, conversation history, and available interaction controls.
- Makes the character's identity and role clear without exposing hidden case truth.
- Displays a thinking state and handles model errors gracefully.

### 6.3 Evidence & Timeline
- Lists collected evidence with enough context to understand its source and relevance.
- Shows important timeline events.
- Lets the player compare conflicting claims and create/view/edit/delete saved notes linked only to discovered evidence.
- Uses structured interactions rather than requiring the player to infer everything from chat history.

### 6.4 Final Deduction
- Uses progressive sections and a complete eight-field review; unestablished answers and empty citation roles are allowed.
- Evaluates each confirmed report deterministically and stores a separate immutable attempt.
- Keeps an editable draft and historical submissions distinct; players can continue investigating and submit again.
- Uses deliberate evidence-role assignments to prevent attaching every record for automatic full support; no arbitrary penalty for irrelevant evidence.
- Defers detailed explanation/solution disclosure to the explicit Q1 decision in the case/UI documents.

The [UI/UX draft](docs/UI_DESIGN.md) now specifies screen layouts, components, responsive behaviour, keyboard/focus handling, source visibility, loading/error/offline states, player journeys, and final submission/replay. These are concrete proposals awaiting user review; no interface has been implemented.

---

## 7. AI Behaviour and Game-Truth Boundaries

This is a central architectural decision.

### Deterministic game engine
The authored game state is authoritative. Deterministic application logic controls:
- The true solution and canonical timeline.
- Evidence availability and unlock conditions.
- Which facts each character is allowed to know or reveal.
- Session progression.
- Deduction validation and scoring.
- Reset and persistence behaviour.

### Role of the LLM
The LLM may:
- Phrase authorized character responses naturally.
- Express a character's approved knowledge, personality, and emotional tone.
- Respond to a player's question within the character's knowledge boundary.
- Produce structured outputs that pass validation.

The LLM must not:
- Invent authoritative clues or new canonical facts.
- Change the culprit, motive, or timeline.
- Unlock evidence by itself.
- Reveal secrets without meeting the authored disclosure conditions.
- Treat speculation as established fact.
- Decide final scoring outside the deterministic rubric.
- Bypass game rules because a user prompt asks it to ignore them.

### Context and leakage controls
- Give a character only the relevant authorized facts needed for the current response.
- Keep the complete solution out of public/client-facing case data.
- Keep solution data on the backend.
- Validate structured model output before applying it to game state.
- Treat player input and retrieved text as untrusted content; do not let prompt injection override game rules.
- Add adversarial tests for attempts to reveal the solution, override a character's identity, invent evidence, or bypass unlock conditions.

A provider or prompt is not a substitute for deterministic authorization checks in application logic.

---

## 8. Technology Decisions

### Frontend
- **Next.js App Router**
- **TypeScript**
- **React**
- **Tailwind CSS**
- Selected **shadcn/ui** primitives where they help.
- Motion/animation library only if it materially improves the experience and remains restrained.

### Backend
- **Python**
- **FastAPI**
- **Pydantic** for validation and data contracts.
- **pytest** for automated tests.
- Use a Python version verified to be compatible with the selected dependencies; Python 3.12 was the planning suggestion, not a final environment verification.

### Persistence and content
- **SQLite** for local session persistence.
- Authored case definitions stored separately from mutable session state.
- JSON is the planned format for case content, evidence, characters, and solution data.
- No user accounts are required for the MVP.

### Local model runtime
- **Ollama** for local inference during development.
- **Qwen 2.5 14B** is the initial candidate to benchmark.
- Compare it against **Llama 3.1 8B** on the actual development machine.
- Other installed models may be considered only if evaluation shows a clear reason; the existing Qwen vision model is not currently part of the selected dialogue path.
- Actual latency and quality must be measured; do not assume the model will meet the target before testing.

### Provider abstraction
The backend should depend on a provider interface rather than directly on a specific model vendor.

Planned provider options:
- `OllamaProvider` — local inference for development.
- `ScriptedProvider` — deterministic responses for offline operation and tests.
- `GeminiProvider` — possible future adapter, not approved or required for the current MVP.

The exact interface and output schema remain to be finalized before implementation.

---

## 9. Cost, Hosting, and Runtime Constraints

### Development constraints
- Target incremental software and inference cost: **₹0 during development**.
- Local Ollama inference only during development.
- No hosted LLM inference during development.
- No Gemini calls during development.
- No silent fallback from local inference to a cloud provider.
- Codex assistance is separate from the game's runtime inference path.
- A scripted fallback should let the game be explored even when Ollama is stopped or unavailable.

### Deployment
- Public hosting and a live public demo are future goals, not current commitments.
- Gemini or another hosted inference provider may be evaluated later, but no provider, budget, or quota has been approved.
- Hosting availability, free tiers, inference limits, and terms must be checked at the time of deployment. Do not assume a free tier provides unlimited inference.
- Public deployment requires a separate review of secrets, abuse protection, privacy, runtime costs, and provider terms.

---

## 10. Persistence and Session State

- SQLite remains the planned local persistence layer; no account, external service or new framework is needed.
- Authored case facts are separate from mutable investigation state: collected/inspected records, conversations and delivered permissions, saved comparison notes, and the report draft.
- Private notes are unscored reasoning aids. They reference current-run discovered evidence and never enter a report snapshot or canonical evidence.
- Every valid explicit report confirmation creates a separate immutable attempt containing the reviewed answers, evidence-role assignments, optional report explanation, stored score/outcome, submission order and source/run/version context. Draft saves/edits are not attempts.
- Attempts are unlimited. A confirmed submission leaves the current investigation and draft editable. One confirmation retried after a lost response must resolve to one attempt; another deliberate confirmation creates another.
- Case-wide submission order continues across replay. Reset clears working records/progress, dialogue stages/history, notes and draft, but never deletes, regrades or renumbers historical submissions.
- Historical result/source views remain labelled separately and cannot grant current-run evidence or dialogue permissions. Deleting history is not added to this MVP revision.
- Exact schemas, transactions and API mechanisms remain later contract work. Q1 solution-feedback disclosure must be approved before those contracts authorize hidden result content.

Do not put secrets or canonical solution data into ordinary active-run browser assets or API responses.

---

## 11. Proposed API Surface (Not Yet Final)

The following endpoints were proposed as a starting point. Their request/response schemas, error models, and state transitions have **not** been finalized.

| Endpoint | Intended purpose |
|---|---|
| `GET /api/health` | Report backend health and relevant provider status |
| `GET /api/cases` | List available cases |
| `GET /api/cases/{case_id}` | Return safe, player-visible case information |
| `POST /api/sessions` | Start an investigation session |
| `GET /api/sessions/{session_id}` | Retrieve the current session state |
| `POST /api/sessions/{session_id}/interactions` | Submit an interrogation or other player interaction |
| `POST /api/sessions/{session_id}/evidence` | Record or request an evidence-related action |
| `GET /api/sessions/{session_id}/timeline` | Return the allowed timeline view |
| `POST /api/sessions/{session_id}/deductions` | Proposed confirmation command for one immutable attempt; distinct from draft saving |
| `POST /api/sessions/{session_id}/reset` | Proposed reset of working investigation state; preserve submission history |

This older endpoint sketch is not a complete contract. Later planning must add the approved note/draft/history operations, exact reviewed-submission and retry semantics, run identity, and safe disclosure rules without assuming extra services. Evidence retrieval already follows explicit R01–R08 inspection prerequisites. No endpoints, schemas or implementations are created by this revision.

---

## 12. Proposed Repository Layout (Planning Only)

The following is a conceptual layout, not a created repository:

```text
the-last-witness/
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── docs/
│   ├── PROJECT.md
│   ├── PRODUCT_SPEC.md
│   ├── GAME_DESIGN.md
│   ├── UI_DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── TEST_PLAN.md
│   ├── MODEL_EVALUATION.md
│   └── PLANS.md
├── frontend/
│   └── app and UI components
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── game/
│   │   ├── models/
│   │   ├── providers/
│   │   ├── services/
│   │   └── storage/
│   └── tests/
├── content/
│   └── cases/
│       └── case-001/
│           ├── case.json
│           ├── evidence.json
│           ├── characters.json
│           └── solution.json
├── public/
│   ├── images/
│   └── fonts/
└── scripts/
```

The layout may change after architecture and data contracts are approved. The complete solution file must remain backend-only and must not be bundled into the frontend build.

---

## 13. Visual Assets and Presentation

- Use pre-created visual assets; no live image generation is required for the MVP.
- Planned direction: illustrated character portraits and original or appropriately licensed evidence imagery.
- Keep the interface visually rich but readable; visual polish should reinforce investigation rather than obscure it.
- Verify licenses and provenance for any assets used in a public portfolio project.
- Motion should be purposeful and respect reduced-motion preferences.
- The [UI/UX draft](docs/UI_DESIGN.md) proposes the asset types, portrait treatment, system-font defaults, palette, spacing, and components. Final artwork, any custom fonts/licenses, and approval of the visual specification remain outstanding; no assets have been created.

---

## 14. Testing and Quality Plan

### Deterministic game tests
Test at least:
- Case/session creation.
- Evidence unlock conditions.
- Character knowledge boundaries.
- Timeline and evidence consistency.
- Deduction evaluation, exact full/partial proof combinations, role assignment and rejection of bulk citation bypasses.
- Comparison-note CRUD and exclusion from scoring/submissions.
- Immutable attempts, identical fresh confirmations versus retries, and continued investigation.
- Reset behaviour with historical result retention and current-run disclosure isolation.
- Session persistence and recovery.
- Protection of solution data from player-visible responses.

### API and contract tests
- Validate request and response schemas.
- Test invalid input, missing sessions, unavailable providers, timeouts, malformed model output, and internal errors.
- Ensure client-visible responses contain only authorized data.
- Verify frontend/backend types or schemas stay aligned.

### Model evaluation
Benchmark the candidate local models on representative, repeatable prompts. Assess:
- Naturalness and character consistency.
- Faithfulness to authorized facts.
- Resistance to unauthorized disclosures and prompt injection.
- Ability to handle vague or adversarial player questions.
- Structured-output validity.
- Median and p95 latency on the actual machine.
- Behaviour when the model times out or returns malformed output.

### End-to-end playthroughs
Include:
- A normal complete investigation.
- An incomplete or inconclusive investigation.
- Incorrect and partially correct deductions.
- Reset and replay.
- Ollama unavailable.
- Slow inference, timeout, and malformed response.
- Attempts to make a character reveal the solution.
- Attempts to inject invented evidence or override game rules.

### Performance target
A typical local dialogue response within **10 seconds** is an aspiration to test, not a guarantee. Measure first, then set a realistic target. Static screen transitions should feel immediate, with a planning target below 200 ms where practical.

---

## 15. Security, Privacy, Accessibility, and Reliability

- Bind the development server to localhost by default.
- Keep API keys and secrets out of source control, browser code, and logs.
- Provide an `.env.example` with placeholders only.
- Configure CORS narrowly for the local frontend origin during development.
- Validate user input and model output.
- Protect game state transitions with backend checks.
- Treat all player text as untrusted input.
- Avoid sending case solution data to the browser or exposing it in logs.
- No telemetry is required for the MVP.
- Provide keyboard-accessible controls and clear focus states.
- Respect reduced-motion settings.
- Use readable contrast and responsive layouts.
- Handle failures with recoverable UI states rather than leaving the game stuck.

---

## 16. Scope Boundaries

### In scope for the MVP
- One polished case.
- Three people of interest.
- Free-text interrogation within defined boundaries.
- Evidence collection and inspection.
- Clickable evidence comparisons and saved private notes.
- Timeline reconstruction/inspection.
- Progressive evidence-backed reports and deterministic scoring; unlimited immutable submissions retained across replay.
- Local model integration through Ollama.
- Scripted provider fallback.
- SQLite session persistence.
- Automated tests and setup documentation.
- A portfolio-quality interface and demo flow.

### Out of scope or deferred
- Multiple fully authored cases.
- Multiplayer or shared investigations.
- User accounts and account management.
- A draggable evidence board.
- Live image generation.
- Cloud inference during development.
- Gemini integration in the current MVP.
- Public hosting decisions and production rollout.
- Complex agent swarms or multi-agent orchestration without a demonstrated need.
- Any feature that adds complexity without improving the first case's playability or demo quality.

---

## 17. Implementation Milestones

### M0 — Product approval
- Confirm the product scope and success criteria.
- Approve the first-case direction and boundaries.
- Resolve important open design questions before coding.

### M1 — Visual prototype
- Define the design system, screens, components, navigation, and interaction states.
- Validate the intended look and feel.

### M2 — Deterministic game engine
- After implementation approval, implement the case/session model, evidence and disclosure rules, timeline, notes, draft/attempt separation, deterministic rubric, persistence and tests.
- The game should be testable without an LLM.

### M3 — Local AI
- Add the provider interface, Ollama adapter, scripted adapter, validation, timeouts, and evaluation harness.
- Benchmark Qwen 2.5 14B against Llama 3.1 8B on the actual machine.

### M4 — Complete MVP
- Connect the interface to the backend.
- Complete a full playable case.
- Test failure and replay paths.

### M5 — Showcase readiness
- Polish the interface and demo flow.
- Finish README and setup documentation.
- Capture screenshots or a demo recording if useful.
- Verify that the project is understandable to recruiters and technical reviewers.

### M6 — Optional public deployment
- Decide hosting and inference approach separately.
- Review security, privacy, abuse controls, provider terms, and operating costs before deployment.

**Implementation must not begin solely because this plan exists.** Start only after the next planning deliverables have been reviewed and the user explicitly approves moving into implementation.

---

## 18. V1 decisions and follow-up validation

Q1/Q2/Q4 were approved through the V1 plan. Preserve the corrected case, eight fields and 100-point scoring; show total/outcome first and require explicit spoiler reveal for detailed reasons/solution. One selected record per role retains each complete multi-record proof combination. Notes stay private and unscored; attempts are immutable and preserved across replay.

Contracts and local implementation now exist. Remaining validation: a first-time pacing playtest (including the 21 citation assignments), full assistive-technology/device checks, and a fresh isolated installation with network access. The reported development lint advisory remains unresolved; do not force-downgrade or approve pending scripts without review. See README and V1_VERIFICATION for runnable commands and measured results. Public deployment remains a separate future decision.

---

## 19. Decisions Log

| Topic | Current decision | Status |
|---|---|---|
| Product direction | Cinematic detective investigation game | Accepted working direction |
| Project title | The Last Witness | Working title |
| First case | Fictional museum diamond theft, *The 11:17 Incident* | Maya provisionally agreed; existing facts and prior evidence corrections preserved in case v0.3 |
| Case review corrections | Future payment terms in E12; witnessed call-record provenance in E09; source-aware final explanation; A08 disclosure fix | Documented and checked on written content; runtime enforcement untested |
| Initial case size | One replayable case, roughly 10–20 minutes | Accepted target |
| People of interest | Three: Alex Reed, Maya Chen, Daniel Morgan | Accepted case direction |
| Core mechanics | Interrogation, evidence, timeline, deductions, final scoring | Accepted scope |
| Evidence UI | Saved comparison notes with discovered-source links, player interpretation, edit/delete; private, unscored, excluded from reports | User-confirmed |
| Citation scoring | Eight fields/100 points, deliberate relevant citations, no arbitrary penalties or bulk-attachment bypass | User-confirmed constraints; one-source-per-role mechanism approved for V1; multi-record combinations retained |
| Interrogation topics | Stable visible labels; separate evidence-gated response eligibility and disclosure; corrected states persist | User-confirmed; exhaustive mapping in dialogue v0.3 |
| Report flow | Progressive sections plus full review; incomplete submissions permitted | User-confirmed |
| Attempts | Unlimited; each confirmed submission is separately ordered and immutable; continue investigation and edit draft | User-confirmed |
| Replay retention | Reset working progress without silently deleting historical submissions | User-confirmed |
| Solution feedback | When detailed scoring explanations and canonical solution are disclosed | Approved: total/outcome first, then explicitly confirmed spoiler reveal |
| Draggable evidence board | Defer | Explicitly out of MVP |
| Dialogue rendering | Complete validated messages, not streaming | Accepted initial approach |
| Visual style | Dark cinematic noir, charcoal, burgundy, amber/brass | Accepted direction |
| Detailed UI/UX | Four views, private notes, progressive report and history, source-role citations, responsive and recovery states | UI draft v0.2 reflects confirmed rules; detailed presentation remains for review |
| Frontend | Next.js App Router, TypeScript, React, Tailwind CSS, selected shadcn/ui | Accepted stack direction |
| Backend | Python, FastAPI, Pydantic | Accepted stack direction |
| Tests | pytest plus API, game-rule, model, and end-to-end tests | Accepted direction |
| Persistence | SQLite; no accounts | Accepted direction |
| Case content | Authored JSON separate from session state | Accepted direction |
| Game truth | Deterministic, authored, backend-authoritative | Critical accepted decision |
| LLM responsibility | Natural language within authorized knowledge only | Critical accepted decision |
| Local inference | Ollama only during development | Explicit constraint |
| Initial model candidate | Qwen 2.5 14B | Compared locally; retained as an optional installed model |
| Default V1 model | Llama 3.1 8B | Selected after small local routing benchmark; factual replies remain authored |
| Offline fallback | Scripted provider | Accepted requirement |
| Cloud inference | No cloud inference in development; no silent fallback | Explicit constraint |
| Gemini | Possible future provider; not in current MVP | Deferred |
| Development cost | Target ₹0 incremental cost | Target |
| Assets | Pre-created illustrated/appropriately licensed assets | Accepted direction |
| Public deployment | Separate future decision | Deferred |
| Application coding | Local V1 approved on 14 October 2026 | Implementation authorized within the fixed plan |

---

## 20. Working Principles

1. **Plan before coding.** Do not treat a concept or architecture sketch as implementation approval.
2. **Build one complete case well.** A coherent, polished 10–20 minute experience is more valuable than many unfinished features.
3. **Make the game deterministic first.** The case must be playable and testable without an LLM.
4. **Keep AI inside explicit boundaries.** The model can express character dialogue; it cannot own the truth of the mystery.
5. **Prefer measurable decisions.** Benchmark local models and validate performance on the actual machine.
6. **Use Codex incrementally.** Work in reviewable milestones with tests and clear acceptance criteria.
7. **Protect the budget constraint.** No hosted inference during development; no hidden cloud fallback.
8. **Optimize for a strong portfolio demo.** Prioritize clarity, visual polish, reliability, and a complete playthrough.
9. **Document decisions and unresolved questions.** Keep provisional story details separate from approved architecture decisions.
10. **Expand only when justified.** Avoid adding agents, frameworks, or features merely because they are fashionable.

---

## 21. Current Status and Immediate Next Step

The local V1 game is implemented: all four views, three characters, twelve records, source-dependent timeline, private notes, eight scored claims, immutable unlimited submissions, controlled solution review and history-preserving replay. The local Ollama adapter routes visible topics and always renders eligible authored facts. There are no cloud calls, accounts or additional cases.

Use [README](README.md) for start/test commands, [contracts](docs/V1_CONTRACTS.md) for behaviour, [acceptance mapping](docs/V1_ACCEPTANCE_MAP.md) for traceability and [verification](docs/V1_VERIFICATION.md) for actual results and remaining limitations. The next user review is a playthrough of V1 and discussion of the remaining measured-usability gaps. Do not move into deployment or expand scope automatically.
