# V1 implementation contracts

Approved baseline: [delivery plan](V1_PROTOTYPE_PLAN.md). All V1 defaults and the user's per-role citation clarification were approved on 14 October 2026. This contract describes the implementation; case facts remain in the case design.

## State and ownership

One local case has one current run. A run stores its revision, collected/inspected IDs, conversations, delivered response permissions, pending interaction, private notes and report draft. Immutable authored records/profiles and scoring keys stay backend-only. The client receives explicit player projections, never the author document or a complete hidden record catalogue.

The report has eight fields. Each field has two or three independent citation roles, with a string record ID or null for each. A claim can therefore require multiple records. A correct answer plus its complete role combination earns the unchanged full tier; its exact partial combination earns the partial tier. Other subsets and wrong answers earn zero. An unrelated record does not support its role and never subtracts points. No best-subset extraction, role reassignment or bulk citation list is accepted.

An attempt is a separate immutable database row containing answers, every role assignment, optional report prose, score breakdown/outcome, cited record snapshots, collection/disclosure context, versions, run and creation order/time. Private notes and editable draft references are excluded. Database triggers reject attempt modification/deletion. Case-wide order increases across resets. Same confirmation retry returns the same attempt; a new confirmation creates another even when content is identical.

## Commands and concurrency

Commands carry a UUID command ID. Repeating the same command returns its recorded outcome; reusing it for another action/input is invalid. Mutable commands include an expected run revision. A stale revision returns a conflict without overwriting state, with one explicit exception: a new submission confirmation with an older revision can commit when its exact reviewed draft still equals the current saved draft. This permits two deliberate identical confirmations to create separate ordered attempts. A changed draft or archived run is rejected. Submission commits the exact reviewed draft and score in one SQLite transaction. Blank answers/roles are valid; invalid IDs, extra fields, wrong role shapes and unavailable answer options are rejected before creating an attempt.

Only one interrogation may be pending per run. Accepted question/presentation is stored before awaiting Ollama; the reply and its permissions are committed together. Other reading and dossier retrieval can proceed. Submission waits for pending dialogue; reset may invalidate it. Restart recovery finishes an interrupted accepted interaction with authored dialogue, without another user message. Late old-run replies/saves cannot enter the new run.

Reset archives the prior run's identity/reveal permission, clears its working state and creates the initial inventory uninspected. Attempt rows, citations, order and source context survive. Historical material is displayed in a labelled context and never imported as current evidence/permissions. No history-deletion or draft-copy feature is provided.

## Public API

| Route | Behaviour |
|---|---|
| GET /api/health | Service and local dialogue-provider status |
| GET /api/bootstrap | Safe case metadata, characters/topics, current-run projection and submission summaries |
| POST /api/start | Start or resume the single current investigation |
| GET /api/runs/{id} | Read current-run projection; reject stale/archived run as an active investigation |
| POST /api/runs/{id}/inspect | Mark a collected record inspected |
| POST /api/runs/{id}/retrieve | Execute an eligible R01–R08 request; repeat returns existing record |
| PUT /api/runs/{id}/draft | Validate and save exact structured draft, section and optional explanation |
| POST /api/runs/{id}/notes | Create a private multi-source directional note |
| PUT or DELETE /api/runs/{id}/notes/{note_id} | Edit/delete only that current-run note |
| POST /api/runs/{id}/interactions | Question or explicitly present records to one visible topic |
| POST /api/runs/{id}/interactions/{interaction_id}/scripted | Finish that accepted pending question with an authored reply; late model completion returns the already recorded result |
| POST /api/runs/{id}/submit | Confirm exact reviewed draft; create one immutable attempt |
| POST /api/runs/{id}/reveal | Explicit spoiler confirmation after at least one current-run submission |
| POST /api/runs/{id}/reset | Start fresh working investigation while preserving submissions |
| GET /api/attempts/{id} | Frozen report and score; detailed reasons only if that run has authorized reveal |
| GET /api/attempts/{id}/solution | Canonical review only under that historical run's reveal permission |
| GET /api/commands/{command_id} | Reconcile whether a previously sent command completed |

Errors have a safe message and stable code. Unknown/uncollected sources never disclose a title. Pydantic rejects malformed shape, arrays in a source role and extra payload fields. State-changing endpoints return refreshed player state, with an attempt ID where appropriate. Bound services to localhost, restrict CORS and do not expose developer exception details.

## Dialogue contract

Stable topic labels are public; profile IDs, gating recipes and author facts are private. An explicit full presented bundle selects its corresponding profile. Every proper subset uses the authored partial response. Partial presentations never accumulate. Already delivered corrections override initial lies, independently per topic. Collected records, notes and submitted citations do not grant dialogue permissions.

Free-text questions route to an existing visible topic. Ambiguous or unsupported questions offer clarification. Ollama returns a validated topic selection in a bounded JSON schema; only authored eligible response text is rendered. No generated factual prose is displayed, and no model response changes collection/scoring. The prompt contains visible labels only, not the culprit, full solution, notes, grading keys or future profile text. A timeout, unavailable model or invalid selection uses deterministic scripted routing and authored responses. No cloud fallback.

## Presentation and disclosure

Ordinary player data contains collected safe records, source-limited timeline observations, visible request actions and discovery-safe report options. Authentic statements remain attributed testimony. Saved notes, report hypotheses and immutable submitted conclusions have distinct labels. Hidden sources never appear in client caches, search, pickers, asset metadata or timeline placeholders.

Before explicit reveal, attempts show total/outcome and their own frozen submitted material, without per-field reasons or missing-source recipes. Reveal shows the source-aware canonical explanation and detailed grading, labels missing-at-submission records/testimony as review-only, and grants no inventory/permissions or retrospective score. Further submissions remain allowed. Historical reveal permission persists separately from immutable scores.

The frontend retains unsaved report/note edits in memory with Not saved and Retry, reconciles unknown command outcomes, and never silently replaces a newer draft with a late save. A submitted snapshot is frozen through confirmation. Reload does not guarantee unsaved local text; persisted state resumes from SQLite.
