import { Icon } from "@/components/common/Icon";
import { ActionButton } from "@/components/common/ActionButton";
import { GroupBy } from "./GroupBy";
import type { FieldMeta, FilterCondition } from "@/services/types";

export function FilterBar({
  value,
  onChange,
  selectedCount,
  onClearSelection,
  tableLabel,
  activeFilters,
  columns,
  onOpenFilters,
  onRemoveFilter,
  onOpenColumns,
  personalized,
  groupableColumns,
  groupBy,
  onGroupBy,
}: {
  value: string;
  onChange: (v: string) => void;
  selectedCount: number;
  onClearSelection: () => void;
  tableLabel: string;
  activeFilters: FilterCondition[];
  columns: FieldMeta[];
  onOpenFilters: () => void;
  onRemoveFilter: (id: string) => void;
  onOpenColumns: () => void;
  personalized: boolean;
  groupableColumns: FieldMeta[];
  groupBy: string | null;
  onGroupBy: (field: string | null) => void;
}) {
  const labelFor = (name: string) => columns.find((c) => c.name === name)?.label ?? name;

  return (
    <div className="border-b border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
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

        <ActionButton icon="filter" onClick={onOpenFilters}>
          Filter
          {activeFilters.length > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">
              {activeFilters.length}
            </span>
          )}
        </ActionButton>

        <GroupBy columns={groupableColumns} value={groupBy} onChange={onGroupBy} />

        <ActionButton icon="sliders-horizontal" onClick={onOpenColumns}>
          Columns{personalized ? " *" : ""}
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

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-1.5">
          {activeFilters.map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-surface-sunken px-1.5 py-0.5 text-[12px]"
            >
              <span className="font-medium">{labelFor(f.field)}</span>
              <span className="text-muted-foreground">{f.operator.replace(/_/g, " ")}</span>
              {f.value && <span>{f.value}</span>}
              <button
                type="button"
                aria-label={`Remove ${labelFor(f.field)} filter`}
                onClick={() => onRemoveFilter(f.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Icon name="x" className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
