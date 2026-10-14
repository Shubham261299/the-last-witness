# Case 001: The 11:17 Incident

Status: V1 approved baseline, revision 0.4 — implemented locally; preserved case facts and scoring tiers.  
Prepared: 13 October 2026. Revised: 14 October 2026.  
Parent brief: [project.md](../../project.md).  
Companion documents: [character dialogue](CHARACTER_DIALOGUE.md) and [review and acceptance checks](REVIEW_CHECKLIST.md).

This is an author-facing design document containing the entire solution. Maya Chen remains the provisionally agreed culprit; the existing case facts and evidence corrections are preserved, without claiming blanket approval of the mystery or every design choice. The user has confirmed the notes, evidence-backed scoring, visible-topic gating, and unlimited immutable-submission rules recorded below. Their detailed presentation remains for review. Never serve this document as a player asset or pass it wholesale to a dialogue model. The later V1 approval authorizes local implementation of this existing case baseline; it does not authorize expanding the mystery or public deployment. See the approved V1 plan.

## 1. Case at a glance

| Item | Case design |
|---|---|
| Setting | Bellwether Museum, a fictional museum during its nightly collections checks |
| Object | The Vesper Diamond, held in a sealed presentation capsule engraved VC-04 |
| People of interest | Alex Reed, security guard; Maya Chen, curator; Daniel Morgan, systems technician |
| Incident | At 11:17 PM, a display-case alarm reports the capsule missing; the room is locked and the gallery camera has just been offline |
| Core insight | The alarm's notification time is later than the removal time |
| Culprit | Maya Chen, acting alone |
| Method | Remove the capsule during an authorized condition check, conceal it in a conservation cart, and falsely record its return |
| Motive | Complete an unauthorized private sale for personal payment |
| False leads | Alex's suspicious door entry and dishonest account of his break; Daniel's camera outage and concealed maintenance omission |
| Content budget | 12 evidence records, 12 timeline entries, three interviewable characters |
| Target play time | 10–20 minutes, to be measured in playtests |
| Report outcome | Submit a reconstruction for a deterministic score; continue investigating and submit again. Full feedback and solution require a separate explicit spoiler reveal after at least one current-run submission |

The emotional progression is suspicion, uncertainty about the timestamp, reconstruction, then a supported accusation. The strongest reveal is that the supposedly unobserved crime was already over before the camera stopped recording.

## 2. Player-facing opening

The following is safe introductory copy. Do not include the author table above in the player briefing.

> At 11:17 PM, an alarm sounded in the Bellwether Museum's North Gallery. The Vesper Diamond was gone from its locked display case.
>
> The gallery camera had been offline for three minutes. A security credential opened the gallery door seconds after the alarm. Three members of staff were working nearby: the guard, the curator, and the technician.
>
> Their statements are on your desk. So are the first incident records. Establish when the diamond disappeared, who removed it, and which evidence supports your conclusion.

The player is reviewing the secured incident dossier at 00:05 on 13 October 2026. The crime took place on 12 October. Interviews and recovery actions described in the dossier have already happened; requesting a record reveals that record, rather than altering the historical events.

The case archive should describe a fictional theft without identifying the culprit or the timing reversal. Initial inventory: E01, E02, E03, and E07. All three characters are available immediately. No investigation timer, limited questions, health meter, or irreversible interview choices are proposed.

## 3. Canonical truth — author only

### What happened

Maya proposed an unauthorized private sale of the Vesper capsule earlier that day, with a price of $180,000 payable to her on the following morning's collection, subject to the buyer's inspection. The buyer agreed in principle. She intended to keep the capsule in her assigned conservation cart overnight and move it out during the following morning's collections activity. The buyer is an offstage correspondent, not another suspect or an accomplice inside the museum. The sale, handoff, and payment never complete.

An approved evening procedure included a capsule condition check and a camera recorder reboot. During the combined work window, the case controller temporarily held capsule-absence notifications. The sensor continued recording whether the capsule was physically present. The hold was scheduled from 23:10:00 until 23:17:00; the camera reboot was scheduled for 23:14:00–23:17:00.

Maya entered with conservation cart C2. At 23:10:55 she opened the display case using her assigned key. At 23:11:42 she lifted out the capsule. Temporary removal for inspection was authorized only inside the gallery; it had to be returned before the case was closed. Instead, she concealed it in C2's padded lower drawer, closed the empty case at 23:12:10, and signed that the capsule had been returned at 23:12:16. She wheeled C2 out at 23:12:28.

Maya knew the later camera outage and alarm hold were scheduled. She expected investigators to focus on the blackout and believed a held alarm would not preserve the earlier absence event. She was wrong about the sensor's independent history. That mistaken technical belief explains her plan; it is not a fact the player must prove for full credit.

Daniel performed the authorized reboot but skipped the required pre-reboot recording export. He concealed this omission to avoid disciplinary action. The omission did not cause the theft, erase the preserved pre-outage footage, or affect the independent case controller.

Alex left his desk to take a personal call during the reboot. He lied about staying at his post because he feared being blamed for leaving it unattended. At 23:17:00 the hold expired and the controller notified security that the capsule was absent. Alex used his badge to enter at 23:17:06 in response to that alarm. He did not remove the capsule.

The response team later secured C2 and recovered the sealed VC-04 capsule from its lower drawer. The inventory examination confirmed the diamond was inside. Maya's private-sale correspondence supplied evidence of intent. No confession is needed, and Maya never gives a full confession during the investigation.

### Fixed boundaries of the solution

- Maya is the sole thief in every replay. No randomized culprit or alternate canon.
- The theft concerns the whole sealed capsule; no replica, gem substitution, sleight-of-hand test, or specialist gem knowledge is required.
- The display case and gallery are locked when the alarm sounds. Authorized access earlier in the evening explains the apparent locked-room mystery.
- The camera outage is real and authorized. There is no fabricated video, edited timestamp, remote theft, secret passage, or unknown intruder.
- Alex and Daniel are dishonest about separate workplace failings. Neither helps Maya or knows her plan.
- The evidence supports removal before closure and removal from the room before the outage. It does not show the exact hand movement into the cart; that concealment detail is author truth corroborated by later recovery.
- Maya's planned next-morning exit route is background, not a scored inference. Only her sale correspondence supports the intended timing.
- A player can establish responsibility without proving motive. Full marks include the supported sale intent.

