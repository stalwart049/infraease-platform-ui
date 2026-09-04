import type { JournalType } from "@/services/types";

/** Data carried by dnd-kit draggables/droppables inside the Form Builder. */
export type DragData =
  | { kind: "field"; name: string; label: string }
  | { kind: "journal"; journalType: JournalType; label: string }
  | { kind: "item"; itemId: string; sectionId: string; index: number; label: string }
  | { kind: "section"; sectionId: string; index: number; label: string }
  | { kind: "section-body"; sectionId: string; count: number };

export const paletteFieldId = (name: string) => `pal-field:${name}`;
export const paletteJournalId = (t: string) => `pal-journal:${t}`;
export const sectionId = (id: string) => `sec:${id}`;
export const sectionBodyId = (id: string) => `sec-body:${id}`;
