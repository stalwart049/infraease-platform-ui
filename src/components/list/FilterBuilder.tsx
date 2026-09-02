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
import type { FieldMeta, FilterCondition, FilterOperator } from "@/services/types";

const OPERATORS: { value: FilterOperator; label: string; valueless?: boolean }[] = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "starts_with", label: "starts with" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
  { value: "is_empty", label: "is empty", valueless: true },
  { value: "is_not_empty", label: "is not empty", valueless: true },
];

const control =
  "h-8 rounded-[3px] border border-input bg-background px-2 text-[13px] text-foreground outline-none focus:border-ring";

const newCondition = (field: string): FilterCondition => ({
  id: `c${Math.random().toString(36).slice(2, 9)}`,
  field,
  operator: "contains",
  value: "",
});

/** Condition builder — all conditions are AND-ed and evaluated server-side. */
export function FilterBuilder({
  open,
  columns,
  value,
  onApply,
  onClose,
}: {
  open: boolean;
  columns: FieldMeta[];
  value: FilterCondition[];
  onApply: (conditions: FilterCondition[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<FilterCondition[]>(value);

  useEffect(() => {
    if (open) setDraft(value.length ? value : [newCondition(columns[0]?.name ?? "")]);
  }, [open, value, columns]);

  function update(id: string, patch: Partial<FilterCondition>) {
    setDraft((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl rounded-[4px]">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Filter conditions</DialogTitle>
          <DialogDescription className="text-[13px]">
            All conditions must match. Filtering runs on the server against the full table.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {draft.map((condition, index) => {
            const field = columns.find((c) => c.name === condition.field);
            const op = OPERATORS.find((o) => o.value === condition.operator);
            return (
              <div key={condition.id} className="flex flex-wrap items-center gap-2">
                <span className="w-10 text-[11px] font-semibold uppercase text-muted-foreground">
                  {index === 0 ? "Where" : "And"}
                </span>
                <select
                  aria-label="Filter field"
                  className={control}
                  value={condition.field}
                  onChange={(e) => update(condition.id, { field: e.target.value, value: "" })}
                >
                  {columns.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter operator"
                  className={control}
                  value={condition.operator}
                  onChange={(e) =>
                    update(condition.id, { operator: e.target.value as FilterOperator })
                  }
                >
                  {OPERATORS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {!op?.valueless &&
                  (field?.type === "select" && field.choices ? (
                    <select
                      aria-label="Filter value"
                      className={`${control} min-w-[10rem] flex-1`}
                      value={condition.value}
                      onChange={(e) => update(condition.id, { value: e.target.value })}
                    >
                      <option value="">Select a value...</option>
                      {field.choices.map((c) => (
                        <option key={c.value} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      aria-label="Filter value"
                      className={`${control} min-w-[10rem] flex-1`}
                      value={condition.value}
                      placeholder="Value"
                      onChange={(e) => update(condition.id, { value: e.target.value })}
                    />
                  ))}
                <button
                  type="button"
                  aria-label="Remove condition"
                  onClick={() => setDraft((prev) => prev.filter((c) => c.id !== condition.id))}
                  className="grid size-7 place-items-center rounded-[3px] text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  <Icon name="trash-2" className="size-3.5" />
                </button>
              </div>
            );
          })}
          {draft.length === 0 && (
            <p className="text-[13px] text-muted-foreground">No conditions. All records are shown.</p>
          )}
          <ActionButton
            icon="plus"
            onClick={() => setDraft((prev) => [...prev, newCondition(columns[0]?.name ?? "")])}
          >
            Add condition
          </ActionButton>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <ActionButton
            icon="x"
            onClick={() => {
              setDraft([]);
              onApply([]);
            }}
          >
            Clear all
          </ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton icon="check" variant="primary" onClick={() => onApply(draft)}>
            Run filter
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