## 4. Physical layout and record rules

These facts must be discoverable in E01/E04/E05 before deductions depend on them.

### Layout

The staff corridor connects the security desk, North Gallery, conservation bay, and equipment room. The gallery has one usable entrance: a glass-panelled door from that corridor. Its other boundaries have no usable exit or access opening. The display case stands inside the gallery and has its own keyed lid, separate from the gallery-door lock.

The corridor camera records the gallery threshold and, through the glass panels, identifies people at the display case. It cannot show small objects or Maya's hands behind C2. Its preserved pre-outage footage establishes that the gallery was empty before Maya entered and that she was its sole occupant during the removal interval. These observations must be available in an accessible text transcript; the player need not infer identity from tiny pixels.

### System rules for this fictional installation

| System | What it establishes | What it cannot establish |
|---|---|---|
| Gallery door reader | Credential and direction of entry; door contact events | A credential alone cannot prove who carried it or who touched the display case |
| Display-case controller | Lid open/close events and assigned key ID | A key ID alone cannot establish the holder's identity or intent |
| Capsule occupancy sensor | Present/absent state of the presentation cradle, logged locally during the hold | Who removed the capsule, where it went, or whether a removal was criminal |
| Notification hold | Defers absence notifications; emits an absence notification at expiry if the cradle is still empty | Does not suspend occupancy logging or unlock the case |
| Camera recorder | Visible occupants and movements during available footage | No observation during its actual gap; no view inside C2 |
| Maintenance trace | Scheduled/actual reboot and recording-export result | An operator's involvement in maintenance alone does not establish theft |

All quoted machine times are museum local time, shown as 24-hour times in detailed records. The title's 11:17 means 23:17, not 11:17 AM. Collected clock verification reports establish a maximum one-second error for the machine records; there is no clock-offset puzzle. The notification and badge events are sufficiently separated to establish their order.

Record authenticity and sensor operation are verified in the fictional response team's export. No staff member altered the preserved logs. This is a stated case boundary, not an inference that all real security systems are tamperproof. Testimony remains fallible. The occupancy sensor records presence only; VC-04's identity comes from inventory and recovery records.

## 5. Canonical timeline

The table below is author-only. A player's timeline starts with only facts supported by their collected evidence. Newly retrieved records add supported entries; hidden rows and author explanations must not appear as placeholders that disclose their contents.

| ID | Local time on 12 October 2026 | Canonical event | Player support and limits |
|---|---|---|---|
| T01 | 19:42 | Maya proposes the private sale of VC-04, with payment due on next-morning collection after inspection | E12; proves expressed intent and proposed terms, not a completed theft, handoff, or payment |
| T02 | 22:55 | The combined condition-check/recorder-maintenance order is approved | E04; the procedure itself is legitimate |
| T03 | 23:09:30 | Maya enters the empty gallery with cart C2 | E08; identity and sole occupancy are verified from footage |
| T04 | 23:10:00 | The scheduled absence-notification hold starts | E04 and E05; sensor recording continues |
| T05 | 23:10:55 | Maya opens the display-case lid with key M-1 | E06 plus E08; key ownership alone is insufficient |
| T06 | 23:11:42 | Capsule state changes to absent; Maya conceals it before closing the lid | E05 proves the state change; E08 identifies the sole occupant; E11 later corroborates destination. Concealment has no separately measured timestamp |
| T07 | 23:12:10 / 23:12:16 | Maya closes the empty case and signs the capsule-return confirmation | E06 and E04; E05 contradicts the return claim |
| T08 | 23:12:28 | Maya leaves with C2; the gallery is empty and its door relocks | E08; footage follows C2 into the conservation bay at 23:13:04 |
| T09 | 23:14:00–23:17:02 | Actual camera recording gap; Daniel's reboot runs. Alex takes a call at 23:14:12–23:16:48 | E10 establishes outage; E09 and Alex's corrected account support the call. They do not provide a complete visual alibi during the gap |
| T10 | 23:17:00 | The hold expires; the still-empty case generates an absence notification | E03, E04, E05; notification is not the removal timestamp |
| T11 | 23:17:06 | Alex enters in response; at 23:17:14 he reports the empty display | E07, restored footage in E08, and E01 |
| T12 | 23:22:00 / 23:26:00 | Response team secures C2, then opens and inventories its lower drawer; VC-04 is recovered | E11, including chain of custody and identification |

The exact moment Maya made her decision, the exact concealment second, and events in the camera gap that no source observed must not be promoted to observed facts. The canonical removal time is the sensor transition; a player's equally valid reconstruction may say “during Maya's check, before 23:12:10.”

### Player timeline projection

Publish observations individually, with their source, rather than copying an entire canonical row when any one of its sources is collected. For example, E05 may add “23:11:42 — cradle sensor changes to absent”; it must not add “Maya steals the capsule.” E08 may separately add “Maya is the sole recorded gallery occupant during the check.” Connecting those observations is the player's deduction. E10 may reveal the camera gap without revealing Alex's call; that part of T09 requires E09. The sign-off appears as Maya's documented claim, not as a verified return. The concealed placement in C2 is never displayed as a directly observed timestamp. Notebook hypotheses stay visually distinct from source observations.

## 6. Evidence catalogue

There are exactly 12 evidence records. A record can contain related pages from one named dossier bundle. Do not hide a mandatory clue behind an extra, unlisted collectible. Source, Player content, and safe Reliability text are the authored basis for player records. Retrieval/Availability conditions, Role, author-only notes, and cross-record interpretations are not player copy. A later content contract must enumerate each permitted field explicitly; never expose whole catalogue entries and try to strip spoilers heuristically. E09's player provenance is its Source summary and quoted Player content, not the author analysis in Collection context.

### E01 — Incident handover and gallery plan

