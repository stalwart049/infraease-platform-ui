import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { startDrag, endDrag } from "@/lib/builder-dnd";
import type { FormViewFieldRef, JournalComponentMeta } from "@/services/types";

type Tab = "fields" | "journal";

export function FieldPalette({
  tableLabel,
  tableName,
  fields,
  journals,
}: {
  tableLabel: string;
  tableName: string;
  fields: FormViewFieldRef[];
  journals: JournalComponentMeta[];
}) {
  const [tab, setTab] = useState<Tab>("fields");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visibleFields = q ? fields.filter((f) => f.display_value.toLowerCase().includes(q) || f.name.includes(q)) : fields;
  const visibleJournals = q ? journals.filter((j) => j.label.toLowerCase().includes(q)) : journals;

  return (
    <div className="flex h-full min-h-0 flex-col border border-border bg-surface sm:rounded-[4px]">
      <div className="border-b border-border px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Table</p>
        <p className="text-[14px] font-semibold text-foreground">{tableLabel}</p>
        <p className="text-[11px] text-muted-foreground">{tableName}</p>
      </div>

      <div role="tablist" aria-label="Palette" className="flex border-b border-border">
        {(
          [
            ["fields", "Available Fields"],
            ["journal", "Journal Entries"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 border-b-2 px-3 py-2 text-[12px] font-medium transition-colors",
              tab === id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="border-b border-border p-2">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "fields" ? "Search fields..." : "Search components..."}
            aria-label="Search palette"
            className="h-8 w-full rounded-[3px] border border-border bg-canvas pl-7 pr-2 text-[13px] outline-none focus-visible:border-primary"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {tab === "fields" ? (
          visibleFields.length ? (
            <ul className="divide-y divide-border overflow-hidden rounded-[3px] border border-border">
              {visibleFields.map((f) => (
                <li key={f.sys_id}>
                  <div
                    draggable
                    onDragStart={(e) => startDrag(e, { kind: "field", name: f.name })}
                    onDragEnd={endDrag}
                    title={f.name}
                    className="cursor-grab bg-surface px-3 py-2 text-[13px] text-foreground hover:bg-muted active:cursor-grabbing"
                  >
                    {f.display_value}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-6 text-center text-[12px] text-muted-foreground">
              {q ? "No fields match your search." : "Every field is already on this form view."}
            </p>
          )
        ) : visibleJournals.length ? (
          <ul className="space-y-1.5">
            {visibleJournals.map((j) => (
              <li key={j.journalType}>
                <div
                  draggable
                  onDragStart={(e) => startDrag(e, { kind: "journal", journalType: j.journalType })}
                  onDragEnd={endDrag}
                  className="cursor-grab rounded-[3px] border border-dashed border-border bg-surface-sunken px-3 py-2 hover:border-primary/50 active:cursor-grabbing"
                >
                  <p className="text-[13px] font-medium text-foreground">{j.label}</p>
                  <p className="text-[11px] text-muted-foreground">{j.description}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 py-6 text-center text-[12px] text-muted-foreground">
            {q ? "No components match your search." : "All journal components are on this form view."}
          </p>
        )}
      </div>
    </div>
  );
}
