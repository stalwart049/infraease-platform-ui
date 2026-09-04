import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ActionButton } from "@/components/common/ActionButton";
import { Icon } from "@/components/common/Icon";
import type { FieldMeta } from "@/services/types";
import { cn } from "@/lib/utils";

/** Group By selector. Groupable fields come from the list metadata. */
export function GroupBy({
  columns,
  value,
  onChange,
}: {
  columns: FieldMeta[];
  value: string | null;
  onChange: (field: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = columns.find((c) => c.name === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ActionButton icon="rows-3" aria-haspopup="menu" aria-expanded={open}>
          {active ? `Group: ${active.label}` : "Group By"}
          <Icon name="chevron-down" className="size-3 opacity-70" />
        </ActionButton>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-60 rounded-[4px] p-1">
        <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Group By
        </p>
        <Option label="None" selected={!value} onSelect={() => { onChange(null); setOpen(false); }} />
        {columns.map((col) => (
          <Option
            key={col.name}
            label={col.label}
            selected={value === col.name}
            onSelect={() => {
              onChange(col.name);
              setOpen(false);
            }}
          />
        ))}
        {columns.length === 0 && (
          <p className="px-2 py-4 text-center text-[13px] text-muted-foreground">
            No groupable fields for this table.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

function Option({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-[3px] px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-muted",
        selected && "bg-accent font-medium text-accent-foreground",
      )}
    >
      <span className="truncate">{label}</span>
      {selected && <Icon name="check" className="size-3.5" />}
    </button>
  );
}