- Source: response-team handover compiled at 23:40; includes the incident report, room plan, system legend, clock verification, and VC-04 inventory description.
- Availability: initial inventory.
- Player content: “23:17:00: capsule-absence alert. 23:17:14: Alex Reed reports the display empty through the closed lid. Gallery and display secured. No forced-entry damage. Assigned evening staff: Reed, Chen, Morgan. Capsule VC-04 contains the Vesper Diamond. Follow-up property and records reviews are filed separately.”
- Include only the physical layout, normal camera coverage/limitations, and trustworthy-record boundaries from section 4, including the distinction between gallery access and display-case access. Do not copy that section's author explanation of Maya's recorded occupancy or movements into this initial record; those observations belong to E08. The inventory says the capsule has an engraved serial and a tamper-evident seal.
- Reliability: reliable for the response team's observations and supplied system facts; “reported missing” does not establish removal time or perpetrator.
- Role: orientation, object identification, and protection against unstated physical or clock assumptions.

### E02 — Initial staff statements

- Source: recorded interviews at 23:35, attached to the handover. These are the opening accounts, not objective truth.
- Availability: initial inventory; each statement has a clickable subject and topic.
- Alex: “I stayed at the security desk until the alarm. I used my badge to get into the gallery after it sounded.”
- Maya: “I checked the capsule and returned it before I closed the case. Nothing from the display left the room in my cart.”
- Daniel: “The recorder restart was scheduled. The required recording export completed before I started.”
- Reliability: authentic quotations; the claims require corroboration. Do not mark lies in the player's initial presentation.
- Role: establishes three specific, testable accounts. Later responses are appended to interview history; these original statements are never overwritten.

### E03 — Alarm notification extract

- Source: independently preserved display-controller notification history, exported at 23:28.
- Availability: initial inventory.
- Player content: “23:17:00 | CASE-1 | NOTIFICATION RAISED | CAPSULE ABSENT | notification mode: normal.” The legend says the time is when the message was emitted; it does not claim to record the first absent state.
- Reliability: accurate notification timestamp; insufficient to date the removal.
- Role: establishes the apparent incident time and opens the maintenance-record request.

### E04 — Approved work order and return sign-off

- Source: museum work order WO-117, approved at 22:55, containing the schedule, procedure, and signed completion entry.
- Retrieval: R01, available after inspecting E03.
- Player content: “Curator capsule check: 23:10–23:13. Absence-notification hold: 23:10–23:17. Camera recorder restart: 23:14–23:17. Capsule may be lifted for inspection inside the gallery and must be returned before lid closure. Occupancy history continues throughout notification hold. Do not remove collection items from the gallery. Technician must export recordings before reboot.”
- Signed entry: “23:12:16 — Maya Chen — VC-04 returned to cradle; lid closed; condition check complete.”
- Reliability: authentic approved procedure and signature; a signed assertion does not prove the capsule was returned. The schedule is not proof of actual reboot duration.
- Role: explains delayed notification, defines authorized handling, and provides Maya's written claim to compare against E05.

### E05 — Raw capsule occupancy history

- Source: local display-controller historian, exported at 23:29 with sensor check and clock verification. Independent of the camera recorder.
- Retrieval: R02, available after inspecting E03 and E04.
- Player content:
  - “23:09:00–23:11:41 — capsule PRESENT.”
  - “23:10:00 — notification hold ON; sensor logging ACTIVE.”
  - “23:11:42 — capsule PRESENT → ABSENT.”
  - “23:11:42–23:25:00 — capsule remains ABSENT; no intervening PRESENT state.”
  - “23:17:00 — notification hold OFF; current absent state emitted as notification.”
  - “Post-incident sensor diagnostic passed. No historian discontinuity in supplied interval.”
- Reliability: verified occupancy history, maximum one-second clock error. It identifies a physical state change, not an actor or the capsule serial by itself.
- Role: proves removal preceded both camera gap and alarm; disproves return before closure when paired with E04/E06. This is the timing revelation.

### E06 — Display-case lid and key audit

- Source: display-controller access/contact history and collections key assignment register.
- Retrieval: R03, available after inspecting E07.
- Player content: “M-1 assigned to Maya Chen. 23:10:55 — authorized key M-1, lid OPEN. 23:12:10 — lid CLOSED and LOCKED. No further lid-open event through 23:25. Tamper circuit continuous; no forced-access event.”
- Reliability: reliable event sequence; key assignment is not proof of who held it. Independent observation is needed to establish the person's identity. Do not name an uncollected supporting record in the player's reliability text.
- Role: distinguishes the earlier case opening from Alex's later gallery-door entry and bounds the removal interval.

### E07 — Gallery-door access extract

- Source: gallery access controller; report for the alarm-response interval, 23:16:50–23:18:00.
- Availability: initial inventory. The interval is visible, so this excerpt is never presented as the full evening's access history.
- Player content: “23:17:06 — credential A-2, assigned Alex Reed, inbound GRANTED. 23:17:07 — gallery door OPEN. 23:17:12 — gallery door CLOSED.” The legend explicitly identifies the gallery door, not the display-case lid.
- Reliability (player-visible): records use of a credential assigned to Alex during the stated interval; a credential alone does not identify its holder. Compare event times with other collected records.
- Author-only cross-reference: E08 independently verifies Alex was its holder then; do not disclose that supporting record before collection.
- Role: fair initial suspicion; motivates comparing the separate case audit and checking nearby footage. Does not identify the thief alone.

### E08 — Preserved corridor footage and transcript

- Source: preserved camera recording covering 23:09:00–23:14:00 and 23:17:02–23:18:00, with accessible transcript and labelled stills.
- Retrieval: R04, available after inspecting E07.
- Player content: empty gallery at start; Maya enters with C2 at 23:09:30; Maya is the sole occupant, visibly at the case during 23:10:55–23:12:10; her hands and the capsule are obscured by the cart; she leaves with C2 at 23:12:28; gallery empty afterward; C2 enters the conservation bay at 23:13:04. Recording unavailable 23:14:00–23:17:02. After recording resumes, Alex enters at 23:17:06.
- Reliability: identifies people, room occupancy, and cart movement. It cannot independently prove the capsule was in the cart or describe unseen events during the gap.
- Role: prevents the “stolen key” shortcut from undermining identification; links Maya to the removal interval when paired with E05/E06; opens the cart-report request.

### E09 — Security-desk and call record

