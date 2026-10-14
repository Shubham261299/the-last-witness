# The Last Witness — UI/UX design specification

Status: V1 approved baseline — locally implemented; remaining usability validation is documented separately.  
Prepared: 13 October 2026. Revised: 14 October 2026.  
Scope: Case 001, **The 11:17 Incident**, preserving the existing case facts and evidence corrections. Maya remains provisionally agreed; this revision is not blanket design approval.  
References: [project brief](../project.md), [case design](case-001/CASE_DESIGN.md), [dialogue profiles](case-001/CHARACTER_DIALOGUE.md), [review checklist](case-001/REVIEW_CHECKLIST.md).

This is an author-facing specification, not a player asset. Later sections contain the solution, hidden evidence IDs, and score requirements for design traceability. None of those author annotations may be bundled into the client. This document defines observable interaction behaviour and presentation; API schemas, database structures, model contracts, implementation plans, and application code are outside this task.

## 1. Experience principles and scope

The player should feel they are working through a private investigation archive: restrained typography, readable source records, three distinct interview subjects, and a notebook that makes comparisons easy. The visual emphasis belongs to the current question and its evidence, rather than decorative charts or chat avatars.

- Four major views: Case Archive; Investigation Room; Evidence & Timeline; Final Deduction, including attempt history and any authorized solution review.
- One case, one current investigation run, and retained local submission history across replay. No login, leaderboard, separate history platform, or locked case cards advertising unfinished content.
- No mandatory interview order, drag-and-drop evidence board, timed interrogation, random clue discovery, or phrase/password puzzle.
- Evidence requests are visible actions authorized by the case rules. Neither a model response nor a correct accusation is needed to retrieve a record.
- All case activity can be completed through authored topics, explicit evidence presentation, record requests, and structured deductions when the local model is unavailable.
- Backend unavailability is different from model unavailability. The UI must never claim scripted play works while the game backend itself cannot be reached.
- A source may be authentic while a claim inside it is false. The interface shows provenance and limitations without automatically declaring the liar or the culprit.
- Every explicitly confirmed valid submission creates a separately scored immutable attempt. Attempts are unlimited; the investigation remains active. Drafts and private notes receive no correctness feedback.

## 2. Visual system

### Colour tokens

Use flat, opaque surfaces for all reading and controls. Any later texture is decorative, subtle, and outside the text area. Token names here describe design intent, not an instruction to create code now.

| Token | Value | Use |
|---|---|---|
| Background | `#101115` | Page canvas |
| Surface | `#18191E` | Main panels and document reader |
| Raised surface | `#23242A` | Dialogs, selected record backgrounds, comparison panels |
| Primary text | `#EEE9DE` | Body text, headings, button labels |
| Secondary text | `#BDB6AC` | Source metadata, help text, secondary labels |
| Burgundy | `#713F4B` | Primary action fill, restrained case accent |
| Brass | `#C8A66A` | Focus ring, underlined source links, active navigation indicator |
| Strong border | `#847A84` | Necessary input/control boundaries and selected outlines |
| Decorative divider | `#343238` | Nonessential separators, never the sole boundary of an input |
| Error text | `#E09B98` | Errors with icon and text, never colour alone |

Computed contrast for these opaque pairs: primary text/background 15.58:1; primary text/surface 14.50:1; secondary text/raised surface 7.70:1; brass/raised surface 6.72:1; primary text/burgundy 6.90:1; strong border/raised surface 3.76:1; error text/surface 7.78:1. These are numerical palette checks, not rendered accessibility validation. Require at least 4.5:1 for normal text and 3:1 for necessary control boundaries/focus indicators against adjacent surfaces. Recheck actual hover, selected, error, disabled, and overlay combinations in the future UI.

Burgundy alone is not an adequate control outline on dark surfaces: use the strong border and a text label. Use brass sparingly; do not make it a universal “correct answer” colour. Disabled controls retain readable labels and an explanation, without depending on reduced opacity.

### Typography, spacing, and imagery

| Element | Draft specification |
|---|---|
| Headlines | Georgia with a generic serif fallback; 40/46 px archive title, 32/40 px view title, 24/32 px panel heading; 28/36 px main title on phones |
| Interface/body | System sans-serif stack; 16/26 px body, 14/21 px secondary labels, 13/19 px minimum metadata; use relative sizing to respect browser text settings |
| Timestamps | Same sans-serif with tabular numerals where available; never a novelty terminal font |
| Reading width | Approximately 60–75 characters for document prose and conversation messages |
| Spacing | 4, 8, 12, 16, 24, 32, 48 px scale; minimum 16 px card padding, 24 px desktop document padding |
| Shape | 8 px panel corners, 6 px controls, 1 px visible control border; no excessive pills around paragraphs |
| Targets | At least 44 × 44 px interactive target area, including compact icon buttons; 8 px gap between neighbouring controls |
| Portraits | Three pre-created illustrated portraits, equivalent framing and treatment; neutral expressions, no culprit-coded lighting or clothing |
| Evidence imagery | Room plan, labelled footage stills, recovery image only when its record is collected; complete textual equivalents alongside every meaningful image |
| Motion | 120–180 ms opacity/colour changes, up to 180 ms panel transition; no typewriter dialogue, parallax, camera shake, flashing alarms, or auto-playing cinematic |

System fonts give a concrete zero-download default. A custom font family or a different portrait style would be a later visual-review decision requiring an asset/license check. No new UI library, icon package, animation dependency, hosted font, or asset-generation workflow is introduced. The existing direction remains Next.js, TypeScript, React, Tailwind CSS, and selected shadcn/ui primitives for ordinary controls/dialogs where useful. Static icons can use existing primitives; no icon must carry meaning without a label.

### Layout and responsive rules

Desktop is the primary composition; the same actions must remain available on smaller screens.

| Width | Shell and investigation | Evidence/timeline | Deduction |
|---|---|---|---|
| 1200 px and above | Centred maximum 1360 px canvas, 32 px outer gutter, 24 px gaps. Interview: 224 px subject rail, flexible transcript, 288 px evidence/context rail | Normal reading: 256 px catalogue, reader at least 440 px, 304 px timeline rail. Comparison replaces the side rails with a focused reading area; two columns only if each has at least 440 px, otherwise stack | One progressive report section with a compact progress summary; full review uses readable stacked claims, max text width 760 px |
| 768–1199 px | 24 px gutters, 16 px gaps; 200 px subject rail plus transcript. Context becomes an explicit evidence button opening a dialog | 240 px catalogue plus content; content switches between Document and Timeline, with comparison stacked within Document | One main column; summary sits below form; no sticky panel covering fields |
| Below 768 px | 16 px gutters; subject chooser above a compact identity row and full-width transcript. Composer follows the thread and stays visible above the software keyboard when practical | Catalogue → document → timeline are stacked navigation states with a labelled Back button; preserve filter and scroll position | Single column; one report section at a time with labelled Back/Continue/Review actions; full review lists every field, including skipped ones |

