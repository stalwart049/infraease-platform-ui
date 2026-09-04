import { useCallback, useEffect, useRef, useState } from "react";
import { workflowService } from "@/services/workflowService";
import type { WorkflowCatalog, WorkflowDefinition, WorkflowSummary } from "@/services/types";

interface Options {
  workflowId: string;
}

/** Owns the workflow definition, undo/redo history and the save lifecycle. */
export function useWorkflowEditor({ workflowId }: Options) {
  const [definition, setDefinition] = useState<WorkflowDefinition | null>(null);
  const [catalog, setCatalog] = useState<WorkflowCatalog | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const past = useRef<WorkflowDefinition[]>([]);
  const future = useRef<WorkflowDefinition[]>([]);
  const [historyTick, setHistoryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([
      workflowService.getWorkflow(workflowId),
      workflowService.getCatalog(),
      workflowService.listWorkflows(),
    ])
      .then(([def, cat, list]) => {
        if (cancelled) return;
        past.current = [];
        future.current = [];
        setDefinition(def);
        setCatalog(cat);
        setWorkflows(list);
        setDirty(false);
        setHistoryTick((t) => t + 1);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Failed to load workflow.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [workflowId]);

  /** Apply a change. `history: false` for transient updates such as live dragging. */
  const update = useCallback(
    (fn: (draft: WorkflowDefinition) => WorkflowDefinition, options?: { history?: boolean }) => {
      setDefinition((current) => {
        if (!current) return current;
        const next = fn(current);
        if (next === current) return current;
        if (options?.history !== false) {
          past.current = [...past.current.slice(-49), current];
          future.current = [];
          setHistoryTick((t) => t + 1);
        }
        setDirty(true);
        return next;
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setDefinition((current) => {
      const previous = past.current.pop();
      if (!current || !previous) return current;
      future.current = [current, ...future.current.slice(0, 49)];
      setHistoryTick((t) => t + 1);
      setDirty(true);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setDefinition((current) => {
      const [next, ...rest] = future.current;
      if (!current || !next) return current;
      future.current = rest;
      past.current = [...past.current, current];
      setHistoryTick((t) => t + 1);
      setDirty(true);
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    if (!definition) return null;
    setSaving(true);
    setSaveError(null);
    try {
      const stored = await workflowService.saveWorkflow(definition);
      setDefinition(stored);
      setDirty(false);
      setSavedAt(
        new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      );
      return stored;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save workflow.");
      return null;
    } finally {
      setSaving(false);
    }
  }, [definition]);

  return {
    definition,
    catalog,
    workflows,
    loading,
    loadError,
    saving,
    saveError,
    dirty,
    savedAt,
    update,
    undo,
    redo,
    canUndo: historyTick >= 0 && past.current.length > 0,
    canRedo: future.current.length > 0,
    save,
  };
}