- Source: security-console lock audit and a witnessed copy of Alex's handset call-history entry, filed at 23:38. After his 23:35 opening account, the response team asks at 23:36 to check his call timing against the duty log. Alex consents to show the entry; a responder records its start time and duration, confirms the handset's displayed time zone against museum local time, and has Alex confirm that the copied entry is his outgoing call. The recorded duration is 2 minutes 36 seconds. The caller's identity and number are omitted from the dossier.
- Collection context: Alex acknowledges making a call but continues to claim he was at the desk. He cooperates because call metadata alone cannot show that he left his post. This is neither an unprompted offer of an alibi nor a pre-investigation admission of the alcove location. The player requests the already-filed copy through R05; cooperation in live dialogue is not required.
- Retrieval: R05, available after inspecting E02. Opening that record, including Alex's statement, satisfies the record-level inspection rule; no separate dialogue step is needed.
- Player content: “Desk console manually locked at 23:14:08; unlocked at 23:16:56. Personal outgoing call, start 23:14:12, duration 02:36, calculated end 23:16:48. Entry copied from handset with Reed's consent, witnessed and confirmed at collection. Reed acknowledges the call but maintains he stayed at the desk.” The source summary above is available in the record's provenance section. The call record does not contain audio or location data.
- Reliability (player-visible): reliable console/call times; neither alone proves Alex's physical location. The calculated call end comes from start plus duration, not a location trace.
- Author-only disclosure note: A05 supplies the later west service alcove admission. Do not place that admission in E09's content, provenance, limitations, or initial timeline; it is separately attributed corrected testimony only after delivery.
- Role: resolves his specific lie without pretending that a phone call is a complete alibi. E05 establishes the theft was already over before the call.

### E10 — Recorder maintenance execution trace

- Source: recorder job history and maintenance audit, exported at 23:30.
- Retrieval: R06, available after inspecting E04.
- Player content: “Operator D. Morgan. Pre-reboot export: SKIPPED BY OPERATOR. Reboot began 23:14:00. Recording resumed 23:17:02. Pre-reboot recording archive remains intact. No delete operation in audited job history. Display-controller historian is a separate device, unaffected by recorder reboot.”
- Reliability: reliable execution trace. It does not establish Daniel's whereabouts every second or rule out every imaginable wrongdoing; it resolves the specific maintenance claim.
- Role: distinguishes an authorized outage from a concealed procedural failure. E04/E05 show that neither caused the earlier removal.

### E11 — C2 property recovery report

- Source: response-team property search, seal log, photographs, and inventory comparison.
- Retrieval: R07, available after inspecting E08 and choosing “Trace cart C2.”
- Player content: “23:22:00 — cart C2 secured in conservation bay under seal S-19. Assigned custodian: Maya Chen. 23:26:00 — S-19 opened by response team; lower drawer opened using its assigned key surrendered by Chen. Sealed capsule engraved VC-04 recovered inside padding beneath condition-check materials. Capsule seal and inventory photographs match E01. Inventory examination confirms the Vesper Diamond inside. No authorized collection transfer for VC-04 is recorded.”
- Reliability (player-visible): strong recovery and chain-of-custody evidence. Custody or a drawer key alone does not prove when the capsule entered the cart; removal timing needs independent support.
- Author-only cross-reference: E05/E06/E08 establish the removal sequence; do not name an uncollected supporting record in this limitation.
- Role: corroborates the destination, refutes Maya's claim that nothing left in her cart, and provides the capsule reference for the correspondence request. It does not require Maya to agree to a search in live dialogue.

### E12 — VC-04 correspondence extract

- Source: incident dossier's preserved museum-account correspondence, exported at 23:45. Sender attribution to Maya is verified.
- Retrieval: R08, available after inspecting E11 and choosing “Review correspondence referencing VC-04.” No typed keyword or external mailbox access is required.
- Player content: “19:42, Maya Chen to private correspondent: ‘VC-04, the Vesper capsule. Proposed price: $180,000, payable to me when you collect tomorrow after the morning shift begins, subject to your inspection. Keep the capsule sealed. No museum invoice.’ Reply: ‘Agreed in principle. Payment at collection, after inspection.’”
- Reliability: proves a private proposal and agreement in principle, not a completed payment, successful handoff, or physical removal.
- Author-only boundary: no forged-account subplot is permitted. The correspondent never appears in the museum.
- Role: supports planned personal sale and intent; distinguishes the supported theft narrative from an accidental failure to return an item. It cannot establish the physical crime by itself.

## 7. Evidence relationships and deductions

Unlock relationships guide access to source material. Reasoning relationships describe what sources support; the interface must not label a suspect guilty merely because records were collected.

| ID | Relationship | Supported interpretation | Limit |
|---|---|---|---|
| G01 | E04 contextualizes E03 | A held notification can appear later than removal | Does not locate the removal without E05 |
| G02 | E05 + E04 contextualize E03 | The capsule was absent from 23:11:42; 23:17 was notification on hold expiry | No actor identified |
| G03 | E05 + E06 contradict E04's sign-off and Maya's E02 return claim | The capsule was not returned before the case closed | Needs E08 to identify the person performing the check independently of key ownership |
| G04 | E05 + E06 + E08 corroborate the removal reconstruction | Maya alone occupied the gallery while the capsule disappeared and the case was open | Does not itself prove the planned sale |
| G05 | E08 + E11 corroborate destination | Maya took C2 to the bay; the missing capsule was recovered in C2 | Recovery alone cannot prove a timestamp |
| G06 | E03 + E07 contextualize Alex's entry | The credential entry followed the alarm | A later entry does not alone rule out earlier involvement |
| G07 | E09 challenges Alex's E02 desk claim | His account needs correction; he admits leaving for the call | Console lock and call history alone do not prove location or theft |
| G08 | E04 + E10 contradict Daniel's E02 export claim | The reboot was authorized, but he skipped a required step | A procedural breach is not proof of theft |
| G09 | E05 + E10 contradict “the capsule was removed during the camera gap” | The recorded removal predates the gap | Does not mean cameras could see through the cart |
| G10 | E11 + E12 support sale intent for the recovered object | The capsule she offered for personal payment is the missing capsule | No completed sale or payment |

### Saved comparison notes and report hypotheses

