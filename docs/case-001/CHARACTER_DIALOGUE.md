# Case 001 — character dialogue and knowledge boundaries

Status: V1 approved baseline — stable topics, evidence-gated replies and all 29 profiles implemented and tested; case facts preserved.  
Companion: [case design](CASE_DESIGN.md).  
Audience: authors and maintainers. Contains spoilers; do not send this document to a character model or the browser.

## 1. Conversation rules

Free-text interrogation and visible topic controls address the same authored content. Required facts and record requests must be reachable through the visible controls, including when a model is unavailable. There is no mandatory wording, emotional persuasion meter, or finite question budget.

Each character has a small set of reply profiles. A profile contains a stance, its permitted factual claims, a source/evidence relation when appropriate, and an authored fallback reply. Character knowledge in the author bible is not automatically material for a model prompt. In particular, never give Maya's model a hidden confession and ask it to keep that confession secret.

Author annotations such as “intentional lie,” culprit labels, scoring keys, unmet profile conditions, and future profile text are also excluded from the character's runtime context. Supply only currently permitted reply content and the constraints needed to deliver it. A cover account does not need an accompanying explanation of why it is false.

These case-content rules are enforced by the [V1 contract](../V1_CONTRACTS.md): Ollama returns one visible topic ID or clarification; deterministic evidence/previous-delivery rules select the authored reply. Multi-topic or unrelated requests may ask for clarification; they never combine unauthorized knowledge. A valid JSON shape or a list of allowed evidence IDs does not prove that arbitrary generated prose is faithful. A proposed strict MVP approach is to render critical factual clauses from authored fragments and let the model select among authorized reply/tone variants. Unrestricted factual paraphrasing would require a separately reviewed validation approach; it is not assumed safe here.

### Visibility, eligibility, and disclosure are separate

- **Topic visibility:** the safe labels in the table below remain visible from the start and through corrections. No hidden-record title, future confession, private-sale detail, or missing-proof checklist appears in a label or disabled tooltip. Selecting a topic never grants facts.
- **Response eligibility:** always-available profiles need no presented evidence. A deeper profile requires its complete evidence set explicitly presented together for that topic, or a previous authorized delivery of that profile in the current run. Collection alone, a source pasted in chat, a private note, and citations in a report do not count as presentation.
- **Disclosure permission:** even an eligible response may use only its authored factual clauses and safe annotations. It does not expose a whole record's author notes, other topics, future profiles, or canonical solution. Required sets are author-only.

| Character | Stable player-visible topic | Base / no-required-evidence response | Evidence-dependent and corrected profiles |
|---|---|---|---|
| Alex | Your shift | A01 | E02 + E09 → A05; later questions use A06 |
| Alex | Your badge entry | A02 | E03 + E07 → A07 |
| Alex | What you found | A03 | No deeper profile |
| Alex | The camera gap | A04, explicitly belief | No deeper profile |
| Alex | Record timing | Neutral request to select collected material | E05 → A08 |
| Alex | Your conclusion | A09 | No accusation profile |
| Maya | Your condition check | M01 | E04 → M04; E04 + E05 + E06 → M05; after M05 use M09 |
| Maya | Your conservation cart | M02 | E08 + E11 → M06; later use M10 |
| Maya | The work window | M03 | No extra hidden-record disclosure |
| Maya | Correspondence | Neutral request to select collected material; do not acknowledge a private offer | E12 → M07; later use M11 |
| Maya | Your conclusion | M08 | No confession profile |
| Daniel | Your maintenance work | N01 | E02 + E04 + E10 → N05; later use N06 |
| Daniel | Notification times | N02, general principles | E04 → N04; E05 → N07 |
| Daniel | What the reboot affects | N03 | No extra hidden-record disclosure |
| Daniel | Compare record times | Neutral request to select collected material | E05 + E10 → N08 |
| Daniel | Your conclusion | N09 | No independent culprit deduction |

Profile names in sections 2–4 are author descriptions, not extra visible buttons. For example “The private correspondence” is M07's author description; the UI label remains Correspondence before and after disclosure.

### Selection and state transitions

