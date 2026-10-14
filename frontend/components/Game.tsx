"use client";

import { useEffect, useRef, useState } from "react";
import { useInvestigation } from "@/lib/useInvestigation";
import type {
  CharacterId,
  Draft,
  EvidenceRecord,
  Note,
  NoteInput,
  View,
} from "@/lib/types";
import { Archive } from "./Archive";
import { Dialog } from "./Dialog";
import { Evidence } from "./Evidence";
import { Icon } from "./Icon";
import {
  GUIDE_START,
  GuideHint,
  InvestigationGuide,
} from "./InvestigationGuide";
import { Interview } from "./Interview";
import { RecordReader } from "./RecordReader";
import { Report } from "./Report";

type Modal =
  | { type: "briefing" | "reset" | "reveal" }
  | { type: "submit"; draft: Draft; runId: string }
  | { type: "delete-note"; note: Note }
  | { type: "preview"; record: EvidenceRecord; historical: boolean }
  | { type: "present" | "cite"; record: string }
  | { type: "history"; attempt: number }
  | { type: "guide"; step: number };
const VIEWS: { id: View; label: string; icon: string }[] = [
  { id: "archive", label: "Case archive", icon: "archive" },
  { id: "interview", label: "Interrogation", icon: "interview" },
  { id: "evidence", label: "Evidence & timeline", icon: "evidence" },
  { id: "report", label: "Final deduction", icon: "report" },
];
const TITLES = {
  interview: "Every account has a gap.",
  evidence: "Follow the records.",
  report: "Make your case.",
};