Use one main page scroll on narrow screens. Desktop transcript/catalogue panes may scroll independently only with clear boundaries and keyboard access; the page never traps scrolling. At 320 CSS px and at 200% zoom, reflow into the narrow layout without losing actions or requiring horizontal page scrolling. Long record IDs and text wrap; no clipped controls. Timeline rows are a readable chronological list, not a horizontally scrolling chart.

The shell contains game name, case title, status/save indicator, and navigation to Interview, Evidence & Timeline, and Deduction. Archive is a separate labelled link. Mark the active destination with text weight, underline, and current-page semantics. Portraits and metadata never displace the primary reading column.

## 3. Data visibility and source language

All runtime components consume player-visible data for the current run, or an explicitly opened immutable historical attempt in its own labelled context. Any additional canonical solution disclosure depends on Q1 in section 12, not merely on the existence of a submission. Hiding an element in CSS is not a disclosure control. Do not preload author documents, uncollected records, future reply profiles, grading keys, or complete timeline rows into HTML, scripts, image filenames, accessible descriptions, tooltips, search indexes, or client caches.

| Visible label | Meaning and presentation | Example / limit |
|---|---|---|
| Machine record | Event or measured state from an identified device; clock and coverage limits remain visible | E05 can show an absent state at 23:11:42 only once collected; it cannot name the remover |
| Recorded observation | What footage or a response-team report observes, linked to that source | E08 identifies occupants and cart movement, not the concealed hand movement; E11 reports later recovery |
| Statement | Someone's account, quotation, sign-off, or admission; attribute speaker and time | E04's return entry is a claim within an authentic work order |
| Belief / uncertainty | The speaker explicitly speculates or lacks knowledge | Alex's assumption about the camera gap; no “verified” decoration |
| Your note | Private saved comparison and interpretation, never scored or submitted | “Contradicts” relates chosen passages; the label expresses the player's view |
| Your hypothesis | Current report draft, still editable; not a canonical fact | A tentative answer and its nominated source roles |
| Submitted conclusion | Player's answer frozen in a numbered attempt, with its saved score | A graded claim is not a new source record; wrong claims remain visible as submitted |
| Case review conclusion | Authored reconstruction only after the chosen spoiler-disclosure policy permits it (Q1) | Separate from the player's submission and never evidence ownership |

Source-backed speech remains a statement about a record. Use a small “Discusses E05” source link only when the player has collected that record and presented it under an allowed profile. Never give all of a character's words a “Verified” badge. General procedural explanations available in a character's approved profile remain testimony until compared with a record.

Show the time of the event separately from the record's creation/export time. Display detailed times as local 24-hour times with a visible date header. On first use, explain “11:17 PM = 23:17; all case times are museum local time.” Display E09's start and duration, with the end explicitly labelled calculated. Its collection note must not contain a location marker. The west service alcove appears only in delivered corrected testimony or labelled, explicitly authorized solution review under Q1.

## 4. Case Archive

### Composition and entry

Place a restrained title and one-sentence game premise above the single Case 001 card. The card shows title, fictional museum setting, theft category, target duration “About 10–20 minutes,” and local progress state. Artwork is a neutral museum/display silhouette; no C2 recovery, correspondence, culprit highlight, or reconstruction diagram.

Selecting the card opens its briefing in the same page region. Use only the safe opening from CASE_DESIGN section 2. The briefing names the three staff roles, explains “Compare records, question staff, and attach evidence to your conclusion,” and says that questions and evidence requests are unlimited. An optional “How to investigate” paragraph explains source labels, private notes, and that a submitted report is saved while investigation can continue. Spoiler-warning wording depends on Q1; do not promise automatic solution reveal. It contains no correct answers.

### Session states and actions

| State | Primary action | Secondary action / behaviour |
|---|---|---|
| No run | Start investigation | Read briefing; no need to choose a model |
| Current run, no submissions yet | Resume investigation | Restart case opens reset confirmation; show last saved view and collected-record count, no solved percentage |
| Current run with submissions | Resume investigation | View submissions opens history in Final Deduction; Replay same case preserves submissions and warns that the solution is unchanged |
| Fresh replay with earlier submissions | Resume new investigation | History remains a separate labelled action; no old records or answers enter the new run |
| Session status loading | “Checking saved investigation…” | Disable Start/Resume until status resolves, avoiding an accidental duplicate run |
| Backend unavailable | Retry connection | Keep safe briefing readable; do not invent a local session or claim progress is saved |

On Start, show a button-level progress state. Enter Investigation Room only after the backend confirms creation with E01/E02/E03/E07 collected and uninspected. Focus the view heading. Do not automatically inspect E02 or synthesize a conversation. Show a welcome card with “Open incident handover” and “Choose a person to question.” Opening E01 marks only E01 inspected; selecting a person changes view context, not evidence or score.

The transition is a brief crossfade, absent under reduced motion. On a failed start, stay on the briefing with Retry. If the response is uncertain, first reconcile whether a session was created before allowing another start. Browser Back returns to Archive without resetting the investigation.

## 5. Investigation Room

### Subject selection and identity

The subject rail shows Alex Reed / Security guard, Maya Chen / Curator, Daniel Morgan / Systems technician, in the same fixed order and equal visual treatment. Each is a labelled selection control with a neutral portrait. Use a radio-group-style single selection with arrow keys; on phones use a labelled dropdown if the full names will not fit. No guilt, trust, intimidation, or completion meters.

The identity panel shows the active person's portrait, full name, and role. Additional biographical details are not invented. Portrait alt text can be empty where adjacent visible text already identifies the person; any meaningful expression description must be neutral. Missing artwork uses a role/name placeholder, not a broken image.

Switching subjects preserves each thread's scroll position and unsent text within the current page session. It does not mark statements inspected or send a question. A pending reply remains associated with its original subject; switching must never insert it into a different thread. The UI can show a small “Reply pending” label on that subject while other reading remains available.

### Conversation and corrected statements

Each message shows speaker, source class, and conversation order/time. Render a complete validated reply in one insertion; never expose a token stream or raw rejected model output. The empty thread says “Ask a question or choose a topic.” A link opens the original E02 statement in the evidence reader; viewing a character alone does not silently inspect E02.

