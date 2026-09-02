import { useEffect, useState } from "react";
import { Icon } from "@/components/common/Icon";
import { ActionButton } from "@/components/common/ActionButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FieldMeta } from "@/services/types";

/** Personalize which columns appear in the list, and in what order. */
export function ColumnPicker({
  open,
  allColumns,
  selected,
  onApply,
  onReset,
  onClose,
}: {
  open: boolean;
  allColumns: FieldMeta[];
  selected: string[];
  onApply: (names: string[]) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [chosen, setChosen] = useState<string[]>(selected);

  useEffect(() => {
    if (open) setChosen(selected);
  }, [open, selected]);

  function toggle(name: string) {
    setChosen((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  function move(name: string, delta: number) {
    setChosen((prev) => {
      const i = prev.indexOf(name);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(i, 1) as [string];
      next.splice(j, 0, item);
      return next;
    });
  }

  const available = allColumns.filter((c) => !chosen.includes(c.name));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl rounded-[4px]">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Personalize columns</DialogTitle>
          <DialogDescription className="text-[13px]">
            Choose the columns to display and set their order. Saved for this table on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Selected ({chosen.length})
            </h3>
            <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {chosen.map((name, i) => {
                const col = allColumns.find((c) => c.name === name);
                if (!col) return null;
                return (
                  <li
                    key={name}
                    className="flex items-center gap-1 rounded-[3px] border border-border bg-surface-sunken px-2 py-1 text-[13px]"
                  >
                    <span className="min-w-0 flex-1 truncate">{col.label}</span>
                    <button
                      type="button"
                      aria-label={`Move ${col.label} up`}
                      disabled={i === 0}
                      onClick={() => move(name, -1)}
                      className="grid size-6 place-items-center rounded-[3px] text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <Icon name="arrow-up" className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${col.label} down`}
                      disabled={i === chosen.length - 1}
                      onClick={() => move(name, 1)}
                      className="grid size-6 place-items-center rounded-[3px] text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <Icon name="arrow-down" className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${col.label}`}
                      onClick={() => toggle(name)}
                      className="grid size-6 place-items-center rounded-[3px] text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      <Icon name="x" className="size-3.5" />
                    </button>
                  </li>
                );
              })}
              {chosen.length === 0 && (
                <li className="text-[13px] text-muted-foreground">Select at least one column.</li>
              )}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Available
            </h3>
            <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {available.map((col) => (
                <li key={col.name}>
                  <button
                    type="button"
                    onClick={() => toggle(col.name)}
                    className="flex w-full items-center gap-2 rounded-[3px] px-2 py-1 text-left text-[13px] hover:bg-muted"
                  >
                    <Icon name="plus" className="size-3.5 text-muted-foreground" />
                    <span className="truncate">{col.label}</span>
                  </button>
                </li>
              ))}
              {available.length === 0 && (
                <li className="text-[13px] text-muted-foreground">All columns are selected.</li>
              )}
            </ul>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <ActionButton icon="rotate-ccw" onClick={onReset}>
            Reset to default
          </ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton
            icon="check"
            variant="primary"
            disabled={chosen.length === 0}
            onClick={() => onApply(chosen)}
          >
            Apply
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
