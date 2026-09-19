import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Breakpoint, ComponentCategory, ComponentDefinition, UiNode, UiPage } from "../models/ui";
import { indexCatalog } from "../mock/catalog";
import {
  cloneSubtree,
  createNode,
  findNode,
  findParent,
  insertNode,
  mapNode,
  removeNode,
} from "../models/node-utils";
import { uiBuilderApi } from "../services/uiBuilderApi";

const HISTORY_LIMIT = 50;

export interface DropTarget {
  parentId: string;
  index: number;
}

export function useUiBuilder(pageId: string) {
  const [page, setPage] = useState<UiPage | null>(null);
  const [categories, setCategories] = useState<ComponentCategory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [zoom, setZoom] = useState(100);
  const [previewMode, setPreviewMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const past = useRef<UiPage[]>([]);
  const future = useRef<UiPage[]>([]);
  const [historyTick, setHistoryTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setPage(null);
    setLoadError(null);
    uiBuilderApi
      .getPage(pageId)
      .then((p) => {
        if (!alive) return;
        past.current = [];
        future.current = [];
        setPage(p);
        setDirty(false);
      })
      .catch((e: unknown) => alive && setLoadError(e instanceof Error ? e.message : "Failed to load the page."));
    return () => {
      alive = false;
    };
  }, [pageId]);

  useEffect(() => {
    let alive = true;
    uiBuilderApi.getComponentCatalog().then((c) => alive && setCategories(c));
    return () => {
      alive = false;
    };
  }, []);

  const definitions = useMemo(() => indexCatalog(categories), [categories]);

  const commit = useCallback((fn: (page: UiPage) => UiPage, options: { history?: boolean } = {}) => {
    setPage((current) => {
      if (!current) return current;
      const next = fn(current);
      if (next === current) return current;
      if (options.history !== false) {
        past.current = [...past.current, current].slice(-HISTORY_LIMIT);
        future.current = [];
        setHistoryTick((t) => t + 1);
      }
      return next;
    });
    setDirty(true);
    setSavedAt(null);
  }, []);

  const undo = useCallback(() => {
    setPage((current) => {
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
    setPage((current) => {
      const next = future.current[0];
      if (!current || !next) return current;
      future.current = future.current.slice(1);
      past.current = [...past.current, current].slice(-HISTORY_LIMIT);
      setHistoryTick((t) => t + 1);
      setDirty(true);
      return next;
    });
  }, []);

  const updateNode = useCallback(
    (nodeId: string, fn: (node: UiNode) => UiNode, options?: { history?: boolean }) => {
      commit((p) => ({ ...p, root: mapNode(p.root, nodeId, fn) }), options ?? {});
    },
    [commit],
  );

  const addComponent = useCallback(
    (def: ComponentDefinition, target: DropTarget) => {
      const node = createNode(def);
      commit((p) => ({ ...p, root: insertNode(p.root, target.parentId, node, target.index) }));
      setSelectedId(node.id);
    },
    [commit],
  );

  const moveNode = useCallback(
    (nodeId: string, target: DropTarget) => {
      commit((p) => {
        const node = findNode(p.root, nodeId);
        if (!node) return p;
        if (nodeId === target.parentId) return p;
        if (findNode(node, target.parentId)) return p; // cannot drop into own subtree
        const parent = findParent(p.root, nodeId);
        let index = target.index;
        if (parent && parent.id === target.parentId) {
          const current = parent.children.findIndex((c) => c.id === nodeId);
          if (current > -1 && current < index) index -= 1;
        }
        const stripped = removeNode(p.root, nodeId);
        return { ...p, root: insertNode(stripped, target.parentId, node, index) };
      });
    },
    [commit],
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      commit((p) => {
        const node = findNode(p.root, nodeId);
        const parent = findParent(p.root, nodeId);
        if (!node || !parent) return p;
        const index = parent.children.findIndex((c) => c.id === nodeId) + 1;
        return { ...p, root: insertNode(p.root, parent.id, cloneSubtree(node), index) };
      });
    },
    [commit],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      commit((p) => ({ ...p, root: removeNode(p.root, nodeId) }));
      setSelectedId((id) => (id === nodeId ? null : id));
    },
    [commit],
  );

  const renamePage = useCallback((name: string) => commit((p) => ({ ...p, name })), [commit]);

  const save = useCallback(async () => {
    if (!page) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await uiBuilderApi.savePage(page);
      setPage(saved);
      setDirty(false);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save the page.");
    } finally {
      setSaving(false);
    }
  }, [page]);

  const selected = page && selectedId ? findNode(page.root, selectedId) : null;

  return {
    page,
    categories,
    definitions,
    loadError,
    selected,
    selectedId,
    setSelectedId,
    breakpoint,
    setBreakpoint,
    zoom,
    setZoom,
    previewMode,
    setPreviewMode,
    dirty,
    saving,
    saveError,
    savedAt,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    historyTick,
    undo,
    redo,
    updateNode,
    addComponent,
    moveNode,
    duplicateNode,
    deleteNode,
    renamePage,
    save,
  };
}

export type UiBuilderState = ReturnType<typeof useUiBuilder>;
