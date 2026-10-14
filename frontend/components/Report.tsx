"use client";

import { useEffect, useRef, useState } from "react";
import { api, savedTime } from "@/lib/api";
import type {
  Attempt,
  AttemptSummary,
  Draft,
  EvidenceRecord,
  ReportField,
  Run,
  Solution,
} from "@/lib/types";
import { Icon } from "./Icon";
import { HelpTip } from "./InvestigationGuide";

const SECTIONS = [
  "Event sequence",
  "Responsibility & destination",
  "Accounts & intent",
  "Review report",
];

export function ReportReview({
  draft,
  fields,
  records,
  edit,
  preview,
  frozen = false,
}: {
  draft: Draft;
  fields: ReportField[];
  records: Record<string, EvidenceRecord>;
  edit?: (section: number) => void;
  preview: (record: EvidenceRecord, historical?: boolean) => void;
  frozen?: boolean;
}) {
  return (
    <div className="report-review">
      {fields.map((field) => {
        const answer = draft.fields[field.id];
        return (
          <article className="review-claim" key={field.id}>
            <div className="review-claim-title">
              <h3>{field.label}</h3>
              {edit && (
                <button
                  className="text-button"
                  onClick={() => edit(field.section)}
                >
                  Edit
                </button>
              )}
            </div>
            <p
              className={
                answer.choice === "unknown" ? "unestablished" : "chosen-answer"
              }
            >
              {field.options.find((option) => option.value === answer.choice)
                ?.label || answer.choice}
            </p>
            <dl className="review-citations">
              {field.roles.map((role) => {
                const id = answer.citations[role.key];
                return (
                  <div key={role.key}>
                    <dt>{role.label}</dt>
                    <dd>
                      {id && records[id] ? (
                        <button
                          className="text-button source-reference"
                          onClick={() => preview(records[id], frozen)}
                        >
                          <b>{id}</b>
                          {records[id].title}
                          <Icon name="evidence" size={14} />
                        </button>
                      ) : (
                        <span className="subtle">No source selected</span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </article>
        );
      })}
      {draft.explanation && (
        <article className="review-claim">
          <span className="eyebrow">YOUR REPORT EXPLANATION · NOT SCORED</span>
          <p className="preserve-lines">{draft.explanation}</p>
        </article>
      )}
    </div>
  );
}

export function Report({
  run,
  draft,
  attempts,
  saveState,
  blocked,
  pending,
  tab,
  setTab,
  selectedAttempt,
  setSelectedAttempt,
  updateDraft,
  requestSubmit,
  requestReveal,
  preview,
  continueInvestigation,
  revealToken,
  save,
  conflict,
  reloadDraft,
}: {
  run: Run;
  draft: Draft;
  attempts: AttemptSummary[];
  saveState: string;
  blocked: boolean;
  pending: boolean;
  tab: string;
  setTab: (tab: string) => void;
  selectedAttempt: number | null;
  setSelectedAttempt: (id: number) => void;
  updateDraft: (draft: Draft) => void;
  requestSubmit: () => void;
  requestReveal: () => void;
  preview: (record: EvidenceRecord, historical?: boolean) => void;
  continueInvestigation: () => void;
  revealToken: number;
  save: () => void;
  conflict: boolean;
  reloadDraft: () => void;
}) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const loadedAttempt = useRef<number | null>(null);
  const records = Object.fromEntries(
    run.records.map((record) => [record.id, record]),
  );
  const conclusions = Object.values(draft.fields).filter(
    (field) => field.choice !== "unknown",
  ).length;
  const citations = Object.values(draft.fields).reduce(
    (total, field) =>
      total + Object.values(field.citations).filter(Boolean).length,
    0,
  );

  useEffect(() => {
    if (!selectedAttempt) return;
    let active = true;
    api<Attempt>(`/api/attempts/${selectedAttempt}`)
      .then((result) => {
        if (active) {
          setAttempt(result);
          if (loadedAttempt.current !== result.id) setSolution(null);
          loadedAttempt.current = result.id;
          setResultError(null);
        }
      })
      .catch((failure) => {
        if (active)
          setResultError(
            failure instanceof Error
              ? failure.message
              : "Could not load submission.",
          );
      });
    return () => {
      active = false;
    };
  }, [selectedAttempt, run.solution_revealed, run.id]);

  async function loadSolution() {
    if (!selectedAttempt) return;
    setSolutionLoading(true);
    try {
      setSolution(
        await api<Solution>(`/api/attempts/${selectedAttempt}/solution`),
      );
      setResultError(null);
    } catch (failure) {
      setResultError(
        failure instanceof Error
          ? failure.message
          : "Could not load solution review.",
      );
    } finally {
      setSolutionLoading(false);
    }
  }

  useEffect(() => {
    if (!revealToken || !selectedAttempt) return;
    let active = true;
    api<Solution>(`/api/attempts/${selectedAttempt}/solution`)
      .then((result) => {
        if (active) setSolution(result);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [revealToken, selectedAttempt]);

  function section(value: number) {
    updateDraft({ ...draft, section: value });
  }
  function choice(field: string, value: string) {
    updateDraft({
      ...draft,
      fields: {
        ...draft.fields,
        [field]: { ...draft.fields[field], choice: value },
      },
    });
  }
  function citation(field: string, role: string, value: string) {
    updateDraft({
      ...draft,
      fields: {
        ...draft.fields,
        [field]: {
          ...draft.fields[field],
          citations: {
            ...draft.fields[field].citations,
            [role]: value || null,
          },
        },
      },
    });
  }

  return (
    <section className="report-workspace">
      <div className="workspace-tabs">
        <button
          className={tab === "draft" ? "active" : ""}
          aria-pressed={tab === "draft"}
          onClick={() => setTab("draft")}
        >
          <Icon name="report" size={17} />
          Report draft
        </button>
        <button
          className={tab === "history" ? "active" : ""}
          aria-pressed={tab === "history"}
          onClick={() => setTab("history")}
        >
          <Icon name="archive" size={17} />
          Submissions
          {!!attempts.length && (
            <span className="count">{attempts.length}</span>
          )}
        </button>
        <span className="workspace-caption" aria-live="polite">
          {saveState}
        </span>
      </div>
      <HelpTip
        key={tab + draft.section}
        topic={
          tab === "history"
            ? "results"
            : draft.section === 3
              ? "review"
              : "citations"
        }
      />
      {tab === "draft" && (
        <div className="report-layout">
          <aside className="report-progress">
            <p className="eyebrow">YOUR RECONSTRUCTION</p>
            <ol>
              {SECTIONS.map((label, index) => (
                <li key={label}>
                  <button
                    className={draft.section === index ? "active" : ""}
                    onClick={() => section(index)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {label}
                  </button>
                </li>
              ))}
            </ol>
            <p className="report-progress-copy">
              Unanswered fields are allowed. The report is yours to submit
              whenever you are ready.
            </p>
            <button className="text-button" onClick={() => section(3)}>
              Review all fields <Icon name="arrow" size={15} />
            </button>
          </aside>
          <div className="report-form">
            <header className="report-section-heading">
              <span className="eyebrow">SECTION {draft.section + 1} / 4</span>
              <h2>{SECTIONS[draft.section]}</h2>
              <p>
                {draft.section === 3
                  ? "Review exactly what will be submitted. Private notes are excluded. Missing support and unestablished answers are allowed."
                  : "Choose a conclusion, then nominate one record for each evidence role. A claim may need several records; collection alone does not cite them."}
              </p>
            </header>
            {conflict && (
              <div className="inline-error" role="alert">
                <p>
                  The saved report changed in another tab. Your local edits
                  remain on this page.
                </p>
                <button className="button secondary" onClick={reloadDraft}>
                  Reload saved report
                </button>
              </div>
            )}
            {draft.section === 3 ? (
              <ReportReview
                draft={draft}
                fields={run.report_fields}
                records={records}
                edit={section}
                preview={preview}
              />
            ) : (
              run.report_fields
                .filter((field) => field.section === draft.section)
                .map((field, index) => (
                  <fieldset className="deduction-field" key={field.id}>
                    <legend>
                      <span className="field-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {field.label}
                    </legend>
                    <div className="answer-options">
                      {field.options.map((option) => (
                        <label
                          key={option.value}
                          className={
                            draft.fields[field.id].choice === option.value
                              ? "selected"
                              : ""
                          }
                        >
                          <input
                            type="radio"
                            name={field.id}
                            value={option.value}
                            checked={
                              draft.fields[field.id].choice === option.value
                            }
                            onChange={() => choice(field.id, option.value)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="evidence-roles">
                      <span className="eyebrow">YOUR SUPPORTING SOURCES</span>
                      {field.roles.map((role) => (
                        <div className="source-role" key={role.key}>
                          <label htmlFor={`${field.id}-${role.key}`}>
                            {role.label}
                          </label>
                          <div>
                            <select
                              id={`${field.id}-${role.key}`}
                              value={
                                draft.fields[field.id].citations[role.key] || ""
                              }
                              onChange={(event) =>
                                citation(field.id, role.key, event.target.value)
                              }
                            >
                              <option value="">No source selected</option>
                              {run.records.map((record) => (
                                <option key={record.id} value={record.id}>
                                  {record.id} · {record.title}
                                </option>
                              ))}
                            </select>
                            {draft.fields[field.id].citations[role.key] && (
                              <button
                                className="icon-button"
                                aria-label={`Preview ${role.label} source`}
                                onClick={() => {
                                  const selected =
                                    records[
                                      draft.fields[field.id].citations[
                                        role.key
                                      ]!
                                    ];
                                  if (selected) preview(selected);
                                }}
                                type="button"
                              >
                                <Icon name="evidence" size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                ))
            )}
            {draft.section === 2 && (
              <label className="report-explanation">
                Your report explanation{" "}
                <span className="subtle">Optional · not scored</span>
                <textarea
                  aria-label="Your report explanation"
                  rows={5}
                  maxLength={4000}
                  value={draft.explanation}
                  onChange={(event) =>
                    updateDraft({ ...draft, explanation: event.target.value })
                  }
                  placeholder="Explain how you read the evidence, if you wish."
                />
                <span className="input-hint">
                  {draft.explanation.length}/4000
                </span>
              </label>
            )}
            <footer className="report-navigation">
              <button
                className="button secondary"
                onClick={() =>
                  draft.section
                    ? section(draft.section - 1)
                    : continueInvestigation()
                }
              >
                <Icon name="back" size={16} />
                {draft.section ? "Back" : "Keep investigating"}
              </button>
              {draft.section < 3 ? (
                <button
                  className="button primary"
                  onClick={() => section(draft.section + 1)}
                >
                  Continue <Icon name="arrow" size={16} />
                </button>
              ) : (
                <button
                  className="button primary"
                  onClick={requestSubmit}
                  disabled={blocked || pending || conflict}
                >
                  Confirm submission <Icon name="arrow" size={16} />
                </button>
              )}
            </footer>
          </div>
          <aside className="report-summary">
            <span className="eyebrow">DRAFT COMPLETENESS</span>
            <h3>
              A report.
              <br />
              Your conclusion.
            </h3>
            <div className="summary-lines">
              <span>{conclusions} of 8 conclusions selected</span>
              <span>{citations} sources nominated</span>
              <span>Private notes excluded</span>
            </div>
            <p>These counts show completeness, never correctness.</p>
            <div className="save-summary">
              <Icon name="check" size={16} />
              <span>{saveState}</span>
            </div>
            <button
              className="text-button"
              onClick={save}
              disabled={blocked || conflict}
            >
              Save draft now
            </button>
            {pending && (
              <p className="subtle">
                Finish the pending reply before submitting.
              </p>
            )}
            <div className="rail-divider" />
            <p>
              Submitting saves an immutable report. You may continue
              investigating and submit again.
            </p>
          </aside>
        </div>
      )}
      {tab === "history" && (
        <div className="history-layout">
          <aside className="history-list">
            <span className="eyebrow">SAVED SUBMISSIONS</span>
            <p>Each report is a separate snapshot.</p>
            {attempts.map((item) => (
              <button
                className={`attempt-row ${selectedAttempt === item.id ? "selected" : ""}`}
                key={item.id}
                onClick={() => setSelectedAttempt(item.id)}
              >
                <span className="attempt-row-top">
                  <b>Submission {String(item.id).padStart(2, "0")}</b>
                  <strong>
                    {item.total}
                    <small>/100</small>
                  </strong>
                </span>
                <span>{item.accusation || item.outcome}</span>
                <time>{savedTime(item.created_at)}</time>
                {!item.is_current && (
                  <span className="history-badge">
                    Earlier investigation · may contain spoilers
                  </span>
                )}
              </button>
            ))}
            {!attempts.length && (
              <div className="empty-copy">
                No reports submitted. Saving a draft or note does not create a
                submission.
              </div>
            )}
          </aside>
          <div className="attempt-detail">
            {resultError && (
              <div className="inline-error" role="alert">
                <p>{resultError}</p>
                <button
                  className="button secondary"
                  onClick={() => {
                    if (selectedAttempt)
                      void api<Attempt>(`/api/attempts/${selectedAttempt}`)
                        .then(setAttempt)
                        .catch(() => {});
                  }}
                >
                  Retry result
                </button>
              </div>
            )}
            {selectedAttempt &&
              attempt?.id !== selectedAttempt &&
              !resultError && (
                <p role="status" className="empty-copy">
                  Loading your saved submission…
                </p>
              )}
            {attempt?.id === selectedAttempt && (
              <>
                <header className="result-heading">
                  <div>
                    <span className="eyebrow">
                      SUBMISSION {String(attempt.id).padStart(2, "0")} ·
                      READ-ONLY
                    </span>
                    <h2>{attempt.score.accusation || attempt.score.outcome}</h2>
                    <p>
                      {savedTime(attempt.created_at)} ·{" "}
                      {attempt.is_current
                        ? "Current investigation"
                        : "Historical investigation — sources do not carry into your new run"}
                    </p>
                  </div>
                  <div className="result-score">
                    <strong>{attempt.score.total}</strong>
                    <span>/ 100</span>
                  </div>
                </header>
                <div className="result-actions">
                  <button
                    className="button secondary"
                    onClick={continueInvestigation}
                  >
                    Continue investigation <Icon name="arrow" size={16} />
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setTab("draft")}
                  >
                    Edit current draft
                  </button>
                  {attempt.solution_revealed ? (
                    <button
                      className="text-button"
                      onClick={() => void loadSolution()}
                      disabled={solutionLoading}
                    >
                      {solutionLoading
                        ? "Loading review…"
                        : "Open solution review"}
                    </button>
                  ) : attempt.is_current ? (
                    <button
                      className="text-button muted"
                      disabled={blocked || pending}
                      onClick={requestReveal}
                    >
                      Reveal solution · spoilers
                    </button>
                  ) : (
                    <span className="subtle">
                      Solution was not revealed in this historical run.
                    </span>
                  )}
                </div>
                <p className="snapshot-notice">
                  This is the exact report you submitted. New evidence and draft
                  edits never change this score.
                </p>
                <ReportReview
                  draft={attempt.draft}
                  fields={attempt.report_fields}
                  records={attempt.records}
                  preview={preview}
                  frozen
                />
                {attempt.score.rows && (
                  <section className="score-breakdown">
                    <span className="eyebrow">
                      DETAILED REVIEW · SPOILERS AUTHORIZED
                    </span>
                    <h3>How your sources supported the claims</h3>
                    {attempt.score.rows.map((row) => (
                      <article key={row.id}>
                        <div>
                          <strong>{row.label}</strong>
                          <span>
                            {row.points} / {row.max_points}
                          </span>
                        </div>
                        <p>{row.reason}</p>
                        <p className="subtle">
                          Full proof:{" "}
                          {row.required
                            .map(
                              (source) => `${source.role}: ${source.record_id}`,
                            )
                            .join(" · ")}
                        </p>
                      </article>
                    ))}
                  </section>
                )}
                {solution && (
                  <section className="solution-review">
                    <span className="eyebrow">
                      CASE RECONSTRUCTION · AUTHORIZED SPOILER REVIEW
                    </span>
                    <h2>How the evidence fits.</h2>
                    {solution.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                    {solution.testimony_review_only && (
                      <p className="context-label">
                        Alex&apos;s alcove admission is revealed in case review.
                        It was not elicited in this submission&apos;s
                        conversation, and is not a phone-derived location.
                      </p>
                    )}
                    <div className="solution-sources">
                      {solution.records.map((record) => (
                        <button
                          key={record.id}
                          onClick={() => preview(record, true)}
                        >
                          <b>{record.id}</b>
                          <span>
                            {record.title}
                            {record.review_only && (
                              <small>Revealed in case review</small>
                            )}
                          </span>
                          <Icon name="evidence" size={15} />
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
            {!selectedAttempt && (
              <div className="empty-panel">
                <Icon name="archive" size={30} />
                <h3>Your reports will be kept here.</h3>
                <p>
                  Choose a submission to review its frozen answers and sources.
                </p>
                <button
                  className="button secondary"
                  onClick={() => setTab("draft")}
                >
                  Return to draft
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
