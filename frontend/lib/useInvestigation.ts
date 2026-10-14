"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";
import type { ActionResult, Bootstrap, CharacterId, Draft, Run } from "./types";

interface Uncertain {
  id: string;
  path: string;
  method: string;
  body: Record<string, unknown>;
}

export function useInvestigation() {
  const [data, setData] = useState<Bootstrap | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState("Saved");
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [dialogueBusy, setDialogueBusy] = useState(false);
  const [dialogueMode, setDialogueMode] = useState("scripted");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [uncertain, setUncertain] = useState<Uncertain | null>(null);
  const runRef = useRef<Run | null>(null);
  const draftRef = useRef<Draft | null>(null);
  const dirtyRef = useRef(false);
  const baseline = useRef("");
  const saving = useRef(false);
  const activeDialogue = useRef<string | null>(null);

  const adopt = useCallback((run: Run, acknowledged?: Draft) => {
    const previous = runRef.current;
    if (
      previous &&
      previous.id !== run.id &&
      run.created_at < previous.created_at
    )
      return;
    if (previous?.id === run.id && previous.revision > run.revision) return;
    runRef.current = run;
    setData((current) => (current ? { ...current, run } : current));
    if (!previous || previous.id !== run.id) {
      baseline.current = JSON.stringify(run.draft);
      draftRef.current = structuredClone(run.draft);
      dirtyRef.current = false;
      setDraft(draftRef.current);
      setDirty(false);
      setConflict(false);
      setSaveState("Saved");
      return;
    }
    if (acknowledged) {
      baseline.current = JSON.stringify(acknowledged);
      if (JSON.stringify(draftRef.current) === baseline.current) {
        dirtyRef.current = false;
        setDirty(false);
        setSaveState("Saved");
      } else {
        setSaveState("Saving…");
      }
      setConflict(false);
    } else if (!dirtyRef.current) {
      baseline.current = JSON.stringify(run.draft);
      draftRef.current = structuredClone(run.draft);
      setDraft(draftRef.current);
    } else if (JSON.stringify(run.draft) !== baseline.current) {
      setConflict(true);
      setSaveState("Not saved — another tab changed the report");
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await api<Bootstrap>("/api/bootstrap");
      setData((previous) => {
        if (
          previous?.run &&
          (!next.run || next.run.created_at < previous.run.created_at)
        )
          return previous;
        return {
          ...next,
          run:
            previous?.run &&
            next.run &&
            previous.run.id === next.run.id &&
            previous.run.revision > next.run.revision
              ? previous.run
              : next.run,
        };
      });
      if (next.run) adopt(next.run);
      setConnected(true);
      return next;
    } catch (failure) {
      setConnected(false);
      setError(
        failure instanceof Error
          ? failure.message
          : "Cannot load the investigation.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [adopt]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
      void api<{ dialogue_mode: string }>("/api/health")
        .then((health) => setDialogueMode(health.dialogue_mode))
        .catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    if (!dialogueBusy && !data?.run?.pending) return;
    const timer = window.setInterval(() => {
      void refresh();
    }, 1200);
    return () => window.clearInterval(timer);
  }, [dialogueBusy, data?.run?.pending, refresh]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current || uncertain) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [uncertain]);

  const execute = useCallback(
    async (
      action: string,
      payload: Record<string, unknown> = {},
      method = "POST",
      acknowledged?: Draft,
    ): Promise<ActionResult | null> => {
      const current = runRef.current;
      if (!current) return null;
      const id = crypto.randomUUID();
      let sent: Uncertain | null = null;
      const isInteraction = action === "interactions";
      if (isInteraction) {
        activeDialogue.current = id;
        setDialogueBusy(true);
      } else setBusy(action);
      setError(null);
      try {
        const fresh = await api<Run>(`/api/runs/${current.id}`);
        if (runRef.current?.id !== current.id)
          throw new ApiError(
            "The investigation was restarted. Resume the current case.",
            "stale_run",
          );
        if (
          (action === "draft" || action === "submit") &&
          JSON.stringify(fresh.draft) !== baseline.current
        ) {
          adopt(fresh);
          setConflict(true);
          throw new ApiError(
            "Another tab changed the saved report. Reload it before saving or confirming.",
            "revision_conflict",
          );
        }
        adopt(fresh);
        sent = {
          id,
          path: `/api/runs/${current.id}/${action}`,
          method,
          body: {
            command_id: id,
            expected_revision: fresh.revision,
            ...payload,
          },
        };
        const result = await api<ActionResult>(sent.path, method, sent.body);
        if (result.run && runRef.current?.id === current.id)
          adopt(result.run, acknowledged);
        if (result.dialogue_mode) setDialogueMode(result.dialogue_mode);
        if (result.notice) setNotice(result.notice);
        if (action.endsWith("/scripted")) {
          activeDialogue.current = null;
          setDialogueBusy(false);
        }
        setConnected(true);
        // History is fetched independently, so opening a result does not require page reload.
        if (["submit", "reveal", "reset"].includes(action)) {
          const refreshed = await api<Bootstrap>("/api/bootstrap").catch(
            () => null,
          );
          if (refreshed)
            setData((previous) =>
              previous
                ? { ...previous, attempts: refreshed.attempts }
                : refreshed,
            );
        }
        return result;
      } catch (failure) {
        const problem =
          failure instanceof ApiError
            ? failure
            : new ApiError(
                "This action could not be completed. Retry after reconnecting.",
                "disconnected",
                true,
              );
        setError(problem.message);
        if (problem.code === "disconnected") setConnected(false);
        if (problem.uncertain && sent) setUncertain(sent);
        if (action === "draft") setSaveState("Not saved");
        if (
          problem.code === "stale_run" ||
          problem.code === "revision_conflict"
        )
          await refresh();
        return null;
      } finally {
        if (isInteraction && activeDialogue.current === id) {
          activeDialogue.current = null;
          setDialogueBusy(false);
        } else setBusy("");
      }
    },
    [adopt, refresh],
  );

  const updateDraft = useCallback((next: Draft) => {
    draftRef.current = next;
    dirtyRef.current = JSON.stringify(next) !== baseline.current;
    setDraft(next);
    setDirty(dirtyRef.current);
    setSaveState(dirtyRef.current ? "Not saved" : "Saved");
  }, []);

  const saveDraft = useCallback(async () => {
    if (!draftRef.current || saving.current || !dirtyRef.current)
      return !dirtyRef.current;
    saving.current = true;
    const snapshot = structuredClone(draftRef.current);
    setSaveState("Saving…");
    const result = await execute("draft", { draft: snapshot }, "PUT", snapshot);
    saving.current = false;
    return !!result && !dirtyRef.current;
  }, [execute]);

  useEffect(() => {
    if (!dirty || !connected || conflict || uncertain || busy || dialogueBusy)
      return;
    const timer = window.setTimeout(() => {
      void saveDraft();
    }, 650);
    return () => window.clearTimeout(timer);
  }, [
    dirty,
    draft,
    connected,
    conflict,
    uncertain,
    busy,
    dialogueBusy,
    saveDraft,
  ]);

  const reloadDraft = useCallback(() => {
    const current = runRef.current;
    if (!current) return;
    baseline.current = JSON.stringify(current.draft);
    draftRef.current = structuredClone(current.draft);
    dirtyRef.current = false;
    setDraft(draftRef.current);
    setDirty(false);
    setConflict(false);
    setSaveState("Saved");
  }, []);

  const start = useCallback(async () => {
    setBusy("start");
    setError(null);
    const id = crypto.randomUUID();
    try {
      const result = await api<ActionResult>("/api/start", "POST", {
        command_id: id,
      });
      const next = await refresh();
      if (result.run) adopt(result.run);
      return !!next;
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not start the investigation.",
      );
      setConnected(false);
      if (failure instanceof ApiError && failure.uncertain)
        setUncertain({
          id,
          path: "/api/start",
          method: "POST",
          body: { command_id: id },
        });
      return false;
    } finally {
      setBusy("");
    }
  }, [adopt, refresh]);

  const reconnect = useCallback(async () => {
    setBusy("reconnect");
    let recovered: ActionResult | null = null;
    try {
      if (uncertain) {
        const status = await api<{ status: string; result?: ActionResult }>(
          `/api/commands/${uncertain.id}`,
        );
        if (status.status === "pending") {
          setNotice(
            "Your last reply is still being prepared. You can keep reading.",
          );
          await refresh();
          return null;
        }
        if (status.status === "not_found") {
          recovered = await api<ActionResult>(
            uncertain.path,
            uncertain.method,
            uncertain.body,
          );
        } else {
          recovered = status.result || null;
        }
        if (recovered?.run)
          adopt(recovered.run, uncertain.body.draft as Draft | undefined);
        if (recovered?.dialogue_mode) setDialogueMode(recovered.dialogue_mode);
        if (recovered?.notice) setNotice(recovered.notice);
        setUncertain(null);
      }
      if (await refresh()) setError(null);
      return recovered && uncertain
        ? { result: recovered, original: uncertain }
        : null;
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Reconnection failed.",
      );
      return null;
    } finally {
      setBusy("");
    }
  }, [uncertain, adopt, refresh]);

  const send = useCallback(
    (
      character: CharacterId,
      question: string,
      topic: string | null,
      evidence: string[],
    ) =>
      execute("interactions", {
        character_id: character,
        question,
        topic_id: topic,
        evidence_ids: evidence,
      }),
    [execute],
  );

  return {
    data,
    run: data?.run || null,
    draft,
    dirty,
    saveState,
    connected,
    loading,
    busy,
    dialogueBusy,
    dialogueMode,
    error,
    notice,
    conflict,
    uncertain,
    refresh,
    execute,
    start,
    updateDraft,
    saveDraft,
    reloadDraft,
    reconnect,
    send,
    clearNotice: () => setNotice(null),
    clearError: () => setError(null),
    currentRun: () => runRef.current,
  };
}
