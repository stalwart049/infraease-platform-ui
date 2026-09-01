import { Icon } from "@/components/common/Icon";
import { ActionButton } from "@/components/common/ActionButton";
import { toast } from "sonner";

export function FilterBar({
  value,
  onChange,
  selectedCount,
  onClearSelection,
  tableLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  selectedCount: number;
  onClearSelection: () => void;
  tableLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2">
      <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-[3px] border border-input bg-background px-2 focus-within:border-ring sm:max-w-md">
        <Icon name="search" className="size-3.5 shrink-0 text-muted-foreground" />
        <label className="sr-only" htmlFor="list-search">
          Search {tableLabel} records
        </label>
        <input
          id="list-search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search records..."
          className="h-full w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
            className="grid size-5 place-items-center rounded-[3px] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon name="x" className="size-3.5" />
          </button>
        )}
      </div>

      <ActionButton icon="filter" onClick={() => toast.info("Condition builder arrives with the filter service.")}>
        Filter
      </ActionButton>

      {selectedCount > 0 && (
        <div className="ml-auto flex items-center gap-2 text-[12px] text-muted-foreground">
          <span aria-live="polite">{selectedCount} records selected</span>
          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-[3px] px-1.5 py-0.5 text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
