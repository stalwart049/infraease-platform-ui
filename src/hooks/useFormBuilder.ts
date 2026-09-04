import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formBuilderService } from "@/services/formBuilderService";
import type { FieldWidth, FormBuilderData, FormViewConfig, FormViewItem, JournalType } from "@/services/types";
import {
  findItem,
  makeFieldItem,
  makeJournalItem,
  makeSection,
  normalize,
  placedFieldNames,
  placedJournalTypes,
  validateConfig,
} from "@/lib/form-builder-utils";

export function useFormBuilder(tableName: string, viewId?: string) {
  const [data, setData] = useState<FormBuilderData | null>(null);
  const [config, setConfig] = useState<FormViewConfig | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    formBuilderService
      .getFormView(tableName, viewId)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setConfig(normalize(res.formView));
        setSelectedId(null);
        setDirty(false);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load the form view.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tableName, viewId]);

  useEffect(() => load(), [load]);

  const update = useCallback((fn: (c: FormViewConfig) => FormViewConfig) => {
    setConfig((prev) => (prev ? normalize(fn(structuredClone(prev))) : prev));
    setDirty(true);
  }, []);

  const availableFields = useMemo(() => {
    if (!data || !config) return [];
    const placed = placedFieldNames(config);
    return data.fields.filter((f) => !placed.has(f.name));
  }, [data, config]);

  const availableJournals = useMemo(() => {
    if (!data || !config) return [];
    const placed = placedJournalTypes(config);
    return data.journalComponents.filter((j) => !placed.has(j.journalType));
  }, [data, config]);

  const selected = useMemo(() => {
    if (!config || !selectedId) return null;
    return findItem(config, selectedId)?.item ?? null;
  }, [config, selectedId]);

  const selectedSection = useMemo(() => {
    if (!config || !selectedId) return null;
    return findItem(config, selectedId)?.section ?? null;
  }, [config, selectedId]);

  // ------------------------------------------------------------- mutations

  const insertItem = useCallback(
    (item: FormViewItem, sectionId: string, index: number) => {
      update((c) => {
        const section = c.sections.find((s) => s.sys_id === sectionId);
        if (!section) return c;
        section.fields.splice(Math.max(0, Math.min(index, section.fields.length)), 0, item);
        return c;
      });
      setSelectedId(item.sys_id);
    },
    [update],
  );

  const addField = useCallback(
    (fieldName: string, sectionId: string, index: number) => {
      if (!data || !config) return;
      // a field can only exist once on a form view
      if (placedFieldNames(config).has(fieldName)) {
        toast.info("That field is already on this form view.");
        return;
      }
      const field = data.fields.find((f) => f.name === fieldName);
      if (!field) return;
      insertItem(makeFieldItem(field), sectionId, index);
    },
    [data, config, insertItem],
  );

  const addJournal = useCallback(
    (journalType: JournalType, sectionId: string, index: number) => {
      if (!data || !config) return;
      if (placedJournalTypes(config).has(journalType)) {
        toast.info("That journal component is already on this form view.");
        return;
      }
      const meta = data.journalComponents.find((j) => j.journalType === journalType);
      if (!meta) return;
      insertItem(makeJournalItem(journalType, meta.label), sectionId, index);
    },
    [data, config, insertItem],
  );

  /** Moves an existing item to an index in the destination list *without* the item. */
  const moveItemTo = useCallback(
    (itemId: string, toSectionId: string, index: number) => {
      update((c) => {
        const from = c.sections.find((s) => s.fields.some((f) => f.sys_id === itemId));
        const to = c.sections.find((s) => s.sys_id === toSectionId);
        if (!from || !to) return c;
        const currentIndex = from.fields.findIndex((f) => f.sys_id === itemId);
        const [item] = from.fields.splice(currentIndex, 1);
        if (!item) return c;
        to.fields.splice(Math.max(0, Math.min(index, to.fields.length)), 0, item);
        return c;
      });
      setSelectedId(itemId);
    },
    [update],
  );

  /** Moves an existing item — never duplicates it. */
  const moveItem = useCallback(
    (itemId: string, toSectionId: string, index: number) => {
      update((c) => {
        const from = c.sections.find((s) => s.fields.some((f) => f.sys_id === itemId));
        const to = c.sections.find((s) => s.sys_id === toSectionId);
        if (!from || !to) return c;
        const currentIndex = from.fields.findIndex((f) => f.sys_id === itemId);
        const [item] = from.fields.splice(currentIndex, 1);
        if (!item) return c;
        let target = index;
        if (from === to && currentIndex < index) target -= 1;
        to.fields.splice(Math.max(0, Math.min(target, to.fields.length)), 0, item);
        return c;
      });
    },
    [update],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      update((c) => {
        c.sections.forEach((s) => {
          s.fields = s.fields.filter((f) => f.sys_id !== itemId);
        });
        return c;
      });
      setSelectedId((cur) => (cur === itemId ? null : cur));
    },
    [update],
  );

  const setItemProperty = useCallback(
    (itemId: string, patch: Partial<{ mandatory: boolean; readonly: boolean; visible: boolean }>) => {
      update((c) => {
        const found = findItem(c, itemId);
        if (found) Object.assign(found.item.properties, patch);
        return c;
      });
    },
    [update],
  );

  const setItemWidth = useCallback(
    (itemId: string, width: FieldWidth) => {
      update((c) => {
        const found = findItem(c, itemId);
        if (found && found.item.type === "field") found.item.properties.width = width;
        return c;
      });
    },
    [update],
  );

  const setItemOrder = useCallback(
    (itemId: string, order: number) => {
      if (!config) return;
      const found = findItem(config, itemId);
      if (!found) return;
      moveItem(itemId, found.section.sys_id, Math.max(0, order - 1));
    },
    [config, moveItem],
  );

  const addSection = useCallback(() => {
    update((c) => {
      c.sections.push(makeSection("New Section", c.sections.length + 1));
      return c;
    });
  }, [update]);

  const renameSection = useCallback(
    (sectionId: string, name: string) => {
      update((c) => {
        const s = c.sections.find((x) => x.sys_id === sectionId);
        if (s) s.name = name;
        return c;
      });
    },
    [update],
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      update((c) => {
        c.sections = c.sections.filter((s) => s.sys_id !== sectionId);
        return c;
      });
      setSelectedId(null);
    },
    [update],
  );

  const moveSection = useCallback(
    (sectionId: string, toIndex: number) => {
      update((c) => {
        const from = c.sections.findIndex((s) => s.sys_id === sectionId);
        if (from < 0) return c;
        const [section] = c.sections.splice(from, 1);
        if (!section) return c;
        let target = toIndex;
        if (from < toIndex) target -= 1;
        c.sections.splice(Math.max(0, Math.min(target, c.sections.length)), 0, section);
        return c;
      });
    },
    [update],
  );

  const save = useCallback(async () => {
    if (!config || !data) return;
    const canonical = normalize(config);
    const problems = validateConfig(canonical, data.fields);
    if (problems.length) {
      toast.error("Unable to save form view.", { description: problems[0] });
      return;
    }
    setSaving(true);
    try {
      const saved = await formBuilderService.saveFormView({ formView: canonical });
      setConfig(normalize(saved));
      setDirty(false);
      toast.success("Form View saved successfully");
    } catch (e) {
      toast.error("Unable to save form view.", {
        description: e instanceof Error ? e.message : "Please try again in a moment.",
      });
    } finally {
      setSaving(false);
    }
  }, [config, data]);

  return {
    data,
    config,
    loading,
    error,
    dirty,
    saving,
    selected,
    selectedSection,
    selectedId,
    setSelectedId,
    availableFields,
    availableJournals,
    addField,
    addJournal,
    moveItem,
    moveItemTo,
    setItemWidth,
    removeItem,
    setItemProperty,
    setItemOrder,
    addSection,
    renameSection,
    deleteSection,
    moveSection,
    save,
    reload: load,
  };
}