An initial lie is displayed as an ordinary attributed statement. Once an authored correction has actually been delivered, place “Later account available” beside the relevant earlier message and link forward to the new message. The new message says “Revised account” with a link back. E02 remains unchanged and readable. Do not cross out the original, erase it, add a global “Liar” badge, or retroactively label every utterance false.

Render profile-approved uncertainty as “Belief / uncertainty” when applicable. Mixed replies can place a source link beside a particular factual sentence, leaving the rest attributed speech. The backend must supply safe message annotations; the client must not infer truth or corrections from prose keywords.

When a new reply arrives, scroll to it only if the player was already near the end. Otherwise show “New reply” without moving focus or scroll. A polite live region announces that a reply is ready, not the entire long transcript again.

### Questions and reliable visible topics

The composer contains a persistent “Your question” label, multiline input, Send question, and Topics. Placeholder text is illustrative only, such as “Ask about their account.” Enter adds a newline; Ctrl+Enter or Cmd+Enter sends, also available through the visible button. Show this shortcut in help text. Draft input length has a proposed 2,000-character UI limit with a counter near the limit; the future contract must align with the accepted limit before implementation.

Topics are ordinary buttons with the stable, always-visible player labels enumerated in CHARACTER_DIALOGUE section 1. A topic's visibility is separate from the eligibility of its response and the facts that response may disclose. For example Maya's Correspondence label is always visible, but before E12 is presented it only invites selection of a collected record; it never advertises a private sale. No hidden prerequisite, lock badge, future admission, or required-source recipe is displayed. Corrected profiles replace earlier accounts under the same label; labels do not disappear after challenges.

Choosing a topic previews its ordinary question and sends on an explicit Ask action; no typing is required. Free text that cannot be resolved to a visible topic receives a neutral clarification and the stable choices. It creates no invented facts, clues, or penalties. All mandatory evidence retrieval remains available separately.

### Presenting evidence

Present evidence opens a picker containing only collected records. It shows title, ID, and source type, with checkboxes and an explicit selected count. The player chooses the topic/account being challenged and presents the selected records together. “Present to Maya,” for example, names the current recipient. A read-only preview opens a record without losing the selection; inspecting it follows the same inspection rule as elsewhere.

Presenting a full required set together invokes the corresponding authored response; additional collected records do not invalidate it or trigger other topics. A partial set remains a legitimate interaction and gets the exhaustive subset response from CHARACTER_DIALOGUE section 1. Separate partial presentations do not accumulate into a full challenge. A delivered correction persists for that topic across later empty/partial presentations and submissions; it never regresses to the old lie. Do not expose a recipe saying which secret record would complete a challenge. “Review your collected records” is an acceptable next action. No presentation attaches evidence to a deduction automatically, and no presentation labels a suspect guilty.

Requestable dossier leads appear in the context rail/dialog only when their R01–R08 conditions are satisfied. Each uses the exact case action label. A character's refusal never disables an available record request.

### Dialogue and connection states

| State | Visible behaviour | Available action and effect |
|---|---|---|
| Ready | Composer, topics, and evidence presentation available | Send one interaction; retain the submitted question visibly |
| Sending / accepted, reply pending | “Waiting for reply…” with a quiet indicator; one pending interrogation per run, Send/Ask/Present disabled across subjects | Continue reading, navigate, or switch subject; no intermediate character text |
| Slow reply | After 10 seconds show “This reply is taking longer than usual” | Offer Use scripted reply when an authorized topic is known; 10 seconds is a notice threshold, not a measured model guarantee |
| Model timeout | Proposed UI ceiling: 30 seconds for waiting on model output, to be aligned with later provider review | Deliver the authorized scripted reply; if intent is unknown, offer visible topics with the question retained. No blind duplicate send |
| Model unavailable | Small persistent “Scripted dialogue active” notice outside character speech | Topics and evidence presentations work normally; unmatched free text uses clarification. No cloud fallback or scoring penalty |
| Rejected/malformed model output | Do not render rejected text | Same authored fallback path; nontechnical notice if needed |
| Backend disconnected / browser offline | “Cannot reach the investigation service. Changes are not saved.” | Read already loaded records; retain drafts in memory; disable new authoritative actions until reconnect |
| Unknown outcome after interrupted request | “Checking whether your last action was saved…” | Refresh run state before offering retry; never duplicate a question, correction, or record request |
| Reconnected | Refresh authoritative run state and reconcile pending interaction | Restore controls only after confirmation; if the run reset elsewhere, discard stale response material |

Scripted dialogue means the local model is unavailable while the game service is working. It does not promise a fully offline web application. Drafts retained in page memory are not described as persisted; a warning before reload is appropriate when unsaved text is at risk.

## 6. Evidence & Timeline

### Catalogue and available leads

Use two clearly labelled groups: Collected records and Available record requests. Collected rows show record title, ID, source type, and “Not opened” or “Opened.” Search and filters operate only on collected content. A count says “6 records collected,” never “50% solved.” Do not list named locked evidence, question-mark cards with revealing silhouettes, future timestamps, or all 12 IDs in advance.

The uncollected state is represented only by a currently authorized record request, with its neutral action label. While that request is pending show “Retrieving record…” in its row. Only after successful retrieval add and open the complete record, marking it collected and inspected. A failed request leaves the inventory unchanged and offers Retry. Requests with unmet prerequisites are absent from the available list; a stale or forged request returns a generic unavailable message with no hidden preview. Empty-state copy depends on visible state: if any collected record is unopened, say “Open your unread records to look for related requests”; if requests are available, show them; if all collected records are opened and no new request is available, say “No new record requests. Compare your evidence, question staff, or review your report.” Never use a solved/completion verdict. A search with no matches says “No collected records match”; it must not replace the leads state.

Existing record requests remain accessible from their originating sources. Repeating one opens the existing record without another collectible or progress reward. No interview, correct relation choice, or correct deduction is required. Merely searching, filtering, or scrolling the list does not inspect records.

### Record reader

The detail view contains, in order:

1. Record title and ID, followed by source class and collected/opened status.
2. Source/author/device, event time or range, and creation/export/collection time, each separately labelled.
3. The full source content or accessible transcript, including relevant visible imagery.
4. “What this source can establish” and “Limitations,” written without uncollected references or an authored verdict.
5. Available request actions, Compare with collected record, Present to a person, and Attach to a claim.

