"use client";

import { useEffect, useRef, useState } from "react";
import { savedTime } from "@/lib/api";
import type { Note, NoteInput, Run } from "@/lib/types";
import { Icon } from "./Icon";
import { HelpTip } from "./InvestigationGuide";
import { RecordReader } from "./RecordReader";

export function Evidence({
  run,
  selected,
  blocked,
  selectRecord,
  inspectRecord,
  retrieve,
  preview,
  present,
  cite,
  saveNote,
  deleteNote,
  onReport,
  openToken,
  recoveredNote,
}: {
  run: Run;
  selected: string;
  blocked: boolean;
  selectRecord: (id: string) => void;
  inspectRecord: (id: string) => void;
  retrieve: (id: string) => Promise<void>;
  preview: (id: string) => void;
  present: (id: string) => void;
  cite: (id: string) => void;
  saveNote: (note: NoteInput, id?: string) => Promise<boolean>;
  deleteNote: (note: Note) => void;
  onReport: () => void;
  openToken: number;
  recoveredNote: { id: string; input: NoteInput; token: number } | null;
}) {
  const [tab, setTab] = useState("documents");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [comparison, setComparison] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ note: NoteInput; id?: string } | null>(
    null,
  );
  const recoveredToken = useRef(0);

  useEffect(() => {
    if (!recoveredNote || recoveredToken.current === recoveredNote.token)
      return;
    recoveredToken.current = recoveredNote.token;
    const timer = window.setTimeout(
      () =>
        setEditor((current) => {
          if (!current) return current;
          return JSON.stringify(current.note) ===
            JSON.stringify(recoveredNote.input)
            ? null
            : { ...current, id: recoveredNote.id };
        }),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [recoveredNote]);
  const record =
    run.records.find((item) => item.id === selected) || run.records[0];
  const second = run.records.find((item) => item.id === comparison);
  const kinds = [...new Set(run.records.map((item) => item.kind))];
  const matching = run.records.filter(
    (item) =>
      (kind === "all" || item.kind === kind) &&
      `${item.id} ${item.title} ${item.body.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const available = run.leads.filter((lead) => !lead.retrieved);

  useEffect(() => {
    if (!openToken) return;
    const timer = window.setTimeout(() => {
      setTab("documents");
      setComparison(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [openToken]);

  useEffect(() => {
    if (!editor) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editor]);

  function createNote() {
    if (editor) {
      setTab("notes");
      return;
    }
    const target =
      comparison || run.records.find((item) => item.id !== record.id)?.id;
    if (!target) return;
    setEditor({
      note: {
        source_ids: [record.id],
        target_id: target,
        relation: "Unsure",
        interpretation: "",
        passages: {},
      },
    });
    setTab("notes");
  }

  function editNote(note: Note) {
    if (editor) return;
    const input: NoteInput = {
      source_ids: [...note.source_ids],
      target_id: note.target_id,
      relation: note.relation,
      interpretation: note.interpretation,
      passages: { ...note.passages },
    };
    setEditor({ id: note.id, note: input });
    setTab("notes");
  }

  function changeNote(next: Partial<NoteInput>) {
    if (editor) setEditor({ ...editor, note: { ...editor.note, ...next } });
  }

  function read(id: string) {
    setTab("documents");
    setComparison(null);
    selectRecord(id);
  }

  return (
    <section className="evidence-workspace">
      <div className="workspace-tabs" aria-label="Dossier views">
        {[
          ["documents", "Records", "evidence"],
          ["timeline", "Timeline", "timeline"],
          ["notes", "Your notes", "book"],
        ].map(([value, label, icon]) => (
          <button
            key={value}
            className={tab === value ? "active" : ""}
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
          >
            <Icon name={icon} size={17} />
            {label}
            {value === "notes" && run.notes.length > 0 && (
              <span className="count">{run.notes.length}</span>
            )}
          </button>
        ))}
        <span className="workspace-caption">
          {run.records.length} records collected
        </span>
      </div>
      <HelpTip
        key={tab + String(comparison)}
        topic={
          tab === "timeline"
            ? "timeline"
            : tab === "notes"
              ? "notes"
              : comparison
                ? "comparison"
                : "records"
        }
      />
      {tab === "documents" && comparison && second ? (
        <div className="comparison-workspace">
          <div className="comparison-heading">
            <div>
              <span className="eyebrow">SOURCE COMPARISON</span>
              <h2>Read the accounts together.</h2>
            </div>
            <button
              className="button secondary small"
              onClick={() => setComparison(null)}
            >
              <Icon name="back" size={16} />
              Back to records
            </button>
          </div>
          <div className="comparison-controls">
            <label>
              Source record
              <select
                aria-label="Source record"
                value={record.id}
                onChange={(event) => selectRecord(event.target.value)}
              >
                {run.records
                  .filter((item) => item.id !== comparison)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} · {item.title}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Compare with
              <select
                aria-label="Compare with"
                value={comparison}
                onChange={(event) => {
                  setComparison(event.target.value);
                  inspectRecord(event.target.value);
                }}
              >
                {run.records
                  .filter((item) => item.id !== record.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} · {item.title}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div className="comparison-readers">
            <RecordReader record={record} compact />
            <RecordReader record={second} compact />
          </div>
          <div className="comparison-footer">
            <p>
              What do these sources establish together?
              <br />
              <span>Your interpretation remains a private note.</span>
            </p>
            <button className="button primary" onClick={createNote}>
              <Icon name="plus" size={16} />
              Save an interpretation
            </button>
          </div>
        </div>
      ) : tab === "documents" ? (
        <div className="evidence-layout">
          <aside className="record-catalogue">
            <p className="eyebrow">COLLECTED RECORDS</p>
            <label className="search-input">
              <Icon name="search" size={16} />
              <input
                aria-label="Search collected records"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your records"
              />
            </label>
            <label className="filter-label">
              Source type
              <select
                aria-label="Source type"
                value={kind}
                onChange={(event) => setKind(event.target.value)}
              >
                <option value="all">All source types</option>
                {kinds.map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </label>
            <div className="catalogue-list">
              {matching.map((item) => (
                <button
                  className={`catalogue-record ${item.id === record.id ? "selected" : ""}`}
                  key={item.id}
                  onClick={() => read(item.id)}
                >
                  <span className="record-row-top">
                    <b>{item.id}</b>
                    <span
                      className={item.inspected ? "read-state" : "unread-state"}
                    >
                      {item.inspected ? "Opened" : "Not opened"}
                    </span>
                  </span>
                  <strong>{item.title}</strong>
                  <span className="record-type">{item.kind}</span>
                </button>
              ))}
              {!matching.length && (
                <p className="empty-copy">No collected records match.</p>
              )}
            </div>
          </aside>
          <div className="reader-column">
            <div className="reader-actions">
              <button
                className="text-button"
                onClick={() => {
                  const next = run.records.find(
                    (item) => item.id !== record.id,
                  );
                  if (next) {
                    setComparison(next.id);
                    inspectRecord(next.id);
                  }
                }}
              >
                <Icon name="compare" size={16} />
                Compare
              </button>
              <button
                className="text-button"
                onClick={() => present(record.id)}
              >
                <Icon name="interview" size={16} />
                Present
              </button>
              <button className="text-button" onClick={() => cite(record.id)}>
                <Icon name="report" size={16} />
                Use in report
              </button>
            </div>
            <RecordReader record={record} />
            <div className="source-requests">
              {run.leads
                .filter((lead) => lead.source_ids.includes(record.id))
                .map((lead) => (
                  <button
                    key={lead.id}
                    className="lead-button"
                    disabled={blocked}
                    onClick={() => void retrieve(lead.id)}
                  >
                    <Icon name="evidence" />
                    <span>
                      {lead.retrieved ? "Open retrieved record" : lead.label}
                    </span>
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
            </div>
          </div>
          <aside className="leads-rail">
            <p className="eyebrow">FOLLOW A LEAD</p>
            <h3>What can you request?</h3>
            <div className="lead-list">
              {available.map((lead) => (
                <button
                  key={lead.id}
                  disabled={blocked}
                  onClick={() => void retrieve(lead.id)}
                >
                  <Icon name="evidence" size={17} />
                  <span>{lead.label}</span>
                  <Icon name="arrow" size={15} />
                </button>
              ))}
            </div>
            {!available.length && (
              <p className="empty-copy">
                {run.records.some((item) => !item.inspected)
                  ? "Open your unread records to look for related requests."
                  : "No new record requests. Compare your evidence, question staff, or review your report."}
              </p>
            )}
            <div className="rail-divider" />
            <p className="eyebrow">A WORKING THEORY</p>
            <p className="subtle">
              Records belong in your dossier. Interpretations belong in your
              notes.
            </p>
            <button className="text-button" onClick={createNote}>
              <Icon name="plus" size={16} />
              Create a comparison note
            </button>
          </aside>
        </div>
      ) : null}
      {tab === "timeline" && (
        <div className="timeline-workspace">
          <div className="timeline-intro">
            <span className="eyebrow">12 OCTOBER 2026 · MUSEUM LOCAL TIME</span>
            <h2>Put the night in order.</h2>
            <p>
              Observations from your collected sources. Overlapping times remain
              overlapping; gaps remain unknown.
            </p>
          </div>
          <ol className="timeline-list">
            {run.timeline.map((event, index) => (
              <li key={`${event.id}-${event.source_id}-${index}`}>
                <time>{event.time}</time>
                <span className="timeline-node" />
                <div className="timeline-event">
                  <span className="source-kind">{event.kind}</span>
                  <p>{event.text}</p>
                  <button
                    className="chip"
                    onClick={() => preview(event.source_id)}
                  >
                    <Icon name="evidence" size={13} />
                    {event.source_id}
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <aside className="hypothesis-panel">
            <span className="eyebrow">
              YOUR HYPOTHESES · SEPARATE FROM OBSERVATIONS
            </span>
            <h3>Your reconstruction is still yours.</h3>
            <p>
              Use the report to nominate conclusions and their source roles.
              Your notes and report choices never become verified timeline
              events.
            </p>
            <button className="button secondary" onClick={onReport}>
              Open report draft <Icon name="arrow" size={17} />
            </button>
          </aside>
        </div>
      )}
      {tab === "notes" && (
        <div className="notes-workspace">
          <div className="notes-heading">
            <div>
              <span className="eyebrow">
                PRIVATE REASONING · NOT SCORED OR SUBMITTED
              </span>
              <h2>The space between the facts.</h2>
            </div>
            <button className="button secondary" onClick={createNote}>
              <Icon name="plus" size={16} />
              New comparison note
            </button>
          </div>
          {editor && (
            <form
              className="note-editor"
              onSubmit={(event) => {
                event.preventDefault();
                void saveNote(editor.note, editor.id).then((ok) => {
                  if (ok) setEditor(null);
                });
              }}
            >
              <h3>
                {editor.id ? "Edit your note" : "Write an investigation note"}
              </h3>
              <p className="subtle">
                Choose the source(s), identify the target claim, and record your
                interpretation.
              </p>
              <div className="note-direction">
                <fieldset>
                  <legend>Source records</legend>
                  {run.records
                    .filter((item) => item.id !== editor.note.target_id)
                    .map((item) => (
                      <label className="check-row" key={item.id}>
                        <input
                          type="checkbox"
                          checked={editor.note.source_ids.includes(item.id)}
                          onChange={(event) =>
                            changeNote({
                              source_ids: event.target.checked
                                ? [...editor.note.source_ids, item.id]
                                : editor.note.source_ids.filter(
                                    (id) => id !== item.id,
                                  ),
                            })
                          }
                        />
                        <span>
                          <b>{item.id}</b> {item.title}
                        </span>
                      </label>
                    ))}
                </fieldset>
                <div>
                  <label>
                    Target record / account
                    <select
                      aria-label="Target record / account"
                      value={editor.note.target_id}
                      onChange={(event) =>
                        changeNote({
                          target_id: event.target.value,
                          source_ids: editor.note.source_ids.filter(
                            (id) => id !== event.target.value,
                          ),
                        })
                      }
                    >
                      {run.records.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id} · {item.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Your relation
                    <select
                      aria-label="Your relation"
                      value={editor.note.relation}
                      onChange={(event) =>
                        changeNote({
                          relation: event.target.value as NoteInput["relation"],
                        })
                      }
                    >
                      {[
                        "Unsure",
                        "Corroborates",
                        "Contradicts",
                        "Contextualizes",
                      ].map((relation) => (
                        <option key={relation}>{relation}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Specific claim or passage (optional)
                    <input
                      maxLength={300}
                      value={editor.note.passages[editor.note.target_id] || ""}
                      onChange={(event) =>
                        changeNote({
                          passages: {
                            [editor.note.target_id]: event.target.value,
                          },
                        })
                      }
                      placeholder="e.g. the claim you are comparing"
                    />
                  </label>
                </div>
              </div>
              <label>
                Your interpretation
                <textarea
                  aria-label="Your interpretation"
                  value={editor.note.interpretation}
                  maxLength={2000}
                  rows={4}
                  onChange={(event) =>
                    changeNote({ interpretation: event.target.value })
                  }
                  placeholder="Explain how the sources fit, or where they disagree."
                />
              </label>
              <div className="note-footer">
                <span className="subtle">
                  Unsaved editor · notes never affect scoring
                </span>
                <div>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setEditor(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button primary"
                    disabled={
                      blocked ||
                      !editor.note.source_ids.length ||
                      !editor.note.interpretation.trim()
                    }
                  >
                    {editor.id ? "Save changes" : "Save note"}
                  </button>
                </div>
              </div>
            </form>
          )}
          {!run.notes.length && !editor && (
            <div className="empty-panel">
              <Icon name="book" size={32} />
              <h3>No notes yet.</h3>
              <p>
                Compare two collected records to save your interpretation.
                Nothing here is submitted with your report.
              </p>
            </div>
          )}
          <div className="notes-grid">
            {run.notes.map((note) => (
              <article className="note-card" key={note.id}>
                <div className="note-card-top">
                  <span className="eyebrow">YOUR NOTE</span>
                  <span>{savedTime(note.saved_at)}</span>
                </div>
                <div className="note-relationship">
                  <div className="chips">
                    {note.source_ids.map((id) => (
                      <button
                        key={id}
                        className="chip"
                        onClick={() => preview(id)}
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                  <span className="relation-label">
                    {note.relation.toLowerCase()}
                  </span>
                  <button
                    className="chip"
                    onClick={() => preview(note.target_id)}
                  >
                    {note.target_id}
                    {note.passages[note.target_id]
                      ? ` · ${note.passages[note.target_id]}`
                      : ""}
                  </button>
                </div>
                <p>{note.interpretation}</p>
                <div className="note-card-actions">
                  <button
                    className="text-button"
                    onClick={() => editNote(note)}
                  >
                    Edit note
                  </button>
                  <button
                    className="text-button muted"
                    onClick={() => deleteNote(note)}
                    disabled={blocked}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