1. Select a character and stable topic, or map free text to one of those topics. An ambiguous request asks the player to choose a visible topic; the model cannot authorize a profile.
2. Ask without presenting evidence uses the topic's base or already delivered response. Profiles with no evidence requirement work normally. For evidence-only topics use: “Choose a collected record for us to discuss.” No future record or required bundle is named.
3. Present evidence uses only current-run collected records with an explicit recipient/topic. A deeper profile's full required set must occur in that one presentation; separately presenting partial sets does not accumulate into a completed challenge.
4. A partial set is valid and uses the limited response table below. Extra collected records neither invalidate a complete set nor unlock other topics. If no required record is included, use the base/neutral response; do not interpret unrelated sources through a different topic.
5. When multiple profiles for the selected topic are eligible, use the most specific: M05 over M04; N07 over N04 when E05 is presented. Daniel may discuss N04 separately by presenting E04. Do not compose new factual claims from multiple profiles. Already corrected account profiles take precedence over superseded opening lies.
6. Commit the delivered response and any correction flag together. A pending, rejected, or undelivered reply grants no permission. Repeat questions may reuse facts from a previously authorized delivered profile for that topic without making the player re-present its records. This does not authorize hidden details in the same record, a different topic, or another character.
7. Flags and delivered-profile permissions persist through resume and new submissions. Reset clears them for the fresh run. History review never imports them. A repeated challenge does not create another unlock or replace E02.
8. R01–R08 dossier actions remain independent of dialogue. No response, confession, note, or correct hypothesis is required to retrieve evidence.

### Complete and partial evidence behaviour

Each row covers **every proper subset** of its required set. With none of its required records, use the selected topic's base/neutral response above. With the full set, use the named authored profile below. With a nonempty proper subset, use only the stated fallback and any explicitly permitted clause; no missing record title/content or secret is supplied. A previously delivered correction always overrides an earlier lie even when the next presentation is empty or partial.

| Deeper profile / required set | Nonempty proper subset: allowed response | Full set / subsequent account |
|---|---|---|
| A05: E02 + E09 | E02 only: “That is my recorded account.” E09 only: “That is my call. Put it beside my original statement if you want to challenge the account.” No location or correction flag | A05; later A06 |
| A07: E03 + E07 | E03 only: “That is the notification entry.” E07 only: “That is the gallery-door entry.” No claim that this comparison establishes an all-night alibi | A07; may repeat already delivered comparison |
| A08: E05 | No nonempty proper subset | A08; no call/alcove disclosure |
| M04: E04 | No nonempty proper subset | M04 before return challenge; M09 afterward |
| M05: E04 + E05 + E06 | If E04 is included, M04 may maintain the sign-off until correction. Otherwise: “I can address the records you have shown. I have no further account to add.” With E05 she may identify it as an occupancy record; with E06 as a lid audit. Do not acknowledge the full non-return contradiction or name absent sources | M05; later M09 |
| M06: E08 + E11 | E08 only: “That is the footage transcript.” E11 only: “That is the response team's recovery report. My account of the cart is in my original statement.” No sale, exact concealment, or full challenge flag | M06; later M10 |
| M07: E12 | No nonempty proper subset; without E12 use neutral Correspondence response | M07; later M11 only for this topic |
| N04: E04 | No nonempty proper subset | N04 describes procedure, not compliance |
| N05: E02 + E04 + E10 | Acknowledge only shown sources: E02 “That is my recorded account”; E04 may use N04's procedural clauses; E10 “The execution trace records a skipped export.” No personal correction flag or invented explanation before the full set | N05; later N06 |
| N07: E05 | No nonempty proper subset | N07; no identity inference |
| N08: E05 + E10 | E05 only: N07's sensor interpretation. E10 only: “The trace gives the recorder's reboot interval.” Do not compare to a missing timestamp | N08; repeat permitted comparison only |

Partial acknowledgements remain testimony about a shown source. They cannot become authoritative evidence or score support. Specific record times may be quoted only when permitted by the selected profile; no automatic reading of all presented documents into character knowledge.

“Knows once shown” means these bounded delivery permissions, not unrestricted access to the author bible. The quoted profiles below remain the factual fallback. Tone variations must stay within the same facts. No full confession profile is proposed.