Reliability is a plain-language limitation, not a trust percentage. Use explicitly authored player-safe fields from CASE_DESIGN section 6, not whole entries with inferred spoiler removal. Role, author-only cross-references, retrieval prerequisites, and inference notes stay private. E06/E07 cannot name uncollected E08 as identity support. E09's source/provenance and limitations never contain the later alcove admission. E11 does not list unseen removal-proof sources. E12 may state that an offer does not prove payment; that is not a new proof that no payment occurred.

Specific rendering requirements: E03 is a notification extract, never titled “Theft time”; E07 is labelled Gallery door, not Display case; E04 visually separates the authorized procedure from Maya's return claim; E08 has a prominent coverage interval and text saying the hands/capsule are obscured; E09 separates device times, consented-copy provenance, and any later testimony; E11 is a recovery report rather than an image of the original removal; E12 preserves future-tense payment terms.

### Evidence comparisons and saved notes

Compare opens two collected records in a focused workspace, hiding the catalogue/timeline side rails. Use side-by-side reading only with at least 440 px per source; otherwise stack with labelled source headings and preserve each reading position. Notes can reference more than two records, while the reader displays any chosen pair; adding sources does not create a graph editor. A neutral related-record link may connect collected material by topic/object/time, but never expose G01–G10's authored verdicts or hidden endpoints.

**Create:** choose at least two distinct collected records. Select the source(s) being used and the target record/claim, choose Corroborates, Contradicts, Contextualizes, or Unsure, then enter a short interpretation. Relation defaults to Unsure. Optional plain-text passage/claim labels clarify scope without requiring a text-annotation engine. For example, compare E05/E06 with E04's return sign-off, not with the entire work order as though every sentence were false. Press Save note; mere comparison does not create a saved note.

**View:** Evidence & Timeline has a Your notes list, separate from Collected records and the report. Each entry displays linked source labels, direction/relation, interpretation, and last saved state/time. Open it to read linked records and the full note. Empty state: “Compare two collected records to save your interpretation.” Notes never appear as evidence-picker options, official timeline events, machine facts, testimony, or authored verdicts.

**Edit:** change interpretation, relation, direction, passage labels, or source links, then Save changes or Cancel. Preserve the prior saved version until acknowledgement. Duplicate record links are ignored; one record cannot be both the only source and its own target. At least one source and a distinct target must remain. No hidden, uncollected, prior-run-only, or solution-review-only record can be linked; errors retain the local edit without leaking a hidden title. A note may be mistaken; no correctness validation occurs.

**Delete:** open “Delete this note?” with Keep note as the default and Delete note as the explicit action. Confirmed deletion removes only that saved note. Cancelling leaves it unchanged; failure keeps it visible and offers Retry. Evidence, transcripts, report drafts, scores, and attempts are unaffected. No note version-history or restore service is added.

**Persistence:** saved notes belong to the current run and survive navigation/resume in local SQLite. Creating/editing/deleting notes never creates an attempt, unlocks a clue, or updates an earlier result. Notes are private reasoning aids and are excluded from report review, submission payloads, result snapshots, and scoring. Reset clears working notes after confirmation while retaining historical submissions.

A failed save preserves the unsaved editor with Not saved and Retry; a successful acknowledgement shows Saved. During disconnection, allow editing loaded notes locally, but no persisted creation/deletion is claimed. Reconcile the run before retry; a reset or conflicting tab must not resurrect an old note.

“Use this record in report” opens a single selected claim and source role. The player explicitly confirms each assignment; replacing an occupied role shows the old and new source before applying. No multi-field attach, bulk auto-assignment, or copying a whole comparison is offered. Selecting, comparing, noting, or presenting evidence never silently cites it in the report.

### Timeline

The timeline is a chronological list of observations from collected records. Each item shows event date/time or range, source class, short source-limited description, and clickable citations. Preserve overlapping times instead of shifting them to appear sequential. Group related observations for reading without collapsing their different source types. Unknown intervals remain unknown; there are no named placeholders for hidden canonical events.

Projection is fact by fact. With E05 collected, show “Cradle sensor changes to absent” at 23:11:42, not “Maya steals the capsule.” With E08 collected, separately show Maya's observed occupancy and cart movement. With E10 but not E09, show the recording gap without Alex's call. With E04, show “Maya signs return confirmation” as a statement, not “Capsule returned.” E09's calculated call end is labelled; the alcove is an attributed statement only after the relevant correction. Author-only concealment timing never appears as an observed point.

A separate Your hypotheses section shows the current report draft with its nominated sources; Your notes is a separately labelled list. It is visually divided from observations and never plotted as a verified event. Clicking a timeline citation opens its collected record and returns focus/scroll to the prior item on closing. Read-only source links remain available during conversation loading. Uncollected facts are not available through timeline search, tooltips, hidden mobile panes, or screen-reader text.

## 7. Final Deduction

### Progressive report and neutral prompts

Use three sequential sections followed by a complete review screen. This organizes the existing seven claim groups/eight scored fields; it adds no scored field. Show section names, Back, Continue, Save and leave, and Review report. Continue never requires an answer or citation; Review is available from every section. Reopening the draft restores its last section without submitting. Completion labels mean “answered/cited,” never “correct.”

| Section | Fields | Neutral player prompts |
|---|---|---|
| 1. Event sequence | D01; D02 timing; D02 return | What does the 23:17 entry establish? When does the evidence place the removal? How does the return account compare with the records? |
| 2. Responsibility and destination | D03; D04 | Who, if anyone, does the evidence identify? Where does the evidence place the capsule afterward? |
| 3. Accounts and intent | D05; D06; D07 | What does Alex's entry establish? How does the maintenance account compare with the records? What, if anything, establishes intent? |
| 4. Review report | All eight fields plus optional report explanation | Review exactly what will be submitted; each field has Edit returning to its section |

All fields start at insufficient/unestablished. The following are author mappings to existing rubric answers; do not send unavailable options or answer keys to the client. Options appear only when their subject matter is in collected material, not when the player has the full scoring bundle. Every visible option uses equal styling and is merely a hypothesis. Collection does not preselect or mark an answer correct. Hidden options leave no named disabled placeholders.

