import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import type { ComponentCategory } from "../../models/ui";
import { DRAG_NEW } from "../canvas/BuilderCanvas";

export function ComponentLibrary({ categories }: { categories: ComponentCategory[] }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => ({ ...c, components: c.components.filter((x) => x.label.toLowerCase().includes(q) || x.type.includes(q)) }))
      .filter((c) => c.components.length > 0);
  }, [categories, query]);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border p-2">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components"
            aria-label="Search components"
            className="h-7 w-full rounded-[3px] border border-input bg-background pl-7 pr-2 text-[12.5px] outline-none focus:border-ring"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filtered.map((category) => {
          const open = !collapsed[category.id];
          return (
            <div key={category.id} className="mb-2">
              <button
                type="button"
                onClick={() => setCollapsed((c) => ({ ...c, [category.id]: open }))}
                aria-expanded={open}
                className="flex w-full items-center gap-1 px-1 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
              >
                <Icon name={open ? "chevron-down" : "chevron-right"} className="size-3.5" />
                {category.label}
                <span className="ml-auto text-[10.5px] font-normal">{category.components.length}</span>
              </button>

              {open && (
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {category.components.map((definition) => (
                    <div
                      key={definition.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DRAG_NEW, definition.type);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      title={definition.description ?? definition.label}
                      className={cn(
                        "flex cursor-grab select-none flex-col items-center gap-1 rounded-[3px] border border-border bg-background px-1.5 py-2 text-center",
                        "transition-colors hover:border-primary/50 hover:bg-muted active:cursor-grabbing",
                      )}
                    >
                      <Icon name={definition.icon} className="size-4 text-muted-foreground" />
                      <span className="line-clamp-2 text-[11px] leading-tight text-foreground">{definition.label}</span>
                    </div>
                  ))}
                  {category.components.length === 0 && (
                    <p className="col-span-2 px-1 py-2 text-[11.5px] text-muted-foreground">No components.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="px-1 py-3 text-[12px] text-muted-foreground">No matching components.</p>}
      </div>

      <div className="border-t border-border p-2">
        <Link
          to="/widget-builder/$widgetId"
          params={{ widgetId: "new" }}
          className="flex h-7 items-center justify-center gap-1.5 rounded-[3px] border border-border bg-background text-[12px] font-medium text-foreground hover:bg-muted"
        >
          <Icon name="plus" className="size-3.5" />
          New widget
        </Link>
      </div>
    </aside>
  );
}