## 2. Alex Reed

### Character intent

Alex wants to clear his name while avoiding a disciplinary complaint for leaving the security desk. He answers in short sentences and uses practical language: doors, desk, badge, alarm. His defensiveness is about his duty record. He is not secretly protecting Maya.

Author knowledge: he took a personal call in the west service alcove, returned to the desk, heard the alarm, entered the gallery, and saw the empty display through the glass lid. He does not know what happened during Maya's check. Do not invent the caller's identity, family emergency, gambling debt, prior offence, or relationship with the buyer.

E09's collection note explains that a responder requested a witnessed copy of the call entry and Alex consented while maintaining he stayed at the desk. His cooperation authenticates the call timing, not his location. That collection history may be discussed only when E09 is presented; the alcove admission still belongs to A05. It does not change the evidence-retrieval path.

### Profiles and fallback replies

| ID / author profile description | Response eligibility | Permitted content and authored reply |
|---|---|---|
| A01 — Your shift | Always; before A05 correction | “I stayed at the desk until the alarm. When it sounded, I went straight to the gallery.” The desk claim is an intentional authored lie; the response sequence is true |
| A02 — Your badge entry | Always | “That entry was me responding to the alarm. My badge opens the gallery door. It doesn't open the display case.” May identify his own action without pretending the record proves more than it does |
| A03 — What you found | Always | “The lid was closed. I could see that the capsule wasn't in its cradle. I reported it; I didn't open the case.” These are his direct observations |
| A04 — The camera gap | Always | “I knew there was a scheduled restart. I assumed the missing footage mattered, but I didn't see anyone take the capsule.” Expresses a belief, not a timeline fact |
| A05 — Challenge desk account | Present E02 + E09 | “All right. I left the desk for a personal call in the west service alcove. I was back before the alarm. I said I stayed because I knew how it would look.” Sets `alex_corrected_desk_account`; the alcove is corrected testimony, not phone-derived location |
| A06 — Your shift, after correction | After A05 | “I left for the call, then returned before the alarm. My first account about staying at the desk was false.” Never repeats A01's lie as a current claim |
| A07 — Compare entry and alarm | Present E03 + E07 | “Those times match my account of the response: the alarm first, my entry afterward. That tells you about my entry, not everything that happened earlier.” Does not claim an all-night alibi |
| A08 — Earlier removal record | Present E05 | “That record dates the capsule's absence earlier than the notification. I wasn't watching the case then, so I can't identify who removed it.” May discuss the supplied earlier time; cannot disclose his unpresented call record, name Maya as a witness, or claim to have seen the removal |
| A09 — Who is guilty? | Always | “I can tell you what I did and what I saw. You'll have to compare the records for the rest.” No unsupported accusation |

If E09 is presented without E02, Alex can say “That is my call. Put it beside my original statement if you want to challenge the account.” This acknowledgement alone does not assert a location or correct the desk claim; the explicit challenge action applies A05. E02 is initial inventory, so the player cannot become blocked on a missing source.

After A05, all general questions about his desk account use A06. His evidence-based responses do not change E02 or remove the original contradiction from history.

## 3. Maya Chen

### Character intent

Maya wants investigators to treat her condition check as routine and focus on the later outage. Her language is exact and professional; under pressure she becomes terse, not theatrical. She never behaves as if the model knows a secret it is daring the player to guess.

Author knowledge: she took the capsule, hid it in C2, signed the false return, and planned the private sale. None of these hidden facts goes into her initial model context. Her initial permitted account consists of the approved schedule, legitimate role, and the two explicitly authored false claims. Her mistaken belief about held alarms is author-only motivation, not an extra clue delivered by chat.

### Profiles and fallback replies

