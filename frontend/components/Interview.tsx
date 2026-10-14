"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Character, CharacterId, Run } from "@/lib/types";
import { Icon } from "./Icon";
import { HelpTip } from "./InvestigationGuide";

export function Interview({
  run,
  characters,
  blocked,
  pending,
  mode,
  send,
  openRecord,
  seed,
  recoveredExchange,
  useScripted,
}: {
  run: Run;
  characters: Character[];
  blocked: boolean;
  pending: boolean;
  mode: string;
  send: (
    character: CharacterId,
    text: string,
    topic: string | null,
    evidence: string[],
  ) => Promise<boolean>;
  openRecord: (id: string) => void;
  seed: { character: CharacterId; record: string; token: number } | null;
  recoveredExchange: {
    character: CharacterId;
    question: string;
    token: number;
  } | null;
  useScripted: () => void;
}) {
  const [person, setPerson] = useState<CharacterId>("alex");
  const [texts, setTexts] = useState<Record<CharacterId, string>>({
    alex: "",
    maya: "",
    daniel: "",
  });
  const [topic, setTopic] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [present, setPresent] = useState(false);
  const [pendingPerson, setPendingPerson] = useState<CharacterId | null>(null);
  const [slow, setSlow] = useState(false);
  const [newReply, setNewReply] = useState(false);
  const transcript = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);
  const recoveredToken = useRef(0);
  const scrollPositions = useRef<Partial<Record<CharacterId, number>>>({});
  const current = characters.find((character) => character.id === person)!;
  const exchanges = run.conversations.filter(
    (entry) => entry.character_id === person,
  );
  const firstCorrection = exchanges.find((entry) => entry.corrects);

  useEffect(() => {
    if (
      !recoveredExchange ||
      recoveredToken.current === recoveredExchange.token
    )
      return;
    recoveredToken.current = recoveredExchange.token;
    const timer = window.setTimeout(() => {
      setTexts((previous) =>
        previous[recoveredExchange.character] === recoveredExchange.question
          ? { ...previous, [recoveredExchange.character]: "" }
          : previous,
      );
      setEvidence([]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [recoveredExchange]);

  function switchPerson(next: CharacterId) {
    scrollPositions.current[person] = transcript.current?.scrollTop || 0;
    setPerson(next);
    setTopic(null);
    setEvidence([]);
    setNewReply(false);
    window.requestAnimationFrame(() => {
      if (transcript.current)
        transcript.current.scrollTop = scrollPositions.current[next] || 0;
    });
  }

  useEffect(() => {
    if (!seed) return;
    const timer = window.setTimeout(() => {
      setPerson(seed.character);
      setEvidence([seed.record]);
      setTopic(null);
      setPresent(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [seed]);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setSlow(true), 10000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [pending]);

  useEffect(() => {
    if (exchanges.length > lastCount.current) {
      const panel = transcript.current;
      if (
        panel &&
        panel.scrollHeight - panel.scrollTop - panel.clientHeight < 300
      )
        panel.scrollTop = panel.scrollHeight;
      else if (panel) window.setTimeout(() => setNewReply(true), 0);
    }
    lastCount.current = exchanges.length;
  }, [exchanges.length]);

  async function ask(useTopic: boolean) {
    const typed = texts[person];
    const askedPerson = person;
    setPendingPerson(person);
    setSlow(false);
    const ok = await send(
      person,
      typed,
      useTopic || evidence.length ? topic : null,
      evidence,
    );
    if (ok) {
      setTexts((previous) =>
        previous[askedPerson] === typed
          ? { ...previous, [askedPerson]: "" }
          : previous,
      );
      setEvidence([]);
    }
    setPendingPerson(null);
    setSlow(false);
  }

  return (
    <div className="interview-layout">
      <aside className="people-rail" aria-label="People of interest">
        <p className="eyebrow">PEOPLE OF INTEREST</p>
        <div
          className="people-list"
          role="radiogroup"
          aria-label="Choose a person"
        >
          {characters.map((character) => (
            <label
              key={character.id}
              className={`person-card ${person === character.id ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="person"
                value={character.id}
                checked={person === character.id}
                onChange={() => {
                  switchPerson(character.id);
                }}
              />
              <Image
                src={`/portraits/${character.id}.svg`}
                alt=""
                width={190}
                height={210}
              />
              <span className="person-name">{character.name}</span>
              <span className="person-role">{character.role}</span>
            </label>
          ))}
        </div>
        <div className="rail-caption">
          <Icon name="book" />
          <p>
            An account is testimony.
            <br />
            Let the records test it.
          </p>
        </div>
      </aside>
      <section
        className="interview-main"
        aria-label={`Interview ${current.name}`}
      >
        <header className="interview-identity">
          <div>
            <span className="eyebrow">INTERVIEW SUBJECT</span>
            <h2>{current.name}</h2>
            <p>{current.role} · Evening shift</p>
          </div>
          <span className="mode-chip">
            <span className="status-dot" />
            {mode === "ollama" ? "Local dialogue" : "Authored dialogue"}
          </span>
        </header>
        <div className="transcript" ref={transcript}>
          <article className="opening-account">
            <div className="message-meta">
              <span>OPENING ACCOUNT · E02</span>
              <span>23:35</span>
            </div>
            <blockquote>
              {current.initial_statement.split(" — ").slice(1).join(" — ")}
            </blockquote>
            <div className="message-actions">
              <button className="text-button" onClick={() => openRecord("E02")}>
                Open recorded statement <Icon name="arrow" size={15} />
              </button>
              {firstCorrection && (
                <button
                  className="text-button revised"
                  onClick={() =>
                    document
                      .getElementById(`exchange-${firstCorrection.id}`)
                      ?.focus()
                  }
                >
                  Later account available
                </button>
              )}
            </div>
          </article>
          {!exchanges.length && (
            <div className="empty-thread">
              <Icon name="interview" size={24} />
              <p>Where would you like to begin?</p>
              <span>Ask a question or choose one of the topics.</span>
            </div>
          )}
          {exchanges.map((exchange, index) => (
            <article
              key={exchange.id}
              id={`exchange-${exchange.id}`}
              tabIndex={-1}
              className="exchange"
            >
              <div className="player-question">
                <span className="eyebrow">
                  YOUR QUESTION · {String(index + 1).padStart(2, "0")}
                </span>
                <p>{exchange.question}</p>
                {!!exchange.source_ids.length && (
                  <div className="chips">
                    {exchange.source_ids.map((id) => (
                      <button
                        key={id}
                        className="chip"
                        onClick={() => openRecord(id)}
                      >
                        {id}
                        <Icon name="evidence" size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="character-reply">
                <div className="message-meta">
                  <span>{current.name.toUpperCase()}</span>
                  <span>
                    {exchange.corrects
                      ? "REVISED ACCOUNT"
                      : exchange.kind.toUpperCase()}
                  </span>
                </div>
                <p>{exchange.reply}</p>
                {exchange.corrects && (
                  <button
                    className="text-button"
                    onClick={() => openRecord("E02")}
                  >
                    Compare with original statement
                  </button>
                )}
              </div>
            </article>
          ))}
          {pending &&
            (pendingPerson || run.pending_character_id) === person && (
              <div className="waiting-reply" role="status">
                <span className="waiting-mark" />
                <div>
                  {slow
                    ? "This reply is taking longer than usual."
                    : "Waiting for reply…"}
                  <p>You can keep reading the records.</p>
                  {slow && run.pending_command_id && (
                    <button
                      className="text-button"
                      onClick={useScripted}
                      disabled={blocked}
                    >
                      Use scripted reply
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
        {newReply && (
          <button
            className="new-reply"
            onClick={() => {
              const panel = transcript.current;
              if (panel) panel.scrollTop = panel.scrollHeight;
              setNewReply(false);
            }}
          >
            New reply <Icon name="arrow" size={14} />
          </button>
        )}
        <HelpTip topic="questions" />
        <div className="topic-tray">
          <span className="eyebrow">FOLLOW A TOPIC</span>
          <div className="topic-list">
            {current.topics.map((item) => (
              <button
                key={item.id}
                className={`topic ${topic === item.id ? "active" : ""}`}
                aria-pressed={topic === item.id}
                onClick={() => setTopic(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {topic && (
            <div className="topic-preview">
              <span>
                Ask about{" "}
                {current.topics
                  .find((item) => item.id === topic)
                  ?.label.toLowerCase()}
              </span>
              <button
                className="text-button"
                onClick={() => void ask(true)}
                disabled={blocked || pending}
              >
                Ask this topic <Icon name="arrow" size={15} />
              </button>
            </div>
          )}
        </div>
        <form
          className="question-composer"
          onSubmit={(event) => {
            event.preventDefault();
            void ask(false);
          }}
        >
          <label htmlFor="question">Your question</label>
          <textarea
            id="question"
            rows={2}
            maxLength={2000}
            value={texts[person]}
            placeholder="Ask about their account…"
            onChange={(event) =>
              setTexts({ ...texts, [person]: event.target.value })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                if (
                  !blocked &&
                  !pending &&
                  texts[person].trim() &&
                  (!evidence.length || topic)
                )
                  void ask(false);
              }
            }}
          />
          <div className="composer-footer">
            <button
              type="button"
              className={`text-button ${present ? "active" : ""}`}
              onClick={() => setPresent(!present)}
            >
              <Icon name="evidence" size={16} />
              {evidence.length
                ? `${evidence.length} records selected`
                : "Present evidence"}
            </button>
            <span className="input-hint">
              {texts[person].length > 1800
                ? `${texts[person].length}/2000`
                : "Ctrl/⌘ + Enter"}
            </span>
            <button
              className="button primary small"
              disabled={
                blocked ||
                pending ||
                !texts[person].trim() ||
                (!!evidence.length && !topic)
              }
            >
              Send question <Icon name="arrow" size={16} />
            </button>
          </div>
        </form>
        {present && (
          <div className="presentation-inline">
            <p>
              Select collected records and a visible topic, then present them
              together.
            </p>
            <div className="evidence-checks">
              {run.records.map((record) => (
                <label key={record.id}>
                  <input
                    type="checkbox"
                    checked={evidence.includes(record.id)}
                    onChange={(event) =>
                      setEvidence(
                        event.target.checked
                          ? [...evidence, record.id]
                          : evidence.filter((id) => id !== record.id),
                      )
                    }
                  />
                  <span>
                    <b>{record.id}</b> {record.title}
                  </span>
                </label>
              ))}
            </div>
            <button
              className="button secondary small"
              disabled={!topic || !evidence.length || pending || blocked}
              onClick={() => void ask(true)}
            >
              Present to {current.name.split(" ")[0]}{" "}
              <Icon name="arrow" size={16} />
            </button>
          </div>
        )}
      </section>
      <aside className="interview-context">
        <p className="eyebrow">YOUR DOSSIER</p>
        <h3>Let the sources speak.</h3>
        <p>
          Present records to address a specific account. Their response is still
          testimony.
        </p>
        <div className="context-records">
          {run.records.slice(0, 5).map((record) => (
            <button key={record.id} onClick={() => openRecord(record.id)}>
              <span className="record-code">{record.id}</span>
              <span>{record.title}</span>
              <Icon name="arrow" size={14} />
            </button>
          ))}
        </div>
        <div className="context-note">
          <Icon name="clock" />
          <p>
            All case times are museum local time.
            <br />
            <strong>11:17 PM = 23:17.</strong>
          </p>
        </div>
      </aside>
    </div>
  );
}
