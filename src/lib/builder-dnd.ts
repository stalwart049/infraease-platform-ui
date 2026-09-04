import type { FieldWidth, JournalType } from "@/services/types";

/** Data carried by dnd-kit draggables/droppables inside the Form Builder. */
export type DragData =
  | { kind: "field"; name: string; label: string; width: FieldWidth }
  | { kind: "journal"; journalType: JournalType; label: string }
  | {
      kind: "item";
      itemId: string;
      sectionId: string;
      index: number;
      label: string;
      width: FieldWidth;
    }
  | { kind: "section"; sectionId: string; index: number; label: string }
  | {
      kind: "item-slot";
      sectionId: string;
      /** index of this item inside the section list with the dragged item removed */
      index: number;
      width: FieldWidth;
    }
  | { kind: "section-body"; sectionId: string; count: number };

/** Where a drag will be committed. Index is relative to the list without the dragged item. */
export interface DropTarget {
  sectionId: string;
  index: number;
}

export const paletteFieldId = (name: string) => `pal-field:${name}`;
export const paletteJournalId = (t: string) => `pal-journal:${t}`;
export const sectionId = (id: string) => `sec:${id}`;
export const sectionBodyId = (id: string) => `sec-body:${id}`;
export const itemSlotId = (id: string) => `slot:${id}`;

/** Width the drag overlay / placeholder should occupy on the canvas. */
export function dragWidth(active: DragData | null): FieldWidth {
  if (!active) return "half";
  if (active.kind === "journal") return "full";
  if (active.kind === "field" || active.kind === "item") return active.width;
  return "half";
}

export function sameTarget(a: DropTarget | null, b: DropTarget | null) {
  if (!a || !b) return a === b;
  return a.sectionId === b.sectionId && a.index === b.index;
}
