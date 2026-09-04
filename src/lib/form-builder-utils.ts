import type {
  ClientScriptRef,
  FormViewConfig,
  FormViewFieldRef,
  FormViewItem,
  FormViewSection,
  JournalType,
} from "@/services/types";

export function newId(prefix: string): string {
  const rand = Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
  return `${prefix}${rand}`.slice(0, 32).padEnd(32, "0");
}

/** Recalculates section_order and field_order so the JSON is always canonical. */
export function normalize(config: FormViewConfig): FormViewConfig {
  return {
    ...config,
    sections: config.sections.map((s, si) => ({
      ...s,
      order: si + 1,
      fields: s.fields.map((f, fi) => ({ ...f, order: fi + 1 })),
    })),
  };
}

export function allItems(config: FormViewConfig): FormViewItem[] {
  return config.sections.flatMap((s) => s.fields);
}

export function placedFieldNames(config: FormViewConfig): Set<string> {
  return new Set(
    allItems(config)
      .filter((i): i is Extract<FormViewItem, { type: "field" }> => i.type === "field")
      .map((i) => i.field.name),
  );
}

export function placedJournalTypes(config: FormViewConfig): Set<string> {
  return new Set(
    allItems(config)
      .filter((i): i is Extract<FormViewItem, { type: "journal" }> => i.type === "journal")
      .map((i) => i.journalType),
  );
}

export function findItem(config: FormViewConfig, itemId: string) {
  for (const section of config.sections) {
    const index = section.fields.findIndex((f) => f.sys_id === itemId);
    if (index >= 0) return { section, index, item: section.fields[index]! };
  }
  return null;
}

export function itemLabel(item: FormViewItem): string {
  return item.type === "field" ? item.field.display_value : item.label;
}

export function makeFieldItem(field: FormViewFieldRef): FormViewItem {
  return {
    sys_id: newId("sf"),
    type: "field",
    field,
    order: 1,
    properties: { mandatory: false, readonly: false, visible: true },
  };
}

export function makeJournalItem(journalType: JournalType, label: string): FormViewItem {
  return { sys_id: newId("sf"), type: "journal", journalType, label, order: 1, properties: { visible: true } };
}

export function makeSection(name = "New Section", order = 1): FormViewSection {
  return { sys_id: newId("sec"), name, order, fields: [] };
}

const JOURNAL_TYPES = ["comments", "work_notes", "activity_stream"];

/** Pre-save validation. Returns human readable problems. */
export function validateConfig(config: FormViewConfig, tableFields: FormViewFieldRef[]): string[] {
  const problems: string[] = [];
  if (!config.sections.length) problems.push("Add at least one section before saving.");

  const sectionOrders = new Set<number>();
  config.sections.forEach((s) => {
    if (!s.name.trim()) problems.push("Every section needs a name.");
    if (sectionOrders.has(s.order)) problems.push(`Duplicate section order ${s.order}.`);
    sectionOrders.add(s.order);
    const fieldOrders = new Set<number>();
    s.fields.forEach((f) => {
      if (fieldOrders.has(f.order)) problems.push(`Duplicate field order in section "${s.name}".`);
      fieldOrders.add(f.order);
      if (f.type === "journal" && !JOURNAL_TYPES.includes(f.journalType)) {
        problems.push(`"${f.label}" has an invalid journal type.`);
      }
    });
  });

  const known = new Set(tableFields.map((f) => f.name));
  const seen = new Set<string>();
  allItems(config).forEach((i) => {
    if (i.type !== "field") return;
    if (seen.has(i.field.name)) problems.push(`"${i.field.display_value}" appears in more than one section.`);
    seen.add(i.field.name);
    if (!known.has(i.field.name)) problems.push(`"${i.field.display_value}" does not belong to this table.`);
  });

  return Array.from(new Set(problems));
}

export function scriptsForItem(
  item: FormViewItem | null,
  scripts: Record<string, ClientScriptRef[]>,
): ClientScriptRef[] {
  if (!item || item.type !== "field") return [];
  return scripts[item.field.name] ?? [];
}