export function Game() {
  const game = useInvestigation();
  const [view, setView] = useState<View>("archive");
  const [selectedRecord, setSelectedRecord] = useState("E01");
  const [openToken, setOpenToken] = useState(0);
  const [reportTab, setReportTab] = useState("draft");
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  const [presentPerson, setPresentPerson] = useState<CharacterId>("alex");
  const [presentationSeed, setPresentationSeed] = useState<{
    character: CharacterId;
    record: string;
    token: number;
  } | null>(null);
  const [citeField, setCiteField] = useState("");
  const [citeRole, setCiteRole] = useState("");
  const [revealToken, setRevealToken] = useState(0);
  const [recoveredNote, setRecoveredNote] = useState<{
    id: string;
    input: NoteInput;
    token: number;
  } | null>(null);
  const [recoveredExchange, setRecoveredExchange] = useState<{
    character: CharacterId;
    question: string;
    token: number;
  } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const lastRun = useRef<string | null>(null);
  const submitting = useRef(false);
  const blocked = !game.connected || !!game.uncertain || !!game.busy;
  const pending = game.dialogueBusy || !!game.run?.pending;

  function navigate(next: View) {
    setView(next);
    window.history.pushState(null, "", `#${next}`);
    localStorage.setItem("witness-view", next);
  }

  useEffect(() => {
    const restore = () => {
      const next = window.location.hash.slice(1);
      if (VIEWS.some((item) => item.id === next)) setView(next as View);
    };
    const timer = window.setTimeout(restore, 0);
    window.addEventListener("popstate", restore);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("popstate", restore);
    };
  }, []);

  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0 });
  }, [view]);

  useEffect(() => {
    const id = game.run?.id;
    if (id && lastRun.current && id !== lastRun.current) {
      const timer = window.setTimeout(() => {
        setSelectedRecord("E01");
        setPresentationSeed(null);
        setSelectedAttempt(null);
        setReportTab("draft");
        setOpenToken(0);
        setRevealToken(0);
        setModal(null);
        setRecoveredNote(null);
        setRecoveredExchange(null);
      }, 0);
      lastRun.current = id;
      return () => window.clearTimeout(timer);
    }
    if (id) lastRun.current = id;
  }, [game.run?.id]);

  async function inspectOnly(id: string) {
    if (
      !blocked &&
      game.run?.records.some((record) => record.id === id && !record.inspected)
    )
      await game.execute("inspect", { record_id: id });
  }

  function selectRecord(id: string) {
    setSelectedRecord(id);
    void inspectOnly(id);
    window.requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".reader-column h2")?.focus(),
    );
  }
  function openRecord(id: string) {
    selectRecord(id);
    setOpenToken((token) => token + 1);
    navigate("evidence");
  }
  function preview(record: EvidenceRecord, historical = false) {
    if (!historical) void inspectOnly(record.id);
    setModal({ type: "preview", record, historical });
  }
  function selectAttempt(id: number) {
    const item = game.data?.attempts.find((attempt) => attempt.id === id);
    if (item && !item.is_current) setModal({ type: "history", attempt: id });
    else {
      setSelectedAttempt(id);
      setReportTab("history");
      navigate("report");
    }
  }

  async function requestSubmission() {
    if (!game.draft || blocked || pending || game.conflict) return;
    if (game.dirty && !(await game.saveDraft())) return;
    if (game.currentRun())
      setModal({
        type: "submit",
        draft: structuredClone(game.draft),
        runId: game.currentRun()!.id,
      });
  }

  async function confirmSubmission(snapshot: Draft, runId: string) {
    if (game.currentRun()?.id !== runId) {
      setModal(null);
      return;
    }
    if (submitting.current) return;
    submitting.current = true;
    try {
      const result = await game.execute(
        "submit",
        { draft: snapshot },
        "POST",
        snapshot,
      );
      if (result?.attempt_id) {
        setSelectedAttempt(result.attempt_id);
        setReportTab("history");
        setModal(null);
        navigate("report");
      }
    } finally {
      submitting.current = false;
    }
  }

  async function confirmReset() {
    const result = await game.execute("reset");
    if (result?.run) {
      setModal(null);
      navigate("interview");
    }
  }

  async function confirmReveal() {
    const result = await game.execute("reveal");
    if (result) {
      setModal(null);
      setRevealToken((token) => token + 1);
    }
  }

  function attachSource(record: string) {
    if (!game.draft || !citeField || !citeRole) return;
    const next = structuredClone(game.draft);
    next.fields[citeField].citations[citeRole] = record;
    next.section = game.run!.report_fields.find(
      (field) => field.id === citeField,
    )!.section;
    game.updateDraft(next);
    setReportTab("draft");
    setModal(null);
    navigate("report");
  }

  async function reconnect() {
    const recovery = await game.reconnect();
    if (!recovery) return;
    const { result, original } = recovery;
    if (result.attempt_id) {
      setSelectedAttempt(result.attempt_id);
      setReportTab("history");
      setModal(null);
      navigate("report");
    } else if (result.reset || original.path === "/api/start") {
      setModal(null);
      navigate("interview");
    }
    if (result.note_id && original.body.note && !result.archived) {
      setRecoveredNote({
        id: result.note_id,
        input: original.body.note as NoteInput,
        token: Date.now(),
      });
    }
    if (
      modal?.type === "delete-note" &&
      result.run &&
      !result.run.notes.some((note) => note.id === modal.note.id)
    )
      setModal(null);
    if (result.dialogue_mode && !result.archived) {
      setRecoveredExchange({
        character: original.body.character_id as CharacterId,
        question: String(original.body.question || ""),
        token: Date.now(),
      });
    }
  }

  const run = game.run;
  const data = game.data;
  const draft = game.draft;
  const modalTitle =
    modal?.type === "guide"
      ? "First-time investigation guide"
      : modal?.type === "briefing"
        ? "The 11:17 Incident"
        : modal?.type === "submit"
          ? "Submit this report?"
          : modal?.type === "reset"
            ? "Start this case again?"
            : modal?.type === "reveal"
              ? "Reveal the case solution?"
              : modal?.type === "delete-note"
                ? "Delete this note?"
                : modal?.type === "preview"
                  ? modal.record.title
                  : modal?.type === "present"
                    ? "Present a collected record"
                    : modal?.type === "cite"
                      ? "Use this record in your report"
                      : "Open an earlier submission?";

  return (
    <div className="game-app">
      <a className="skip-link" href="#main-content">
        Skip to investigation
      </a>
      <aside className="app-rail">
        <button
          className="brand"
          onClick={() => navigate("archive")}
          aria-label="The Last Witness — case archive"
        >
          <span className="brand-mark">
            <Icon name="diamond" size={27} />
          </span>
          <span>
            The Last
            <br />
            <em>Witness</em>
          </span>
        </button>
        <div className="rail-section-label">THE INVESTIGATION</div>
        <nav aria-label="Main navigation">
          {VIEWS.map((item, index) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              disabled={item.id !== "archive" && !run}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              <small>{String(index + 1).padStart(2, "0")}</small>
            </button>
          ))}
        </nav>
        <div className="rail-case">
          <span className="eyebrow">CURRENT DOSSIER</span>
          <p>The 11:17 Incident</p>
          <span>Bellwether Museum</span>
        </div>
        <div className="rail-footer">
          <div className="case-seal">
            <span>LW</span>
          </div>
          <p>The records remember.</p>
          {run && (
            <button
              className="text-button"
              disabled={blocked}
              onClick={() => setModal({ type: "reset" })}
            >
              <Icon name="reset" size={15} />
              Replay this case
            </button>
          )}
          <span className="rail-date">12 OCTOBER 2026</span>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumb">
            <span>THE BELLWETHER DOSSIER</span>
            <i>/</i>
            <strong>{view === "archive" ? "Case archive" : "Case 001"}</strong>
          </div>
          <div className="topbar-status">
            <span
              className={`status-dot ${!game.connected ? "offline" : ""}`}
            />
            <span>
              {!game.connected
                ? "Previously loaded · disconnected"
                : game.loading
                  ? "Checking investigation…"
                  : !game.run
                    ? "Ready to investigate"
                    : game.saveState === "Saved"
                      ? "Report saved locally"
                      : game.saveState}
            </span>
            <span className="investigator-mark" aria-hidden="true">
              LW
            </span>
          </div>
        </header>
        {(game.error || !game.connected || game.uncertain) && (
          <div className="connection-banner" role="alert">
            <Icon name="warning" />
            <span>
              {game.uncertain
                ? "Checking whether your last action was saved. Reconnect before sending another."
                : game.error ||
                  "Cannot reach the service. You may read loaded records and edit locally; changes are not saved."}
            </span>
            <button
              className="text-button"
              onClick={() => void reconnect()}
              disabled={!!game.busy}
            >
              Reconnect / retry
            </button>
            {game.connected && !game.uncertain && (
              <button
                className="icon-button"
                aria-label="Dismiss error"
                onClick={game.clearError}
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </div>
        )}
        {game.notice && (
          <div className="service-notice" role="status">
            <span>{game.notice}</span>
            <button
              className="icon-button"
              aria-label="Dismiss notice"
              onClick={game.clearNotice}
            >
              <Icon name="close" size={15} />
            </button>
          </div>
        )}
        <main id="main-content">
          <GuideHint
            key={view}
            view={view}
            onOpen={() => setModal({ type: "guide", step: GUIDE_START[view] })}
          />
          <div hidden={view !== "archive"}>
            <Archive
              data={data}
              loading={game.loading}
              ready={game.connected && !!data}
              busy={!!game.busy}
              onStart={() => setModal({ type: "briefing" })}
              onResume={() => navigate("interview")}
              onHistory={() => {
                setReportTab("history");
                if (data?.attempts[0]) selectAttempt(data.attempts[0].id);
              }}
            />
          </div>
          {view !== "archive" && (
            <header className="page-heading">
              <div>
                <span className="eyebrow">
                  CASE 001 /{" "}
                  {view === "interview"
                    ? "THE ACCOUNTS"
                    : view === "evidence"
                      ? "THE DOSSIER"
                      : "YOUR RECONSTRUCTION"}
                </span>
                <h1 ref={heading} tabIndex={-1}>
                  {TITLES[view]}
                </h1>
                <p>
                  {view === "interview"
                    ? "Three voices. Find the questions that matter."
                    : view === "evidence"
                      ? "Read the sources. Connect the observations. Keep your interpretation distinct."
                      : "A conclusion is only as strong as the sources you choose."}
                </p>
              </div>
              {run && (
                <div className="case-context">
                  <span>{data?.case.setting}</span>
                  <strong>12 OCTOBER 2026</strong>
                </div>
              )}
            </header>
          )}
          {!run && view !== "archive" && (
            <div className="empty-panel">
              <h2>Open the case to begin.</h2>
              <button
                className="button primary"
                onClick={() => navigate("archive")}
              >
                Return to case archive
              </button>
            </div>
          )}
          {run && data && draft && (
            <>
              {!run.records.some((record) => record.inspected) &&
                view === "interview" && (
                  <aside className="welcome-strip">
                    <span>
                      <strong>Your starting dossier is ready.</strong> Open the
                      incident handover, or choose a person to question.
                    </span>
                    <button
                      className="text-button"
                      onClick={() => openRecord("E01")}
                    >
                      Open incident handover <Icon name="arrow" size={16} />
                    </button>
                  </aside>
                )}
              <div hidden={view !== "interview"}>
                <Interview
                  key={`interview-${run.id}`}
                  run={run}
                  characters={data.characters}
                  blocked={blocked}
                  pending={pending}
                  mode={game.dialogueMode}
                  seed={presentationSeed}
                  recoveredExchange={recoveredExchange}
                  useScripted={() => {
                    if (run.pending_command_id)
                      void game.execute(
                        `interactions/${run.pending_command_id}/scripted`,
                      );
                  }}
                  send={async (character, text, topic, evidence) =>
                    !!(await game.send(character, text, topic, evidence))
                  }
                  openRecord={openRecord}
                />
              </div>
              <div hidden={view !== "evidence"}>
                <Evidence
                  key={`evidence-${run.id}`}
                  run={run}
                  selected={selectedRecord}
                  blocked={blocked}
                  openToken={openToken}
                  recoveredNote={recoveredNote}
                  selectRecord={selectRecord}
                  inspectRecord={(id) => void inspectOnly(id)}
                  retrieve={async (id) => {
                    const result = await game.execute("retrieve", {
                      request_id: id,
                    });
                    if (result?.record_id) openRecord(result.record_id);
                  }}
                  preview={(id) => {
                    const record = run.records.find((item) => item.id === id);
                    if (record) preview(record);
                  }}
                  present={(id) => setModal({ type: "present", record: id })}
                  cite={(id) => {
                    setCiteField("");
                    setCiteRole("");
                    setModal({ type: "cite", record: id });
                  }}
                  saveNote={async (note, id) =>
                    !!(await game.execute(
                      id ? `notes/${id}` : "notes",
                      { note },
                      id ? "PUT" : "POST",
                    ))
                  }
                  deleteNote={(note) => setModal({ type: "delete-note", note })}
                  onReport={() => {
                    setReportTab("draft");
                    navigate("report");
                  }}
                />
              </div>
              <div hidden={view !== "report"}>
                <Report
                  key={`report-${run.id}`}
                  run={run}
                  draft={draft}
                  attempts={data.attempts}
                  saveState={game.saveState}
                  blocked={blocked}
                  pending={pending}
                  tab={reportTab}
                  setTab={setReportTab}
                  selectedAttempt={selectedAttempt}
                  setSelectedAttempt={selectAttempt}
                  updateDraft={game.updateDraft}
                  requestSubmit={() => void requestSubmission()}
                  requestReveal={() => setModal({ type: "reveal" })}
                  preview={preview}
                  continueInvestigation={() => navigate("interview")}
                  revealToken={revealToken}
                  save={() => void game.saveDraft()}
                  conflict={game.conflict}
                  reloadDraft={game.reloadDraft}
                />
              </div>
            </>
          )}
        </main>
        <footer className="app-footer">
          <span>THE LAST WITNESS</span>
          <span>One night. Three accounts. Follow the evidence.</span>
          <span>CASE 001</span>
        </footer>
      </div>
      {modal && (
        <Dialog
          title={modalTitle}
          focusClose={modal.type === "guide"}
          onClose={() => setModal(null)}
          locked={!!game.busy}
        >
          {game.error && (
            <p className="inline-error" role="alert">
              {game.error}
            </p>
          )}
          {game.uncertain && (
            <div className="context-label" role="status">
              <p>
                Your last action may already be saved. Check its outcome before
                confirming again.
              </p>
              <button
                className="button secondary"
                disabled={!!game.busy}
                onClick={() => void reconnect()}
              >
                Check saved action
              </button>
            </div>
          )}
          {modal.type === "guide" && (
            <InvestigationGuide
              step={modal.step}
              onStep={(step) => setModal({ type: "guide", step })}
              onClose={() => setModal(null)}
              started={!!run}
              onNavigate={(next) => {
                setModal(null);
                navigate(next);
              }}
            />
          )}
          {modal.type === "briefing" && (
            <>
              <span className="eyebrow">INCIDENT BRIEF · NORTH GALLERY</span>
              {(data?.case.brief || []).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              <div className="brief-rules">
                <span>
                  <Icon name="clock" size={16} /> No timer
                </span>
                <span>
                  <Icon name="interview" size={16} /> Unlimited questions
                </span>
                <span>
                  <Icon name="report" size={16} /> Submit, then keep
                  investigating
                </span>
              </div>
              <div className="dialog-actions">
                <button
                  className="button secondary"
                  data-initial-focus={true}
                  onClick={() => setModal(null)}
                >
                  Return to archive
                </button>
                <button
                  className="button primary"
                  disabled={blocked}
                  onClick={() => {
                    void game.start().then((ok) => {
                      if (ok) {
                        setModal(null);
                        navigate("interview");
                      }
                    });
                  }}
                >
                  Begin investigation <Icon name="arrow" size={16} />
                </button>
              </div>
            </>
          )}
          {modal.type === "submit" && (
            <>
              <p>
                This saves a new submission with the answers and evidence you
                just reviewed. You can keep investigating and submit again.
                Saved submissions cannot be edited.
              </p>
              <p className="subtle">
                This action does not reveal the solution. Your private notes are
                excluded.
              </p>
              <div className="dialog-actions">
                <button
                  className="button secondary"
                  data-initial-focus={true}
                  disabled={!!game.busy}
                  onClick={() => setModal(null)}
                >
                  Return to review
                </button>
                <button
                  className="button primary"
                  disabled={blocked || pending}
                  onClick={() =>
                    void confirmSubmission(modal.draft, modal.runId)
                  }
                >
                  {game.busy ? "Saving submission…" : "Submit report"}
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            </>
          )}
          {modal.type === "reset" && (
            <>
              <p>
                Current evidence progress, conversations, private notes and the
                report draft will be cleared.
              </p>
              <p>
                <strong>Saved submissions will be kept.</strong> The culprit and
                solution stay the same.
              </p>
              <div className="dialog-actions">
                <button
                  className="button secondary"
                  data-initial-focus={true}
                  disabled={!!game.busy}
                  onClick={() => setModal(null)}
                >
                  Keep investigation
                </button>
                <button
                  className="button primary"
                  disabled={blocked}
                  onClick={() => void confirmReset()}
                >
                  Reset investigation
                </button>
              </div>
            </>
          )}
          {modal.type === "reveal" && (
            <>
              <p>
                This reveals the complete reconstruction, detailed scoring
                reasons and sources you may not have collected. It contains the
                answer to the mystery.
              </p>
              <p>
                You can still investigate and submit again. Review-only sources
                do not collect evidence or change an earlier score.
              </p>
              <div className="dialog-actions">
                <button
                  className="button secondary"
                  data-initial-focus={true}
                  disabled={!!game.busy}
                  onClick={() => setModal(null)}
                >
                  Keep investigating
                </button>
                <button
                  className="button primary"
                  disabled={blocked || pending}
                  onClick={() => void confirmReveal()}
                >
                  Reveal solution
                </button>
              </div>
            </>
          )}
          {modal.type === "delete-note" && (
            <>
              <p>
                Only this saved comparison note will be deleted. Evidence, your
                report draft and historical submissions will remain available.
              </p>
              <div className="dialog-actions">
                <button
                  className="button secondary"
                  data-initial-focus={true}
                  onClick={() => setModal(null)}
                >
                  Keep note
                </button>
                <button
                  className="button primary"
                  disabled={blocked}
                  onClick={() => {
                    void game
                      .execute(`notes/${modal.note.id}`, {}, "DELETE")
                      .then((result) => {
                        if (result) setModal(null);
                      });
                  }}
                >
                  Delete note
                </button>
              </div>
            </>
          )}
          {modal.type === "preview" && (
            <RecordReader
              record={modal.record}
              historical={modal.historical}
              compact
            />
          )}
          {modal.type === "present" && (
            <>
              <p>
                Select the person to question about{" "}
                <strong>{modal.record}</strong>. In the interview, choose a
                topic and explicitly present the record.
              </p>
              <div className="present-people">
                {data?.characters.map((character) => (
                  <label key={character.id}>
                    <input
                      type="radio"
                      name="present-person"
                      checked={presentPerson === character.id}
                      onChange={() => setPresentPerson(character.id)}
                    />
                    <span>
                      {character.name}
                      <small>{character.role}</small>
                    </span>
                  </label>
                ))}
              </div>
              <div className="dialog-actions">
                <button
                  className="button secondary"
                  data-initial-focus={true}
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="button primary"
                  onClick={() => {
                    setPresentationSeed({
                      character: presentPerson,
                      record: modal.record,
                      token: Date.now(),
                    });
                    setModal(null);
                    navigate("interview");
                  }}
                >
                  Open interview <Icon name="arrow" size={16} />
                </button>
              </div>
            </>
          )}
          {modal.type === "cite" && (
            <>
              <p>
                Deliberately nominate <strong>{modal.record}</strong> for one
                evidence role. Comparing or presenting a record never cites it
                automatically.
              </p>
              <label>
                Report claim
                <select
                  aria-label="Report claim"
                  value={citeField}
                  onChange={(event) => {
                    setCiteField(event.target.value);
                    setCiteRole("");
                  }}
                >
                  <option value="">Choose a claim</option>
                  {run?.report_fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Evidence role
                <select
                  aria-label="Evidence role"
                  value={citeRole}
                  onChange={(event) => setCiteRole(event.target.value)}
                >
                  <option value="">Choose a role</option>
                  {run?.report_fields
                    .find((field) => field.id === citeField)
                    ?.roles.map((role) => (
                      <option key={role.key} value={role.key}>
                        {role.label}
                      </option>
                    ))}
                </select>
              </label>
              {citeField &&
                citeRole &&
                draft?.fields[citeField].citations[citeRole] && (
                  <p className="context-label">
                    This replaces {draft.fields[citeField].citations[citeRole]}{" "}
                    with {modal.record} in this role only.
                  </p>
                )}
              <div className="dialog-actions">
                <button
                  className="button secondary"
                  data-initial-focus={true}
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="button primary"
                  disabled={!citeField || !citeRole}
                  onClick={() => attachSource(modal.record)}
                >
                  Use this source
                </button>
              </div>
            </>
          )}
          {modal.type === "history" && (
            <>
              <p>
                This report belongs to an earlier investigation and may reveal
                previous conclusions or sources. Reading it does not collect
                evidence in your current run.
              </p>
              <div className="dialog-actions">
                <button
                  className="button secondary"
                  data-initial-focus={true}
                  onClick={() => setModal(null)}
                >
                  Stay here
                </button>
                <button
                  className="button primary"
                  onClick={() => {
                    setSelectedAttempt(modal.attempt);
                    setReportTab("history");
                    setModal(null);
                    navigate("report");
                  }}
                >
                  Open historical report
                </button>
              </div>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