| Field / maximum | Player choices | Visibility rule |
|---|---|---|
| D01 / 15 | Removal time; Notification after an earlier absence; Unestablished | Removal time and Unestablished always. The later-notification hypothesis appears after E04 or E05 collection introduces the hold/history; N02 may teach the generic principle without filling the report |
| D02 timing / 15 | During the condition check, before closure; During the camera gap; After Alex's entry; Unestablished | All available from initial statements/briefing; no exact removal second in prompts |
| D02 return / 10 | Returned before closure; Not returned before closure; Unestablished | All available from the initial account; contradicting it remains a hypothesis |
| D03 / 25 | Alex Reed; Maya Chen; Daniel Morgan; Unestablished | All available; no culprit default |
| D04 / 15 | Left in the curator's cart; Left with Alex; Moved by Daniel; Unestablished | All available as alternatives to E02's cart account; do not display hidden recovery or drawer details |
| D05 / 5 | Alarm response; Display-case opening; Time of removal; Unestablished | All available; record limits remain visible |
| D06 / 5 | Approved restart, required export skipped; Theft footage deleted; No discrepancy; Unestablished | No discrepancy/Unestablished always; both execution-specific alternatives appear together after E10 collection. They are competing interpretations, not a correctness hint |
| D07 / 10 | Planned private sale; Authorized relocation; Accidental misplacement; Unestablished | Last three always; sale hypothesis only after E12 collection. No buyer, payment, or motive spoiler beforehand |

The eight fields, answer meanings, evidence combinations, full/partial points, and success thresholds are unchanged in CASE_DESIGN section 12. Option visibility is a proposed spoiler-control detail requiring review; it never blocks submitting an incomplete report and all scoring sources remain reachable without dialogue.

### Per-claim evidence and explanation

Under each field, show the two or three neutral source-role labels from CASE_DESIGN section 12, each with a single collected-record picker and Clear. Do not show the correct record, relevance ranking, required set, or grading logic. All collected records are available in each picker. The player explicitly selects the source for that role; previewing a record preserves selection and focus. The same source may be chosen across fields by separate actions.

There is no bulk attachment area, Select all, auto-fill, or automatic extraction of a winning subset. Multiple IDs in one role are invalid shape; a valid but irrelevant source contributes no support for that role, without subtracting points or erasing other valid support. Blank roles are allowed. These role assignments are the only scored citations; comparison notes and interview presentations never supply them.

Show “No source selected” as neutral completeness feedback. Optional “Your report explanation (not scored)” accepts the player's report prose; proposed limit 4,000 characters pending contract review. Private comparison notes are never included, even automatically as supporting text. The scorer does not interpret prose.

### Draft saving and complete review

Save changed choices, per-role citations, explanation, and report position; show Saving, Saved, or Not saved based on acknowledgement. A failed save retains edits and Retry; ordinary editing remains available while a save is pending. Navigation preserves pending edits in memory, with a loss warning before reload/exit. Saved drafts survive resume; unsaved local edits are not promised to survive reload.

The review screen always lists all eight fields, chosen answers, every nominated source/role, blank roles, and unestablished answers. Show optional report explanation but no private notes or correctness hints. Edit returns to the relevant section and then to refreshed review. Missing support, conflicting conclusions, and incorrect answers remain submittable.

Backend validation checks current-run ownership, answer availability and form shape, never truth as an eligibility condition. Invalid references leave the draft editable and focus a linked error summary: “One or more cited records are not available in this investigation.” Never leak an unknown title or silently remove/replace citations. A stale run or draft change requires refreshed review before confirmation.

### Confirmation and immutable attempts

From full review, open “Submit this report?” with Return to review as default focus and Submit report. Copy: “This saves a new submission with these answers and evidence. You can keep investigating and submit again. Saved submissions cannot be edited.” Add the approved spoiler warning only after Q1 is decided; “Submit and reveal solution” is not the assumed action.

Commit exactly the reviewed draft, either after all its saves are acknowledged or together with that snapshot. While submitting, freeze that reviewed content and prevent duplicate confirmation. Do not grade an older draft. A rejected form creates no attempt; cancelling creates no attempt. Every valid fresh confirmation creates one new attempt, including identical or wholly incomplete reports. There is no attempt limit, correctness gate, or reset requirement.

If a response is interrupted, show “Checking whether your submission was saved” and reconcile that confirmation before permitting another. Network retry or double-click must return the same attempt; it is not a fresh confirmation. No speculative local score. After acceptance, the saved attempt is immutable and the working draft remains editable. Continue investigation returns to the current run with all evidence, notes, and delivered dialogue stages intact.

### Result history and controlled solution disclosure

Final Deduction has Draft and Submissions views; no fifth major screen or results dashboard is needed. History lists case-wide attempt number, originating run, submission time, and saved score/outcome. Open an attempt to view its frozen answers, role assignments, citations, optional report explanation and score. Label it “Submitted report — read-only,” with Continue investigation and Back to submissions. An empty history says “No reports submitted”; saving a draft or note must not add a row.

CASE_DESIGN section 12 defines the required immutable snapshot, including source/collection context and rubric version. Later discoveries, note edits/deletions, draft changes, replay, or future case edits never regrade or rewrite it. Cite previews in history show the source content associated with that submission, clearly labelled as historical; they do not collect it in the active run. Historical review preserves its own focus/scroll context and cannot become a current evidence-picker source.

Scores follow the unchanged rubric: at least 70 plus full responsibility, removal-interval, and delayed-notification support for Case established; comprehensive at 90–100, supported at 70–89. An incorrect named culprit receives Accusation unsupported even with a high side-observation score. These are backend results, never recomputed by the UI.

**Q1 — approved for V1:** score/outcome and frozen submitted material appear first. Detailed reasons, missing-proof feedback and canonical reconstruction require a separately confirmed spoiler reveal, available after one current-run submission. Reveal grants no evidence or score. Before that authorized reveal, attempts supply no new source titles, hidden facts, G01–G10 verdicts, or unelicited testimony.

When authorized, “How the evidence fits” follows CASE_DESIGN's unchanged source-aware explanation: E08 shows presence/movement, E11 later recovery, and neither films the theft. E12 describes future proposed payment; Alex's alcove is corrected testimony. Label missing-at-submission sources/testimony “Revealed in case review.” They never alter inventory, correction flags, citations, or score. Viewing a solution does not prevent continued investigation or another submission.

### Reset and replay

Reset this investigation / Replay same case open the same confirmation. Copy: “Start this case again? Current evidence progress, conversations, private notes, and the report draft will be cleared. Saved submissions will be kept. The culprit and solution stay the same.” Default focus: Keep investigation; commit action: Reset investigation.

Successful reset creates a fresh run with the initial records uninspected, empty notes/draft/transcripts, original character stages, and no current-run attempt yet. Case-wide attempt numbering and earlier immutable submissions survive. There is no history-deletion action added by this revision.

Clear old-run data from active view caches and reject late replies/saves; Browser Back must not inject old records or solution into the new investigation. Earlier submissions remain accessible only through explicitly labelled history, with a spoiler notice when entered from a fresh replay. History never grants collection or disclosure permission. Failure preserves the old run; uncertain outcomes reconcile before retry.