A comparison note is a private, unscored reasoning aid, separate from canonical evidence, attributed testimony, the report draft, and submitted conclusions. It links at least two distinct records collected in the current run, optionally identifies a passage/claim in each, records a player-selected relation (Corroborates, Contradicts, Contextualizes, or Unsure), and requires a short player interpretation. A note may link more than two records so a multi-source contradiction need not become several artificial notes. Comparisons are directional: the player identifies which source(s) they are using and which source/claim they are comparing against. No authored G01–G10 relation is preselected or validated as correct.

Create, list/view, edit, and explicitly confirm deletion of notes in Evidence & Timeline. Saved notes survive navigation and resume; edits replace the saved note after acknowledgement. Cancelling an edit/deletion preserves the prior note. Duplicate links add no support; removing links below two prevents saving while preserving the local edit. Unknown, uncollected, and review-only sources cannot be linked. Evidence is never deleted by deleting a note. Notes neither unlock dialogue/evidence nor affect scoring, and are never copied into or submitted with a report. UI_DESIGN section 6 defines the interaction and save/error behaviour.

The report draft separately contains seven claim groups and eight scored fields. D02 has two independent fields, timing and return. These are tentative hypotheses until explicitly submitted. Opening or editing them gives no correctness feedback or discovery. The table is an author mapping of answer meanings, not text to expose wholesale on a fresh report; neutral prompts and disclosure-safe option availability are specified in UI_DESIGN section 7.

| ID | Claim being evaluated | Authored answer meanings |
|---|---|---|
| D01 | Meaning of 23:17 | Removal time; delayed absence notification; insufficient evidence |
| D02 timing | Removal interval | During the curator's check before case closure; during camera outage; after Alex's entry; insufficient evidence |
| D02 return | Return account | Returned before closure; not returned before closure; unestablished |
| D03 | Responsible person | Alex; Maya; Daniel; insufficient evidence |
| D04 | Destination | Left the gallery in C2; left with Alex; moved by Daniel; destination unestablished |
| D05 | Alex's entry | Alarm response; display-case opening; theft time; unestablished |
| D06 | Maintenance account | Authorized reboot with skipped export; concealed deletion of theft footage; no discrepancy; unestablished |
| D07 | Intent | Planned private sale; authorized relocation; accidental misplacement; motive unestablished |

Each scored field has its own deliberately assigned source roles from section 12. A comparison note or interview presentation is never a substitute. A report may include optional unscored explanation text written by the player; private notes remain outside that report.

## 8. Record access and progression rules

Definitions: **collected** means a record belongs to the session; **inspected** means the player opened its content at least once. Opening an initial record marks it inspected. A successful retrieval collects and opens its record together. Dwell time, scrolling, model opinion, typing a password, and correct deductions are never requirements.

| Action | Visible when | Player action label | Result |
|---|---|---|---|
| R01 | E03 inspected | Retrieve the maintenance work order | Collect/open E04 |
| R02 | E03 and E04 inspected | Retrieve raw capsule occupancy history | Collect/open E05 |
| R03 | E07 inspected | Compare display-case access | Collect/open E06 |
| R04 | E07 inspected | Inspect corridor recording | Collect/open E08 |
| R05 | E02 inspected | Check Alex's desk account | Collect/open E09 |
| R06 | E04 inspected | Inspect maintenance execution | Collect/open E10 |
| R07 | E08 inspected | Trace cart C2 | Collect/open E11 |
| R08 | E11 inspected | Review correspondence referencing VC-04 | Collect/open E12 |

Every action is a visible record request on its source evidence and in an available-leads list. It can also be offered while speaking to the relevant character, but its availability is controlled by the same rule. A model can suggest an already available action; it cannot execute or authorize an unavailable one. Guessed record IDs or user-supplied copies do not count as collected records.

Repeat requests are harmless: return the existing record with no duplicate items or extra progress. Requests with unmet conditions return an ordinary unavailable-action result without the hidden record's content. The graph contains no cycles, dead ends, or “convince the liar” dependencies.

Record collection does not require accusing someone, choosing a correct hypothesis, or exhausting a conversation. Characters cannot permanently refuse access to the dossier. This keeps both model-assisted and scripted play solvable.

## 9. Character design and deception rules

Detailed reply profiles and samples are in [CHARACTER_DIALOGUE.md](CHARACTER_DIALOGUE.md).

| Character | Voice and relationship | Knows | Conceals or misunderstands | Cannot know |
|---|---|---|---|---|
| Alex Reed | Brief, practical, defensive about duty; respects Maya's seniority, distrusts Daniel's outages | His call, his alarm response, what he saw after entering, normal security procedure | Intentionally lies about staying at desk; initially assumes the outage was relevant | Maya's private sale, concealment, or the exact removal time before shown records |
| Maya Chen | Precise, controlled, uses collections terminology; supervises condition checks, requested the legitimate shared work window | Her own theft, signed false return, C2 hiding place, private-sale plan, approved schedule | Intentionally lies about return and cart contents; wrongly believed notification hold prevented useful removal history | Alex's private call or Daniel's skipped export until presented; no knowledge of all system logs |
| Daniel Morgan | Technical, impatient with imprecise timestamps, embarrassed by shortcuts; works alongside both | Approved maintenance, actual reboot, skipped export, separation of recorder and case controller | Intentionally lies about export completion; has no evidence of who stole the capsule | Maya's actions inside the gallery, private deal, Alex's reason for leaving until shown relevant records |

Distinguish four content classes:

1. **Verified record fact:** an observation supported by a named record, with that record's limits.
2. **Intentional authored lie:** only the specific false accounts listed above; it remains testimony, never overwrites the case facts.
3. **Belief or uncertainty:** Alex's suspicion about the blackout and Maya's mistaken technical assumption. Characters must qualify uncertainty; the latter is author background and is not disclosed during interrogation.
4. **Model error:** any new clue, alibi, time, witness, secret, or contradiction outside approved content. Reject or replace it; never adopt it as an improvised plot twist.

There is no required faulty-memory puzzle in this case. Do not fabricate one to create extra contradictions. Alex's and Daniel's secrets are unrelated to the theft, and the player should be able to explain that distinction.

## 10. False leads and their fair resolution

