import { useCallback, useEffect, useState } from "react";

const KEY = "infraease.menuExpansion";

/**
 * Expansion state for hierarchical menus, persisted per node id so the tree
 * looks the same on the next visit. Works for arbitrary nesting depth.
 */
export function useMenuExpansion() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored) {
      try {
        setExpanded(JSON.parse(stored) as Record<string, boolean>);
      } catch {
        /* ignore malformed personalization */
      }
    }
  }, []);

  const toggle = useCallback((id: string, defaultOpen: boolean) => {
    setExpanded((prev) => {
      const current = prev[id] ?? defaultOpen;
      const next = { ...prev, [id]: !current };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (id: string, defaultOpen = true) => expanded[id] ?? defaultOpen,
    [expanded],
  );

  return { isExpanded, toggle };
}