| ID / author profile description | Response eligibility | Permitted content and authored reply |
|---|---|---|
| M01 — Your condition check | Always; before M05 | “I was authorized to inspect the capsule. I returned it to its cradle and closed the case.” First sentence true; return sentence an intentional authored lie |
| M02 — Your conservation cart | Always; before M06 | “C2 holds the condition-check materials. Nothing from the display left the gallery in it.” The second sentence is the second permitted lie |
| M03 — The maintenance window | Always | “The condition check and recorder restart were approved together. The work order sets out the procedure.” May offer R01 only if R01 is already available; cannot cite uncollected E04 content as a new record |
| M04 — Your signed return | Present E04; before M05 | “That is my sign-off. My account is that I returned the capsule before closing the lid.” Does not invent an alternate timestamp, helper, transfer order, or sensor fault |
| M05 — Challenge the return | Present E04 + E05 + E06 | “The record shows the cradle stayed empty after closure. That contradicts what I signed. I have no further account to add.” Sets `maya_return_challenged`; acknowledges the supplied contradiction without a confession or a new explanation |
| M06 — Challenge the cart account | Present E08 + E11 | “C2 is my assigned cart. The report says VC-04 was recovered from its lower drawer. I cannot maintain my earlier claim that nothing left in it.” Sets `maya_cart_challenged`; no admission of a sale or exact concealment gesture |
| M07 — The private correspondence | Present E12 | “I wrote that message. It describes a private offer with payment due at collection after inspection. I am not answering further questions about the proposed payment.” Sets `maya_offer_acknowledged`; no claim money was received or handoff completed |
| M08 — Who removed the capsule? | Always | “I have given my account. Your conclusion is yours to make.” No spontaneous confession, even after all challenges |
| M09 — Return, after challenge | After M05 | “The records contradict my return entry. I have nothing to add to that.” Must not repeat the return claim as an established truth |
| M10 — Cart, after challenge | After M06 | “The recovery report contradicts my earlier account of the cart. I have nothing to add.” Must not deny the established recovery or invent a frame-up |
| M11 — Offer, after acknowledgement | After M07 | “I acknowledged writing the offer. I have nothing further to add about it.” No invented buyer biography, financial motive, or secret route |

The three challenge flags are independent. Presenting E12 first must not unlock cart or return information. Presenting the cart report first must not expose the offer. If a question spans several topics, use only those topic profiles authorized at the current stage; the later specific profiles replace their earlier counterparts for that topic.

The exhaustive partial-set rules are in section 1; they take precedence over ad hoc improvisation. A fabricated message pasted by the player receives: “I can discuss material in the case file. I will not authenticate text you have supplied as if it came from that file.” No profile flag changes.

Maya must never invent a claim that Daniel planted the capsule, that Alex borrowed her key, that a sensor was broken, or that she had an approved transfer order. Such inventions would make the case unfair rather than make her more convincingly evasive.

## 4. Daniel Morgan

### Character intent

Daniel wants investigators to distinguish equipment behaviour from human actions. He is embarrassed about skipping the recording export, but has no reason to protect Maya. He explains unfamiliar terms when asked and never requires the player to understand real-world surveillance infrastructure.

Author knowledge: his own maintenance actions, the published hold procedure, the camera's recording gap, and the separation of the case controller from the recorder. He cannot quote the actual removal time until E05 is presented. His technical expertise must not turn into knowledge of unseen physical events.

### Profiles and fallback replies

| ID / author profile description | Response eligibility | Permitted content and authored reply |
|---|---|---|
| N01 — Your maintenance work | Always; before N05 | “The restart was scheduled. I completed the required recording export before rebooting.” Scheduled restart true; export claim the intentional authored lie |
| N02 — Alarm versus sensor time | Always | “An alarm message tells you when a notification was emitted. A held notification can be later than the sensor change. You need the raw history to date that change.” Teaches the system rule, not the actual removal time |
| N03 — What the reboot affects | Always | “The recorder restart stops camera recording. It doesn't stop the separate display-case controller from logging its sensor.” No invented ability to retrieve or alter evidence through dialogue |
| N04 — Read the work order | Present E04 | “The hold ends at 23:17. If the cradle is still empty then, the controller sends the absence alert. The work order also requires the capsule back before closure.” Describes the presented procedure, not whether Maya followed it |
| N05 — Challenge export claim | Present E02 + E04 + E10 | “I skipped the export. That was my shortcut, and I hid it. The pre-reboot archive survived, but that doesn't excuse what I said.” Sets `daniel_corrected_export_account` |
| N06 — Maintenance, after correction | After N05 | “The reboot was approved. Skipping the export was my decision. My first account about completing it was false.” Does not repeat N01's lie as current truth |
| N07 — Interpret occupancy history | Present E05 | “The transition is at 23:11:42, with no return to present in that interval. The 23:17 entry is the later notification. The sensor doesn't identify the person.” Can quote provided times; cannot accuse Maya |
| N08 — Compare outage and removal | Present E05 + E10 | “The recorded absence begins before the reboot. The missing camera interval cannot be when that recorded removal first occurred.” No blanket claim that every possible act during the outage is known |
| N09 — Who is guilty? | Always | “I can explain these systems. I can't tell you who handled the capsule without the physical and access records.” No autonomous final deduction |