## 8. Main player journeys

These tables are author walkthroughs, not onboarding copy. “Available” means a visible request is now allowed; a record becomes collected only when its retrieval succeeds. All transitions occur only after authoritative confirmation. Reading a collected record marks it inspected without requiring dwell time.

### Normal investigation path

| Stage / what the player sees | Action | State change and newly available evidence | Must not reveal | Incorrect or premature action |
|---|---|---|---|---|
| 1. Archive card and safe briefing | Start investigation | Create run with E01/E02/E03/E07 collected, none inspected | Culprit, hidden timeline, future record titles | Failed/uncertain start stays on briefing and reconciles before retry |
| 2. Welcome and four initial records | Open E01 and E02; optionally question any person | Mark those records inspected; R05 becomes available for E09 | Which opening accounts are lies; alcove location | An accusation in chat changes no evidence or score |
| 3. Notification and door records | Open E03/E07; request R01, R03, R04 | E04/E06/E08 collected and inspected; R02 for E05, R06 for E10, R07 for E11 become available | Raw removal time before E05; capsule hidden in cart before recovery; correspondence | Unavailable/stale request gets a generic response, no hidden preview |
| 4. Visible desk/maintenance requests | Use R05/R06; optionally present their challenge sets to Alex/Daniel | E09/E10 collected; only valid presented challenges set correction stages | Metadata does not locate the call; maintenance alone does not identify thief | Partial evidence presentation receives a limited reply, never blocks retrieval |
| 5. Work order and raw-history request | Use R02, compare E05 with E04/E06 and E08 | E05 collected; timeline gets sensor observation; player's hypothesis may change | No auto-filled culprit or grading feedback | A wrong comparison remains a hypothesis and can be revised |
| 6. Cart and correspondence requests | Use R07 then R08; optionally challenge Maya | E11 then E12 collected; relevant dialogue flags only if presented | No video of concealment; no completed payment; no unsolicited confession | Her refusal does not disable records or final submission |
| 7. Timeline and progressive report | Choose conclusions and nominate source roles per field; optionally save separate notes | Save draft/notes; no attempt or correctness feedback | Hidden proof sets or automatic citation assignment | Unestablished/unsupported choices permitted; invalid references need correction |
| 8. Complete report review | Confirm Submit report | One immutable numbered attempt; current investigation stays active | Canonical disclosure awaits approved Q1 policy | Invalid form stays editable; interrupted response reconciles the same attempt |
| 9. Attempt result | Review snapshot, continue investigation, submit again later, or confirm Replay | More investigation and attempts within the run; reset creates fresh working state and keeps history | History must not grant current-run evidence | Cancel reset preserves everything; confirmed reset removes working notes/draft, not attempts |

### Alternate route: follow the cart before the alarm mechanism

| Stage / what the player sees | Action | State change and newly available evidence | Must not reveal | Incorrect or premature action |
|---|---|---|---|---|
| 1. Initial inventory after Start | Open E07; request R04 | E08 collected; R07 becomes available | Raw sensor time or author guilt from footage alone | Assuming a credential proves guilt receives no UI confirmation |
| 2. Footage and cart lead | Request R07, then R08 | E11 then E12 collected; recovery and intended future sale can be read | Offer is not proof of completed payment; no automatic solution | Presenting E12 to Maya affects only the offer topic |
| 3. Separate display-case access lead | Use R03 from E07 | E06 collected; lid events available | Key assignment alone is not physical identity | Unsupported culprit selection stays an ungraded draft |
| 4. Initial notification record | Inspect E03; use R01 then R02 | E04 then E05 collected; same core proof and motive records as normal route | Do not turn sensor event into a filmed theft | Incorrect timing hypothesis stays editable; record path is unchanged |
| 5. Optional side accounts | Inspect E02/use R05; use R06 from E04 if desired | E09/E10 collected if requested; no interviews required | No call location until Alex's corrected statement/review | Skipping these branches leaves a legitimate partial report, not a dead end |
| 6. Report and attempt review | Nominate evidence roles, review and confirm | Same deterministic rules and possible score for the same assignments; continued investigation allowed | No order-dependent bonus, penalty, different culprit, or automatic full reveal | Incomplete/incorrect reports create ordinary attempts |

The six-request core-and-intent route is R04, R07, R08, R03, R01, R02. The normal route retrieves the same six essential records in a different order and can include R05/R06. Both routes work entirely through dossier controls and scripted topics; speaking to a particular character is optional.

## 9. Reusable component inventory

These component responsibilities form the approved V1 design; implementation uses native React controls and dialogs without another UI framework. **P** means current-run player data; **R** means an explicitly opened attempt snapshot and, only under the approved Q1 policy, additional solution-review data. No component receives author-only truth, raw model context, or grading keys. “Reusable” identifies use in multiple places, not a new package requirement.

For state descriptions, **L** = loading, **E** = empty, **X** = error, **D** = disabled. A state marked not applicable means the component is not responsible for that operation; its parent must provide the specified status rather than fabricate content.

