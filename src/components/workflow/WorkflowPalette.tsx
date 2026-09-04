import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import type { WorkflowCatalog, WorkflowComponentMeta } from "@/services/types";

interface Props {
  catalog: WorkflowCatalog | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onAdd: (component: WorkflowComponentMeta) => void;
}

export function WorkflowPalette({ catalog, collapsed, onToggleCollapsed, onAdd }: Props) {
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (catalog?.categories ?? [])
      .map((c) => ({
        ...c,
        components: q
          ? c.components.filter(
              (k) => k.label.toLowerCase().includes(q) || k.description.toLowerCase().includes(q),
            )
          : c.components,
      }))
      .filter((c) => c.components.length > 0);
  }, [catalog, query]);

  if (collapsed) {
    return (
      <aside className="flex w-10 shrink-0 flex-col items-center border-r border-border bg-surface py-2">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Expand component palette"
          className="rounded-[3px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Icon name="panel-left-open" className="size-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <p className="flex-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Components
        </p>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Collapse component palette"
          className="rounded-[3px] p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Icon name="panel-left-close" className="size-4" />
        </button>
      </div>

      <div className="border-b border-border p-2">
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components..."
            aria-label="Search components"
            className="h-8 w-full rounded-[3px] border border-border bg-surface pl-7 pr-2 text-[12.5px] outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {categories.map((category) => (
          <div key={category.id} className="mb-3">
            <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {category.label}
            </p>
            <div className="space-y-1">
              {category.components.map((component) => (
                <PaletteItem key={component.subtype} component={component} onAdd={onAdd} />
              ))}
            </div>
          </div>
        ))}
        {!categories.length && (
          <p className="px-1 py-4 text-[12px] text-muted-foreground">No components match “{query}”.</p>
        )}
      </div>

      <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
        Drag onto the canvas, or click to add.
      </p>
    </aside>
  );
}

function PaletteItem({
  component,
  onAdd,
}: {
  component: WorkflowComponentMeta;
  onAdd: (c: WorkflowComponentMeta) => void;
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/infraease-workflow-node", component.subtype);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onAdd(component)}
      title={component.description}
      className={cn(
        "flex w-full cursor-grab items-start gap-2 rounded-[3px] border border-border bg-surface px-2 py-1.5 text-left",
        "hover:border-primary/50 hover:bg-muted active:cursor-grabbing",
      )}
    >
      <Icon name="grip-vertical" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <Icon name={component.icon} className="size-3.5 text-muted-foreground" />
          <span className="truncate text-[12.5px] font-medium text-foreground">{component.label}</span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
          {component.description}
        </span>
      </span>
    </button>
  );
}
