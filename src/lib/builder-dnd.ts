import type { JournalType } from "@/services/types";

export const DND_MIME = "application/x-infraease-builder";

export type DragPayload =
  | { kind: "field"; name: string }
  | { kind: "journal"; journalType: JournalType }
  | { kind: "item"; itemId: string }
  | { kind: "section"; sectionId: string };

/** Mirror of the payload, readable during dragover (where dataTransfer is locked). */
let current: DragPayload | null = null;

export function startDrag(e: React.DragEvent, payload: DragPayload) {
  current = payload;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
  e.dataTransfer.setData("text/plain", JSON.stringify(payload));
}

export function endDrag() {
  current = null;
}

export function peekDrag(): DragPayload | null {
  return current;
}

export function readDrag(e: React.DragEvent): DragPayload | null {
  const raw = e.dataTransfer.getData(DND_MIME) || e.dataTransfer.getData("text/plain");
  if (!raw) return current;
  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return current;
  }
}

/** True when the pointer sits in the top half of the target element. */
export function isBefore(e: React.DragEvent, el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return e.clientY < rect.top + rect.height / 2;
}