| Lead | Why suspicion is reasonable | Evidence that resolves it | Remaining consequence |
|---|---|---|---|
| Alex's credential near 23:17 | A door entry occurs seconds after the reported incident time | E03/E07 order the response; E05/E06/E08 locate removal earlier with Maya | Alex still lied about his desk duty; E09 prompts the correction |
| Daniel's recording gap | His maintenance removes camera coverage; his export claim is false | E04 authorizes reboot, E10 reveals the omission, E05 places removal before the gap | He still breached procedure; the case does not excuse it |
| Legitimate curatorial handling | Maya was permitted to open the case and temporarily lift the capsule | E04 requires return, E05/E06 disprove return, E08 identifies Maya, E11 traces the object, E12 supports intent | Her job access enabled the theft; job title alone does not establish guilt |
| “A key could have been borrowed” | An assigned credential is not a biometric identity | E08 independently identifies Maya as the sole occupant during E05/E06's interval | Do not teach players to equate account ownership with physical identity |

There is no extra fourth suspect, hidden accomplice, unsupported sensor fault, or twist after a correct submission. The authored final explanation answers the apparent contradictions using evidence available before submission.

## 11. Walkthroughs and pacing

### Suggested first playthrough, approximately 10–20 minutes

1. Read the incident and initial statements; meet the three people of interest (2–3 minutes).
2. Inspect the alarm and door record; retrieve the work order, case audit, and footage (2–3 minutes).
3. Question Alex and Daniel; inspect their supporting records and distinguish their lies from the theft (2–4 minutes).
4. Retrieve raw occupancy history and compare it with Maya's return sign-off (2–3 minutes).
5. Trace C2, inspect recovery and correspondence, and challenge Maya's account (2–4 minutes).
6. Select conclusions and attach evidence; submit and read the outcome (1–3 minutes).

These are pacing estimates, not measured performance. The evidence can be retrieved in other valid orders. The complete dossier has eight record requests beyond the four initial records; E09 and E10 enrich the false leads and scoring but do not gate proof of Maya's removal. The responsibility-and-intent path uses six requests, excluding those two branches.

### Shortest supported responsibility path

Inspect E03 and request E04 then E05. Inspect E07 and request E06 and E08. The combination E04/E05/E06/E08 establishes unauthorized non-return, removal time, and Maya's physical identity. Add E11 for destination and E12 for sale intent. This path requires neither a confession nor completing Alex's or Daniel's secondary branches.

### Fully offline path

Use the same record requests, character topic buttons, evidence-presentation controls, timeline, and final deduction form with authored replies. All records and scoring remain reachable when Ollama is unavailable. An unmatched free-text question offers relevant visible topics without changing state. Offline play receives the same possible score.

### Incomplete path

A player can leave any or all fields unestablished and submit an incomplete report after explicit confirmation. This creates an inconclusive attempt, not a completed/locked investigation. They may keep investigating and submit later without reset. Feedback disclosure is subject to Q1 in section 14; it must not invent an answer.

## 12. Final deduction and deterministic scoring

### Report draft and submission

Progress through Event sequence, Responsibility and destination, and Accounts and intent, then a complete review of all eight fields. Players can go back, skip unanswered fields, save and leave, or review an incomplete report. Save choices, per-role citations, and optional unscored report explanation to the current run; drafting never creates an attempt.

Each valid, explicitly confirmed submission creates a new immutable attempt, even when identical to an earlier one. Attempts are unlimited and never close the investigation. Store the exact answers, role-to-record citation assignments, optional report explanation, per-field and total score, outcome, submission time/order, run association, and the collection/disclosure context and case/rubric version needed to interpret that result later. Do not include comparison notes or replace snapshot data with pointers to the editable draft. Submission order is a case-wide increasing attempt number retained across resets, with the originating run shown separately. This is local result history, not accounts or a leaderboard.

The complete review must match the submitted snapshot. A changed draft requires refreshed review and confirmation. Pending saves must be acknowledged or the exact reviewed content committed together with the submission; never silently grade an older saved draft. Invalid shape, unknown/uncollected IDs, unavailable answer options, or multiple records in one citation role are rejected without an attempt or hidden disclosure. Blank roles, incomplete reports, wrong conclusions, and irrelevant but collected citations are valid. Confirmation cancellation creates no attempt.

A retry/double-click for one confirmation reconciles that one stored attempt; it must not create a duplicate. A later deliberate confirmation creates a new attempt. Concurrent confirmations receive distinct committed order numbers. If reset changed the run while a confirmation was pending, reject the stale action rather than submit old-run content against the new run. Exact storage/API mechanisms are later contract work.

### Evidence sufficiency and focused citations

Use the existing eight rows, maxima, partial tiers, and success gates unchanged. The scorer uses the selected answer and deliberately assigned evidence roles, validated against collection at submission. It does not read model judgements, private notes, optional prose, record counts, or interview counts.

**Draft mechanism closing the citation loophole:** each claim has two or three named proof roles below, with one collected record or blank per role. All collected records are available in each picker, without relevance highlighting, auto-assignment, bulk attach, or a select-all command. Source IDs in the table are author-only grading keys. A source earns support only for the role the player assigned; the scorer never searches a bag of attachments for a winning subset. An irrelevant record or a relevant record in the wrong role contributes no support to that role, without negative points or deductions from other supported roles. Selecting a source in one field never fills another field.

| Scored field | Player-visible source roles → authored acceptable source | Full support | Partial support |
|---|---|---|---|
| D03 responsibility | Removal timing → E05; Display access → E06; Physical identity → E08 | All three roles supported | Access and identity supported, timing unsupported |
| D02 timing | Recorded state → E05; Interval boundary → E06 | Both supported | State supported, boundary unsupported |
| D01 notification | Reported event → E03; Procedure → E04; Recorded state → E05 | All three supported | Event and procedure supported, state unsupported |
| D04 destination | Observed movement → E08; Object location → E11 | Both supported | Location supported, movement unsupported |
| D02 return | Account and obligation → E04; Recorded state → E05; Closure → E06 | All three supported | Account/obligation and state supported, closure unsupported |
| D05 Alex's entry | Notification → E03; Entry → E07; Wider timing → E05 | All three supported | Notification and entry supported, wider timing unsupported |
| D06 maintenance | Authorized procedure → E04; Actual execution → E10; Wider timing → E05 | All three supported | Procedure and execution supported, wider timing unsupported |
| D07 intent | Expressed purpose → E12; Connection to the missing object → E11 | Both supported | Purpose supported, object connection unsupported |

