import { useState } from "react";
import { Icon } from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import type { UiNode } from "../../models/ui";
import type { UiBuilderState } from "../../state/useUiBuilder";
import { DRAG_MOVE } from "../canvas/BuilderCanvas";

export function LayersPanel({ builder }: { builder: UiBuilderState }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  if (!builder.page) return null;

  return (
    <div className="flex min-h-0 flex-col border-t border-border">
      <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Layers
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        <LayerRow
          node={builder.page.root}
          depth={0}
          builder={builder}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>
    </div>
  );
}

function LayerRow({
  node,
  depth,
  builder,
  collapsed,
  setCollapsed,
}: {
  node: UiNode;
  depth: number;
  builder: UiBuilderState;
  collapsed: Record<string, boolean>;
  setCollapsed: (fn: (c: Record<string, boolean>) => Record<string, boolean>) => void;
}) {
  const definition = builder.definitions[node.type];
  const hasChildren = node.children.length > 0;
  const open = !collapsed[node.id];
  const selected = builder.selectedId === node.id;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 pr-1 text-[12px]",
          selected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
        )}
        style={{ paddingLeft: 4 + depth * 12 }}
        draggable={depth > 0}
        onDragStart={(e) => {
          e.dataTransfer.setData(DRAG_MOVE, node.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const dragged = e.dataTransfer.getData(DRAG_MOVE);
          if (dragged && dragged !== node.id) builder.moveNode(dragged, { parentId: node.id, index: node.children.length });
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => setCollapsed((c) => ({ ...c, [node.id]: open }))}
            className="grid size-4 shrink-0 place-items-center text-muted-foreground"
          >
            <Icon name={open ? "chevron-down" : "chevron-right"} className="size-3" />
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => builder.setSelectedId(node.id)}
          className="flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left"
        >
          <Icon name={definition?.icon ?? (node.type === "page" ? "file" : "box")} className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{node.name ?? definition?.label ?? node.type}</span>
        </button>
        {depth > 0 && (
          <button
            type="button"
            aria-label={`Delete ${node.name ?? node.type}`}
            onClick={() => builder.deleteNode(node.id)}
            className="hidden shrink-0 text-muted-foreground hover:text-destructive group-hover:block"
          >
            <Icon name="trash-2" className="size-3" />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <div>
          {node.children.map((child) => (
            <LayerRow key={child.id} node={child} depth={depth + 1} builder={builder} collapsed={collapsed} setCollapsed={setCollapsed} />
          ))}
        </div>
      )}
    </div>
  );
}
