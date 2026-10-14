"use client";

import { useEffect, useState } from "react";
import type { View } from "@/lib/types";
import { Icon } from "./Icon";

const STEPS: { title: string; view: View; intro: string; tips: string[] }[] = [
  {
    title: "Read the briefing",
    view: "archive",
    intro:
      "Your job is to explain the incident using records and staff accounts.",
    tips: [
      "Choose Open investigation, read the briefing, then Begin investigation. If a run is already saved, choose Resume investigation.",
      "A useful starting route is: read records, follow leads, question staff, compare accounts, then build your report.",
      "There is no timer or required order. You can move between screens and return to a question later.",
    ],
  },
  {
    title: "Read records and follow leads",
    view: "evidence",
    intro: "Start with the records already collected in your dossier.",
    tips: [
      "In Evidence & timeline, choose Records and open an item from the list. Read the contents, event times and source limitations.",
      "Opening records can make requests available under Follow a lead. Choose an available request to add another record.",
      "You can retrieve every required record through these controls. You do not need a particular typed question or a confession.",
    ],
  },
  {
    title: "Question a staff account",
    view: "interview",
    intro: "An account is testimony. Let the records test it.",
    tips: [
      "Choose a person. Type a question and use Send question, or choose a visible topic and use Ask this topic.",
      "To challenge an account, choose a topic, open Present evidence, select collected records, then use Present to that person.",
      "Some deeper replies require several records presented together. A limited answer is not a dead end: keep investigating and return later.",
    ],
  },
  {
    title: "Compare and reconstruct",
    view: "evidence",
    intro: "Separate what a source records from what you think it means.",
    tips: [
      "Use Compare in a record reader and choose a second source. Look for a specific claim the sources support or contradict.",
      "Use Save an interpretation to make a private note. Link the records, choose your relation and write your reasoning; you can edit or delete it later.",
      "Open Timeline to inspect source-labelled observations. It updates with discovered evidence; V1 does not require dragging or arranging events.",
    ],
  },
  {
    title: "Build an evidence-backed report",
    view: "report",
    intro: "Your conclusion needs deliberately selected supporting sources.",
    tips: [
      "Work through the three report sections, then Review report. You may leave conclusions unestablished and go back to investigate.",
      "Each evidence role accepts one record. A claim with several roles may need several different records; one source for a whole claim may be insufficient.",
      "Collecting, comparing or presenting a record does not automatically cite it. Private notes and the optional report explanation earn no points.",
    ],
  },
  {
    title: "Submit and keep investigating",
    view: "report",
    intro: "A submission saves your reasoning without closing the case.",
    tips: [
      "Review your eight claims and citations, choose Confirm submission, then explicitly Submit report. An incomplete report is allowed.",
      "Each new confirmed submission is a separate saved attempt. Its answers, citations and score stay frozen when you edit the draft or discover more evidence.",
      "You can continue investigating and submit again. Reveal solution is a separate spoiler action; replay clears working progress but keeps historical submissions.",
    ],
  },
];

export const GUIDE_START: Record<View, number> = {
  archive: 0,
  evidence: 1,
  interview: 2,
  report: 4,
};

const SCREEN_HINTS: Record<View, { title: string; text: string }> = {
  archive: {
    title: "Your first investigation",
    text: "Read the briefing, then start with the records in Evidence & timeline. The guide below explains the whole investigation, step by step.",
  },
  interview: {
    title: "Choose a person, then a topic",
    text: "Ask about an account or explicitly present discovered records. You can keep requesting evidence even when someone has little to say.",
  },
  evidence: {
    title: "Open a source and follow a lead",
    text: "Read a collected record and its limitations, then check available requests. Compare, Timeline and Your notes help you connect what you discover.",
  },
  report: {
    title: "Choose a conclusion and support each role",
    text: "Select one record for each evidence role; a claim may need multiple records. You can leave fields unanswered and return to the investigation.",
  },
};