These are the exact acceptable combinations for this rubric; other subsets earn zero for that field. No new case facts or alternative proof bundles are added. E02 can be useful in notes and challenges but does not replace E04's written sign-off plus obligation in D02 return. E09 explains Alex's personal lie but supplies none of the scored roles. The same record may be deliberately used across fields; repeating it in different roles does not multiply its evidential meaning. Role matching uses source identity, not semantic grading of a written justification.

In the unchanged tier table below, “attach” now means nominate in its corresponding role, and “without” means the specified role is unsupported, whether blank or filled with an irrelevant citation. For each row award only the highest supported tier for the correct answer. A wrong/unestablished answer scores zero. Irrelevant records do not erase a valid partial tier. For example, D03 with E06 in Display access, E08 in Physical identity, and E01 in Removal timing still earns 10, exactly as a blank timing role does. Full support cannot be earned by submitting all 12 IDs in a role; that is invalid form shape, not a point penalty. Neither client nor backend may silently prune, rearrange, or nominate a best subset.

This preserves the full/partial evidence combinations and the 100-point total while requiring the player to explain each source's function through structured assignment. It does not claim to prevent a lucky guess or learning across unlimited attempts. The V1 approval adopts this role interaction and neutral option gating. One selected record is required for each role; existing multi-record proof combinations remain valid and are explicitly tested.

| Category / card | Maximum | Full-credit rule | Partial-credit rule |
|---|---:|---|---|
| Responsible person / D03 | 25 | Select Maya; attach E05 + E06 + E08 | Select Maya with E06 + E08 but without E05: 10; any other Maya guess: 0 |
| Removal interval / D02 | 15 | Select during the curator's check before closure; attach E05 + E06 | Same selection with E05 but without E06: 8 |
| Meaning of 23:17 / D01 | 15 | Select delayed notification; attach E03 + E04 + E05 | Same selection with E03 + E04 but without E05: 8 |
| Destination / D04 | 15 | Select left in C2; attach E08 + E11 | Same selection with E11 but without E08: 7 |
| False return account / associated D02 evidence comparison | 10 | Select “capsule was not returned before closure”; attach E04 + E05 + E06 | Same selection with E04 + E05 but without E06: 5 |
| Alex's entry / D05 | 5 | Select alarm response; attach E03 + E07 + E05 | Same selection with E03 + E07 but without E05: 2 |
| Daniel's discrepancy / D06 | 5 | Select authorized reboot with skipped export; attach E04 + E10 + E05 | Same selection with E04 + E10 but without E05: 2 |
| Intent / D07 | 10 | Select planned private sale; attach E11 + E12 | Same selection with E12 but without E11: 5 |

D02 therefore includes a separate report selector, independent of private comparison notes: “returned before closure,” “not returned before closure,” or “unestablished,” with its own evidence roles. This is an explicit scored field, not something inferred from free text or a saved comparison note. E09 has no standalone points: its purpose is the optional personal contradiction and a fuller explanation of Alex's behaviour. No record-count or interrogation-count bonus is proposed.

To receive **Case established**, a report must score at least 70 and receive full points for responsibility, removal interval, and delayed notification. This prevents a collection of correct side observations from passing with an unsupported culprit.

- **90–100, core proof met:** Case established — comprehensive reconstruction.
- **70–89, core proof met:** Case established — supported reconstruction.
- **40–69, or 70+ without core proof:** Incomplete reconstruction — useful findings, responsibility/timing not fully established.
- **0–39:** Inconclusive report.

An incorrect named culprit additionally receives “Accusation unsupported” in the result, whatever the numeric score. Choosing insufficient evidence gives “No supported accusation submitted.” Those labels take precedence over any celebratory treatment. A score is a game rubric, not a legal finding.

### Worked scoring examples

- All eight correct selections with their complete cited sets: 100, comprehensive reconstruction.
- Maya selected with no evidence, all other fields unestablished: 0, inconclusive report.
- Full responsibility, removal, notification, false-return, and destination support; Alex, Daniel, and motive unanswered: 80, supported reconstruction.
- Correct core three rows plus the full false-return row, other fields unanswered: 65, incomplete reconstruction; enough to identify the mechanism, below the complete-report threshold.
- Alex accused; every other row fully correct: 75, accusation unsupported and incomplete reconstruction because the responsibility gate fails.
- Maya with E06/E08 only and nothing else answered: 10; opportunity is not proof of removal.

### Authored outcome

A confirmed submission stores the deterministic score and permits review of that attempt's frozen answers and citations. Approved Q1: show total/outcome and submitted material first. Detailed category reasons, missing-proof feedback and the full reconstruction require a separate explicitly confirmed spoiler reveal, available after at least one submission in the current run. Reveal never grants evidence, permissions or retrospective score. Further attempts remain allowed.

When solution review is authorized under the chosen policy, show the same reconstruction regardless of score. Clearly label previously uncollected records or unelicited testimony as “Revealed in case review,” with their original attempt/run context. They never enter the active inventory or grant interview flags/credit. A later attempt may cite only records actually collected in its current run.

Solution text for authorized review under the chosen Q1 policy, with source links supplied by the result view:

