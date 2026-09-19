import { useCallback, useEffect, useRef, useState } from "react";
import type { WidgetDefinition, WidgetFileId } from "../models/widget";
import { widgetApi } from "../services/widgetApi";

const HISTORY_LIMIT = 50;

export function useWidgetBuilder(widgetId: string) {
  const [widget, setWidget] = useState<WidgetDefinition | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<WidgetFileId>("component");
  const [openFiles, setOpenFiles] = useState<WidgetFileId[]>(["component"]);
  const [dirtyFiles, setDirtyFiles] = useState<WidgetFileId[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const past = useRef<WidgetDefinition[]>([]);
  const future = useRef<WidgetDefinition[]>([]);
  const [historyTick, setHistoryTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setWidget(null);
    setLoadError(null);
    widgetApi
      .getWidget(widgetId)
      .then((w) => {
        if (!alive) return;
        past.current = [];
        future.current = [];
        setWidget(w);
        setDirty(false);
        setDirtyFiles([]);
      })
      .catch((e: unknown) => alive && setLoadError(e instanceof Error ? e.message : "Failed to load the widget."));
    return () => {
      alive = false;
    };
  }, [widgetId]);

  const commit = useCallback((fn: (widget: WidgetDefinition) => WidgetDefinition) => {
    setWidget((current) => {
      if (!current) return current;
      const next = fn(current);
      if (next === current) return current;
      past.current = [...past.current, current].slice(-HISTORY_LIMIT);
      future.current = [];
      setHistoryTick((t) => t + 1);
      return { ...next, status: "draft" };
    });
    setDirty(true);
  }, []);

  const setFile = useCallback(
    (file: WidgetFileId, content: string) => {
      commit((w) => ({ ...w, files: { ...w.files, [file]: content } }));
      setDirtyFiles((files) => (files.includes(file) ? files : [...files, file]));
    },
    [commit],
  );

  const openFile = useCallback((file: WidgetFileId) => {
    setActiveFile(file);
    setOpenFiles((files) => (files.includes(file) ? files : [...files, file]));
  }, []);

  const closeFile = useCallback((file: WidgetFileId) => {
    setOpenFiles((files) => {
      const next = files.filter((f) => f !== file);
      setActiveFile((active) => (active === file ? (next.at(-1) ?? "component") : active));
      return next.length ? next : ["component"];
    });
  }, []);

  const undo = useCallback(() => {
    setWidget((current) => {
      const previous = past.current.at(-1);
      if (!current || !previous) return current;
      past.current = past.current.slice(0, -1);
      future.current = [current, ...future.current].slice(0, HISTORY_LIMIT);
      setHistoryTick((t) => t + 1);
      setDirty(true);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setWidget((current) => {
      const next = future.current[0];
      if (!current || !next) return current;
      future.current = future.current.slice(1);
      past.current = [...past.current, current].slice(-HISTORY_LIMIT);
      setHistoryTick((t) => t + 1);
      setDirty(true);
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    if (!widget) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await widgetApi.saveWidget(widget);
      setWidget(saved);
      setDirty(false);
      setDirtyFiles([]);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save the widget.");
    } finally {
      setSaving(false);
    }
  }, [widget]);

  return {
    widget,
    loadError,
    activeFile,
    openFiles,
    dirtyFiles,
    dirty,
    saving,
    saveError,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    historyTick,
    commit,
    setFile,
    openFile,
    closeFile,
    undo,
    redo,
    save,
  };
}

export type WidgetBuilderState = ReturnType<typeof useWidgetBuilder>;
