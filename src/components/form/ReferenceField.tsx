import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/common/Icon";
import { referenceService } from "@/services/referenceService";
import { RecordPreview } from "./RecordPreview";
import type { ReferenceValue } from "@/services/types";
import { cn } from "@/lib/utils";

interface Props {
  value: ReferenceValue | null;
  onChange: (value: ReferenceValue | null) => void;
  referenceTable: string;
  displayField?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  inputId?: string;
  describedBy?: string;
  onCommit?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

/**
 * Shared lookup control. Used by FormView fields, list inline editing and
 * anywhere else a reference must be picked. Stores { sys_id, display_value }.
 */
export function ReferenceField({
  value,
  onChange,
  referenceTable,
  displayField = "name",
  placeholder = "Search records...",
  disabled = false,
  invalid = false,
  autoFocus = false,
  inputId,
  describedBy,
  onCommit,
  onCancel,
  compact = false,
}: Props) {
  const generatedId = useId();
  const id = inputId ?? generatedId;
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 220);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["reference-search", referenceTable, debounced],
    queryFn: () => referenceService.search(referenceTable, debounced, displayField),
    enabled: open,
  });

  const select = (option: ReferenceValue) => {
    onChange(option);
    setOpen(false);
    setTerm("");
    onCommit?.();
  };

  const inputValue = open ? term : (value?.display_value ?? "");

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-1 rounded-[3px] border bg-background transition-colors",
          invalid ? "border-destructive" : "border-input focus-within:border-ring",
          disabled && "bg-muted",
          compact ? "h-7" : "h-9",
        )}
      >
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoFocus={autoFocus}
          disabled={disabled}
          value={inputValue}
          placeholder={placeholder}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const option = results[highlight];
              if (open && option) select(option);
              else onCommit?.();
            } else if (e.key === "Escape") {
              if (open) {
                setOpen(false);
                setTerm("");
              } else onCancel?.();
            }
          }}
          className="h-full w-full min-w-0 bg-transparent px-2.5 text-[13px] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        {value && !disabled && (
          <button
            type="button"
            aria-label="Clear reference"
            title="Clear"
            onClick={() => {
              onChange(null);
              setTerm("");
            }}
            className="grid size-6 shrink-0 place-items-center rounded-[3px] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon name="x" className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          aria-label={`Search ${referenceTable.replace(/_/g, " ")} records`}
          title="Search records"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="grid h-full w-8 shrink-0 place-items-center border-l border-input text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
        >
          <Icon name="search" className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Preview referenced record"
          title="Preview record"
          disabled={!value}
          onClick={() => setPreviewOpen(true)}
          className="grid h-full w-8 shrink-0 place-items-center rounded-r-[3px] border-l border-input text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="eye" className="size-3.5" />
        </button>
      </div>

      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-[4px] border border-border bg-popover py-1 shadow-md"
        >
          {isFetching && (
            <li className="flex items-center gap-2 px-3 py-2 text-[13px] text-muted-foreground">
              <Icon name="loader-circle" className="size-3.5 animate-spin" /> Searching...
            </li>
          )}
          {!isFetching && results.length === 0 && (
            <li className="px-3 py-2 text-[13px] text-muted-foreground">No matching records.</li>
          )}
          {!isFetching &&
            results.map((option, i) => (
              <li key={option.sys_id} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => select(option)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px]",
                    i === highlight ? "bg-accent text-accent-foreground" : "text-foreground",
                  )}
                >
                  <Icon name="circle-dot" className="size-3 text-muted-foreground" />
                  <span className="truncate">{option.display_value}</span>
                </button>
              </li>
            ))}
        </ul>
      )}

      {value && (
        <RecordPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          tableName={referenceTable}
          recordId={value.sys_id}
          displayField={displayField}
        />
      )}
    </div>
  );
}