> The combined evidence establishes that Maya Chen removed the Vesper capsule during her authorized check and took it out in cart C2. The theft itself was not captured on video.
>
> The machine records show the cradle changing to absent at 23:11:42 and staying empty after the lid closed at 23:12:10. The case audit records no later opening in the supplied interval. The preserved footage independently identifies Maya as the sole person in the gallery during the check and shows her leaving with C2 at 23:12:28. Her hands and the capsule are obscured in that footage. These are separate observations that must be considered together. [E05, E06, E08]
>
> Maya's signed entry claims she returned the capsule; the occupancy and closure records contradict that claim. The response team's later inventory records VC-04 recovered from C2's lower drawer. Taken with the removal interval and Maya's movements, the recovery supports the conclusion that she carried the capsule out in C2. It does not make the concealed hand movement a filmed event. [E04, E05, E06, E08, E11]
>
> Her correspondence proposes a $180,000 private sale, with payment due on a future collection after inspection. It supports intent, not a completed payment or handoff. The work order and sensor history explain the 23:17 alert as a notification emitted when the hold expired, after the capsule was already absent. [E03, E04, E05, E12]
>
> Alex's logged entry followed the notification. His desk account changes when challenged: the call record establishes timing, while his admission supplies the west service alcove location. Daniel's execution trace contradicts his export claim, but his reboot began after the recorded removal. Their separate failings do not explain the earlier removal by Maya. [E02, E03, E05, E07, E09, E10; Alex's corrected testimony]

### Source classes in the explanation

| Class | What may be stated in authorized solution review (Q1) | Boundary |
|---|---|---|
| Recorded observation | E08 shows Maya's presence and cart movements; E11 documents the response team's observed recovery | Neither source observes the original hand movement into the drawer |
| Machine record | E05 occupancy transition, E06 lid events, E07 credential use, E10 maintenance events, E09 console/call timing | A machine event does not alone identify a thief; E09's call end is derived from start plus duration |
| Character statement | E02 opening accounts, E04 return sign-off, Alex's later location admission | An authentic statement is not automatically true; the alcove is testimony, not geolocation |
| Established conclusion | Maya removed and transported the capsule; the alarm was delayed; E12 supports intended private sale | Explicitly attribute this reconstruction to the combined sources, not to a video of the theft or a confession |
| Author-only detail | The exact concealment gesture, its unmeasured second, Maya's mistaken belief about sensor history, and her unobserved internal thinking | Never presented as independently observed or required for scoring; omit from player-facing reconstruction |

If the player never obtained Alex's correction, label that statement “revealed in case review,” distinct from E09. Reviewing it must not retroactively set an interview flag or imply that the player elicited it. Initial lies remain historical testimony. The canonical review may explain their falsity only once its disclosure is authorized under the Q1 policy.

An attempt is final only as a snapshot. The ongoing draft, evidence discovery, conversations, and notes remain editable under their usual rules. Reading a result does not regrade it. Later discoveries or a changed rubric must never silently alter historical scores.

## 13. Resume, reset, and replay

- Resume restores the current run's collected/inspected records, dialogue and disclosure stages, saved comparison notes, report draft with role assignments, and access to historical attempts. Unsent chat text and unsaved edits have no reload guarantee.
- Submission leaves the working draft in place for editing and another deliberate confirmation. It changes no evidence ownership, note, or character stage.
- Case definitions and source records never mutate because of player text or a model response.
- Confirmed reset/replay starts a fresh run: E01/E02/E03/E07 collected but uninspected, no other collected evidence, original character stages, empty conversations, notes and report draft, and no submissions belonging to the new run yet.
- Reset clears the old run's working notes, conversations, draft, inspection/disclosure state and current-view caches. Its confirmation lists these losses and explicitly says “Saved submissions will be kept.” Reset does not delete, renumber, regrade, or overwrite any historical attempt.
- Historical attempts remain reachable in a separate labelled history context, including their submitted answers, source references/content available for those citations at submission, and saved score. They cannot be restored as evidence ownership, testimony, notes, or a draft in a fresh run. No full run-archive or one-click reuse feature is required.
- History can contain spoilers the player already submitted or previously revealed; mark its run and warn before opening history from a fresh replay. Keeping that history does not promise the player can forget the solution. Current-run search, pickers, timeline, and dialogue still use current-run permissions only.
- Stale responses and browser Back must not restore old-run state into the current investigation. Reset failure preserves the run; uncertain outcomes reconcile before retry.
- Replay uses the same culprit, timeline, and rubric. Viewing an attempt does not require reset; neither does creating another attempt in the active run.
- Deleting historical results is a separate operation and is not specified or added to the MVP by this revision. Reset must never serve as implicit history deletion.

## 14. Review decisions and handoff

Maya remains provisionally agreed. The existing removal/notification mechanism, sealed VC-04 capsule, C2 recovery, intended sale, and Alex/Daniel accounts are preserved for review. Version 0.2's corrections below remain in force. Version 0.3 incorporates the user's confirmed notes, scoring safeguards, visible-topic gating, progressive report, unlimited attempts, and history-preserving replay decisions; it does not imply approval of all case or UI details.

| Correction | Changes | Preserved |
|---|---|---|
| E12 future payment | Offer, T01, canon, dialogue, and final explanation specify proposed price and payment due at future collection after inspection | Sale motive; no completed payment, handoff, or confession |
| E09 provenance | Witnessed, consented handset copy collected after a responder request; call end derived from duration; Alex still claims he stayed at his desk | Call times, R05 access, and alcove location as later testimony |
| Explanation precision | Separate recorded observations, machine events, claims, combined inference, and author-only details | No direct video of the hand movement; same solution and rubric |
| A08 knowledge boundary | Removed mention of Alex's call from the sensor-only reply; the original profile ID and E05 presentation condition remain | All 29 profiles and existing challenge conditions |
| Initial-record visibility | E01 imports physical layout and system boundaries, not author observations of Maya's movements; E06's limitation text does not name an uncollected supporting record | Same observations remain discoverable through E08 and the unchanged retrieval path |
| Path description | Eight requests retrieve the whole dossier; six retrieve the responsibility-and-intent path | All 12 records, 12 timeline entries, R01–R08, and all scoring tiers |

Version 0.3 additionally separates safe E07/E09/E11 limitations from author cross-references, specifies private comparison notes, names each claim's proof roles, and replaces the single-submission lifecycle. No evidence content, event, retrieval prerequisite, character challenge set, score weight, or success threshold is changed.

**V1 decision record — 14 October 2026:** Q1 adopts total/outcome and submitted material first, with explicit spoiler reveal for full reasons and reconstruction. Q2 adopts one deliberate record for each evidence role, retaining every existing multi-record proof combination, exact partial tier and score weight. Q3 retains the 21 assignments pending a first-time pacing playtest. Q4 adopts the existing visual/input/wait defaults. These decisions were explicitly approved in the [V1 plan](../V1_PROTOTYPE_PLAN.md). Runtime results and remaining manual checks are in [verification](../V1_VERIFICATION.md).