const HELP = {
  records: {
    title: "How record requests work",
    text: "Choose a collected record to open it. Its contents may enable a request under Follow a lead. Search and source-type filters cover your collected records only. No new requests? Open any unread records, compare sources or return to questioning.",
  },
  questions: {
    title: "How to question and present evidence",
    text: "Selecting a topic does not send a question: use Ask this topic. To present evidence, choose a topic and collected records, then Present to the person. Only the records explicitly presented together support that challenge; collecting them or writing a note is not enough. Replies remain testimony.",
  },
  comparison: {
    title: "How to compare sources",
    text: "Read the two sources side by side and identify the specific claim you are testing. Save an interpretation links your reasoning to those sources as a private note. The game does not declare your comparison correct or submit it as evidence.",
  },
  timeline: {
    title: "How this timeline works",
    text: "The timeline shows observations supported by discovered sources. Read each source label and distinguish machine records from staff statements. It does not automatically prove responsibility, and you do not need to drag events into an order.",
  },
  notes: {
    title: "How private notes work",
    text: "Use New comparison note, choose distinct collected source and target records, and write your interpretation. A relation such as Contradicts describes your view of a claim, not an official verdict. Saved notes can be edited or deleted; they are unscored and excluded from submissions.",
  },
  citations: {
    title: "How to cite evidence",
    text: "Choose a conclusion, then read each evidence-role label and select the collected record that supports that part of the claim. Each role takes one record; several roles can require several sources. The game never selects relevant sources for you. Leave a role blank if you cannot support it yet.",
  },
  review: {
    title: "How to review and submit",
    text: "Review all eight claims and their role citations. Use Edit to revisit a section or keep investigating. Blank answers and missing sources are allowed. Confirm submission opens a separate confirmation; saving a draft, reading this help or opening review does not create an attempt.",
  },
  results: {
    title: "What happens after submission",
    text: "A saved report is read-only. Continue investigation or Edit current draft to prepare another separately confirmed attempt. New evidence never regrades an older report. Detailed feedback and the solution require an explicit spoiler reveal. Historical sources do not become evidence in a fresh run.",
  },
};

export function HelpTip({ topic }: { topic: keyof typeof HELP }) {
  const help = HELP[topic];
  return (
    <details className="help-tip">
      <summary>
        <Icon name="book" size={16} />
        {help.title}
      </summary>
      <p>{help.text}</p>
    </details>
  );
}

export function GuideHint({
  view,
  onOpen,
}: {
  view: View;
  onOpen: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const hint = SCREEN_HINTS[view];
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setVisible(
          localStorage.getItem(`witness-guide-dismissed:${view}`) !== "1",
        );
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [view]);
  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(`witness-guide-dismissed:${view}`, "1");
    } catch {
      // Dismissal still works when browser storage is unavailable.
    }
  }
  return (
    <aside
      className={`guide-hint ${visible ? "" : "guide-hint-compact"}`}
      aria-label="Investigation help"
    >
      {visible && (
        <div>
          <strong>{hint.title}</strong>
          <p>{hint.text}</p>
        </div>
      )}
      <div className="guide-hint-actions">
        <button
          className="button secondary small"
          aria-haspopup="dialog"
          onClick={onOpen}
        >
          <Icon name="book" size={16} /> How to investigate
        </button>
        {visible && (
          <button
            className="text-button"
            aria-label="Dismiss this screen's hint"
            onClick={dismiss}
          >
            Got it
          </button>
        )}
      </div>
    </aside>
  );
}

export function InvestigationGuide({
  step,
  onStep,
  onClose,
  onNavigate,
  started,
}: {
  step: number;
  onStep: (step: number) => void;
  onClose: () => void;
  onNavigate: (view: View) => void;
  started: boolean;
}) {
  const current = STEPS[step];
  return (
    <div className="investigation-guide">
      <p className="subtle">
        A spoiler-free walkthrough. Follow this suggested route or investigate
        in your own order.
      </p>
      <nav className="guide-chapters" aria-label="Guide chapters">
        {STEPS.map((item, index) => (
          <button
            key={item.title}
            className="guide-chapter"
            aria-current={step === index ? "step" : undefined}
            onClick={() => onStep(index)}
          >
            <span>{index + 1}</span>
            {item.title}
          </button>
        ))}
      </nav>
      <section className="guide-page" aria-live="polite" aria-atomic="true">
        <p className="eyebrow">
          STEP {step + 1} OF {STEPS.length}
        </p>
        <h3>{current.title}</h3>
        <p>{current.intro}</p>
        <ol>
          {current.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ol>
      </section>
      {started && current.view !== "archive" && (
        <button
          className="text-button guide-open-screen"
          onClick={() => onNavigate(current.view)}
        >
          Open{" "}
          {current.view === "interview"
            ? "Interrogation"
            : current.view === "evidence"
              ? "Evidence & timeline"
              : "Final deduction"}
          <Icon name="arrow" size={16} />
        </button>
      )}
      <div className="dialog-actions">
        <button
          className="button secondary"
          data-initial-focus={true}
          onClick={onClose}
        >
          Back to the game
        </button>
        {step > 0 && (
          <button className="button secondary" onClick={() => onStep(step - 1)}>
            Previous step
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button className="button primary" onClick={() => onStep(step + 1)}>
            Next step
          </button>
        )}
      </div>
    </div>
  );
}