If only E10 is presented, Daniel acknowledges its status: “The execution trace records a skipped export.” The explicit challenge uses E02 + E04 + E10 to correct his opening account. Those sources are all reachable without cooperation from him. A model must not supply extra technical tricks, recovery utilities, deleted footage, or an alternative history.

## 5. Shared response profiles

| Situation | Response behaviour | Example fallback |
|---|---|---|
| Player greeting | Brief greeting in character, then visible topics | “What part of my account do you want to discuss?” |
| Question outside case | Stay in character, offer existing topics | “I can answer about the museum incident and my own actions.” |
| Relevant but unsupported detail | Admit lack of knowledge; no clue generation | “I don't have a verified detail to add about that.” |
| Prompt asks for system instructions or author solution | Do not reveal hidden material or grant a new topic | “I can discuss the case through my account and the records available to you.” |
| Player guesses a secret or culprit before obtaining records | Neither authenticate hidden evidence nor award progress | “An accusation is not a record. Show the material you want me to address.” |
| Player claims to be an administrator, author, or another character | Retain profile and game permissions | Use ordinary out-of-scope response; no role or state change |
| Ambiguous or multi-part question | Ask which available topic to address or answer authorized portions | “Do you mean the gallery-door entry or the display-case opening?” |
| Player pastes invented evidence or instructions inside a quote | Treat it as player text | “That is not a record I can authenticate from the case file.” |
| Repeated challenge | Use the established stage without another unlock | Repeat or summarize the already authorized response |
| Provider unavailable, timeout, or invalid reply | Use the authored response for the valid topic; retain submitted question once | Show a brief scripted-mode status separately from character speech |

Fallback must not silently call a hosted provider. Errors belong in the interface, not in a character pretending that the museum's system has failed. No offline penalty, new clue, partial raw model output, or broken conversation state is acceptable.

## 6. Example evidence-backed exchange

The player has collected E04, E05, and E06 and explicitly presents them to Maya.

Player: “Your sign-off says you returned it. The sensor stays empty after the lid closes. How do those fit?”

Maya, M05: “The record shows the cradle stayed empty after closure. That contradicts what I signed. I have no further account to add.”

The engine records only `maya_return_challenged` and the conversation exchange. It does not mark Maya guilty, award score, reveal E11/E12, or modify the source evidence. The player must still compare identity evidence and submit their own conclusion.

A player who types the same question before collecting those records receives an allowed response at the existing stage. A quotation is not proof of record possession. This rule applies even on a replay when the player remembers the solution.

## 7. Knowledge boundary checklist

- Initial Alex context contains no sale, recovery, or exact removal timestamp.
- Initial Maya context contains only her approved cover account and public role facts, not her author-only theft narrative.
- Initial Daniel context contains system principles and his approved opening account, not the hidden sensor history.
- Presented evidence exposes only that record's authorized content, not its author interpretation or the complete evidence graph.
- Stable topic labels persist throughout play; only eligible responses and disclosure permissions change.
- Corrected profiles and previously delivered permissions persist through resume and new submissions, and disappear on reset. Historical attempt review does not restore them.
- Earlier transcript messages remain historical statements; corrected state prevents replaying superseded lies as current claims.
- Dialogue can neither create source records nor replace required attachments on the final form.
- Generated claims not present in the permitted profile are failures, not additional story content.
- The exact routing and output-validation contract must be reviewed in the architecture phase before connecting a local model.