| Component / reuse | Purpose and displayed inputs | Actions | L / E / X / D behaviour | Accessibility | Visibility |
|---|---|---|---|---|---|
| App shell / all active views | Case name, view, save and connection state | Navigate, Archive, session menu | L safe shell; E no active run links to Archive; X global status; D state-changing actions unavailable when disconnected | Landmarks, skip link, current destination, heading focus | P |
| Case card + briefing / archive | Safe case metadata, briefing, current run status | Open briefing | L neutral skeleton; E no case content message; X retry load; D no start until status known | Proper heading, descriptive button, artwork alternative | P |
| Session action / archive and result | Run status and action label | Start, Resume, Review, request replay | L one progress label; E Start when no run; X reconcile/retry; D while command outcome unknown | Button label describes action; status announced | P/R |
| Person selector / interview | Three names, roles, active subject, pending marker | Select subject | L stable names only if already loaded; E no session placeholder; X parent retry; D only before session usable | Labelled single-choice group; arrows or phone select | P |
| Portrait + identity / interview and dialogue | Authorized name, role, portrait | None | L fixed aspect placeholder; E name/role fallback; X same fallback; D not applicable | No redundant alt text; never colour-code guilt | P |
| Conversation thread/message / interview and review | Attributed messages, source annotations, delivered corrections | Open cited source, jump to correction/new reply | L waiting row; E first-question prompt; X retry/fallback status outside speech; D pending actions only, reading stays usable | Ordered transcript, restrained live announcements, preserve focus/scroll | P/R |
| Question composer / each subject | Subject, unsent text, pending run interaction | Type, Send, Topics | L retain text; E help; X preserve text; D Send/Ask/Present while any interrogation is pending or backend disconnected; reading/typing remains possible | Label, linked error, shortcut | P |
| Topic list / model and scripted modes | Stable safe labels from dialogue section 1 | Select then Ask | L safe labels; E no run guidance; X scripted fallback when service is up; D Ask pending/backend down, never hidden-fact locks | Native buttons, stable order and focus | P |
| Evidence picker / presentation, notes, report | Current collected summaries and explicit target | Select, clear, preview, confirm | Multi-select for presentation/note links; single source for each report role. L placeholder; E no match; X refresh inventory; D unavailable command, never relevance filtering | Named controls, preview focus restore; explicit role label | P |
| Evidence presentation panel / each subject | Target subject/topic and selected collected records | Present together | L pending label; E no selection prompt; X retain set and reconcile; D no selected record/backend unavailable | Dialog heading states recipient; labelled topic and actions | P |
| Connection/status notice / all views | Model/scripted mode, backend status, recoverable error | Retry, use scripted reply where applicable | L checking; E hidden if no notice; X readable explanation; D retry in flight | Status vs urgent alert semantics; never colour alone | P |
| Record catalogue/row / main view and picker | Collected metadata, filter, opened state | Search, filter, open | L stable row skeletons without hidden data; E no matching records; X retry collection view; D nonexistent/stale item unavailable | Labelled search, list semantics, keyboard-openable row | P |
| Available leads / reader and context rail | Authorized requests and status | Retrieve/open existing | L per-action progress; E unread guidance or no-new-requests copy appropriate to state; X retry; D pending/backend down | Named buttons, actual retrieval announced, focus preserved | P |
| Record reader/source metadata / evidence and dialogs | Authorized content, provenance, times, limits, transcript | Compare, present, attach, request related material | L no partial invented text; E content unavailable; X retry source load; D mutation buttons only, reading allowed | Headings, selectable text, labelled tables/images, full transcript | P/R |
| Source link/popover / transcript, timeline, result | Collected source reference or authorized review-only reference | Open source, return | L labelled source loading; E missing accessible source message; X close/retry; D unknown reference never linked | Descriptive link, Escape/close, restore invoking focus | P/R |
| Comparison and note editor/list / Evidence & Timeline | Collected sources/passages, player relation/direction and interpretation | Compare; Save, View, Edit, Cancel, Delete note | L source loading; E create guidance; X preserve unsaved edit; D persisted mutations while disconnected; deletion confirmed | Labelled source regions, stacked mobile view, explicit Your note label, keyboard CRUD | P |
| Timeline list / evidence and review | Permitted observed facts, ranges, source classes; separate hypotheses | Filter, open citation/claim | L safe placeholders; E no collected observations for filter; X retry without canonical fallback; D filters still usable on loaded data | Semantic list, meaningful time labels, no drag action or colour-only type | P/R |
| Deduction field / eight fields | Neutral choices, source roles, current answer | Select, nominate/clear source, preview | L saved draft load; E unestablished/blank roles; X linked validation/save error; D only during confirmed submit or unresolved run identity; historical snapshot read-only | Fieldset/legend, radios, labelled single-source controls | P/R |
| Draft save indicator / notes and report | Acknowledged save state, local edits | Retry save | L Saving without freezing ordinary editing; E no pending edit; X Not saved; D retry already running | Polite status, never false Saved | P |
| Report review and confirmation / deduction | All eight fields, nominated roles, explanation, completeness | Edit field, return, confirm submission | L reconcile pending saves/submission; E fully unestablished valid; X linked error summary; D duplicate confirm/backend unavailable/unknown action outcome | Full review screen, brief labelled confirmation dialog, default focus Return | P |
| Attempt list/detail and authorized solution review / deduction | Immutable answers, citations, score and order; extra solution data only under Q1 | Open attempt, continue investigation, review authorized solution, replay | L reconcile result; E no submissions; X retry, no local score; D editing snapshot never allowed, new confirmed submission remains available in Draft | Clear historical run context; semantic score list; source labels; spoiler notice | R |
| Reset confirmation / session menu and result | Lost working progress, retained submissions, same-solution notice | Keep or Reset | L pending; E not applicable; X preserve/reconcile run; D duplicate confirm/backend down | Default focus Keep; restore focus on cancel, new heading on success | P/R |

## 10. Global interaction, accessibility, and persistence

### Keyboard and focus

- Every record, request, topic, attachment, comparison, and deduction is reachable by Tab and activatable without dragging or hovering.
- Use a visible 2 px brass focus outline with at least 2 px offset, including inside burgundy controls. Do not remove the browser outline without replacing it.
- Provide Skip to main content. Keep visual and focus order aligned: navigation, contextual selector, primary content, actions.
- Dialogs have a labelled title, focus containment, Escape-to-close before a committed action, and restoration to the invoking control. Avoid nested modal pickers: a record preview replaces the dialog body with a labelled Back to selection action.
- Selecting a record on desktop focuses its detail heading; returning restores the selected catalogue row. View changes focus the new heading once; save notifications and newly retrieved leads do not steal focus.
- Native text selection, copy, browser zoom, and browser search remain usable. No game-wide single-letter shortcuts that interfere with typing.
- Sticky controls must not cover focused fields or the final message at small heights or when the software keyboard is open. Prefer ordinary document flow if space is limited.

### Reading, source clarity, and motion

Use the contrast targets from section 2, real text instead of image-only documents, and visible labels beyond icons/colour. Errors include corrective action. A record's reliability/limitation description remains reachable without a hover tooltip. Screen-reader labels must reveal no more than visible content, including when a record is uncollected.

Respect reduced-motion preferences: no animated transitions, smooth auto-scroll, moving loading shimmer, or pulsing dots when reduced motion is enabled; static “Loading”/“Waiting” text suffices. No sound is required for clues, errors, or success. No timed text disappears before it can be read.

### Navigation, saving, and recovery

The local backend's saved run is authoritative for collected/inspected records, conversations/delivered permissions, private comparison notes, the report draft and its role assignments. Separately saved immutable attempts persist across reset; any solution-reveal permission follows the approved Q1 policy. View selection, catalogue filters, selected subject, comparison layout, and scroll positions are presentation state; restoring them must never grant evidence or replay an action. Unsent text can remain in page memory but is not promised to survive a full reload.

Opening a page or using browser Back never creates, resets, submits, or repeats a question. Restore the active run before rendering private case content. An unavailable or obsolete run reference returns to a safe recovery view with Resume current investigation / Archive, without exposing another run's records.

During disconnection, label displayed content as previously loaded; allow reading and local report/note editing where possible, with Not saved visible. Do not unlock evidence, correct a character, calculate a final score, or silently replace saved state. On reconnect, reconcile the current run; preserve compatible pending edits for explicit retry and discard data from an obsolete/reset run. A conflicting change from another tab prompts the player to reload the saved investigation rather than silently overwrite it. Exact concurrency mechanisms are for later contracts; these are the required visible outcomes.

### Action availability during pending work

| State | Reading/local editing | Authoritative actions |
|---|---|---|
| Ordinary draft/note save pending | Continue reading and editing; latest edits remain visibly pending | Save acknowledgement applies only to the version saved; submission waits for the exact reviewed snapshot to be confirmed |
| One interrogation pending | Navigate, switch person, read evidence, edit notes/report | No second Send/Ask/Present anywhere in the run; independent dossier retrieval is allowed; submission waits for reply reconciliation; confirmed reset may invalidate the pending action |
| Submission pending/unknown outcome | Read loaded material; keep reviewed snapshot frozen until reconciled | Disable another confirmation/reset until the outcome is known; a retry reconciles the same attempt |
| Backend disconnected | Read cached authorized data and edit loaded note/report drafts locally | No record retrieval, dialogue delivery, persisted note deletion, attempt creation, or reset; do not claim Saved |
| Reset pending/unknown outcome | Read prior loaded state with status; retain local edits until outcome known | Disable other mutations until run identity is reconciled; then discard old-run edits with the confirmed reset |
| Another tab changed the run/draft | Preserve local unsaved text visibly | Require reload/review of saved state before overwriting or confirming; never silently merge a stale draft into an attempt |

No session IDs, provider identifiers, API paths, stack traces, model prompts, or internal profile flags belong in ordinary game copy. The status notice can say Scripted dialogue active; technical setup detail belongs in future documentation, not character speech.

## 11. Design acceptance checklist — future runtime review

| ID | Required observable behaviour | Evidence needed later |
|---|---|---|
| U01 | Archive and a fresh session reveal no culprit, hidden records, or canonical answer labels | Rendered screens plus inspection of initial data/assets/accessibility tree |
| U02 | Both journeys reach the same core records with no mandatory interview | Complete keyboard playthroughs in each order |
| U03 | Model unavailable leaves all required actions and full scoring possible; backend unavailable is labelled differently | Controlled provider failure and backend-disconnect runs |
| U04 | Initial statements survive corrections; later account links are accurate | Before/after transcript and resume checks |
| U05 | E09 timing/provenance, E12 future payment, and E08's visual limits are visible and precise | Record and result content inspection |
| U06 | Uncollected records cannot appear in search, pickers, timeline, relationship previews, hidden mobile panels, or accessible labels | State-specific payload and rendered inspection |
| U07 | Timeline observations remain distinct from player hypotheses and combined conclusions | Partial-record states, especially E05 without E08 and E10 without E09 |
| U08 | Eight scored fields use explicit source roles, with no select-all or relevance auto-fill; original tiers preserved | Per-field role and bulk-attachment cases in case checklist |
| U09 | Unsupported/incomplete reports can be submitted; invalid IDs do not reveal a result | Incorrect/partial submissions and forged/stale attachment tests |
| U10 | Each confirmed valid report creates an immutable attempt; investigation continues; solution disclosure follows Q1 once approved | Interrupted submission, identical fresh confirmation, later-discovery and snapshot tests |
| U11 | Reset confirms working-state loss, preserves attempts/order, and rejects old-run replies | Cancel/confirm/failure/late-response/history/browser-Back scenarios |
| U12 | No clipped actions at 320 CSS px or 200% zoom; fully operable by keyboard | Actual viewport, zoom, software-keyboard, keyboard and screen-reader review |
| U13 | Contrast, focus, reduced motion, reading order, and image alternatives work in rendered states | Rendered contrast measurements and assistive-technology review |
| U14 | Loading, save failure, timeouts, disconnection, uncertain request outcomes, and retries never fabricate progress | Failure simulation with state reconciliation and duplicate-action checks |
| U15 | Notes support create/view/edit/delete and distinguish a claim inside a record from the record's provenance | Multi-source, directional note, save failure, cancellation, and snapshot-exclusion scenarios |
| U16 | Stable topic labels work with no, partial, full, and previously corrected evidence states | Dialogue matrix exercised in scripted mode and later model integration |
| U17 | Progressive report can skip sections and review all eight fields without exposing unavailable options | Fresh-run, E10/E12 discovery, keyboard backtracking, incomplete confirmation |
| U18 | Comparison remains readable and lead empty states provide an applicable next action | Two-source width, mobile stacking, unopened/all-opened/no-match states |

Runtime checks and screenshots are recorded in V1_VERIFICATION.md and docs/verification; full assistive-technology and first-time pacing checks remain unexecuted. Numerical palette checks from the earlier draft and written document checks are not rendered accessibility or gameplay validation.

## 12. Approved V1 decisions and remaining validation

The user approved the V1 plan on 14 October 2026, preserving the current case and all gameplay decisions.

| Item | Approved decision / remaining check |
|---|---|
| Q1 | Score/outcome and frozen report first; detailed reasons and reconstruction behind an explicit spoiler reveal after one current-run attempt. Continued attempts remain allowed |
| Q2 | One deliberately selected source for each required role, not one record for an entire claim. Existing two/three-record combinations and partial tiers remain valid. No bulk scoring or automatic assignment. Neutral options follow relevant discoveries |
| Q3 | Retain three report sections, full review and 21 full-support assignments. First-time comprehension and 10–20 minute pacing remain unmeasured |
| Q4 | Adopt system fonts, neutral original SVG assets, charcoal/burgundy/brass, reduced motion, 2,000-character questions and 4,000-character explanation. Show slow notice at ten seconds; bound model request by 30 seconds with authored fallback |

Actual implementation, setup and checks are linked from [README](../README.md), [contracts](V1_CONTRACTS.md), [acceptance mapping](V1_ACCEPTANCE_MAP.md) and [verification](V1_VERIFICATION.md). A saved comparison is a private editable note, not evidence or submission material. Replay preserves separately stored immutable attempts. No public deployment, added mystery content or additional service is authorized.

Earlier Q1 references in the screen descriptions now refer to this approved policy. Previous pre-approval planning boundaries are historical and were superseded by the explicit V1 authorization.
