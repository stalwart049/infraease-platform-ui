import { useState, type DragEvent } from "react";
import { Icon } from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import type { ComponentDefinition, UiNode } from "../../models/ui";
import { ComponentRenderer } from "../../runtime/ComponentRenderer";
import { isHidden, selfStyle, VIEWPORT_WIDTH } from "../../runtime/layout";
import type { UiBuilderState } from "../../state/useUiBuilder";

export const DRAG_NEW = "application/infraease-ui-component";
export const DRAG_MOVE = "application/infraease-ui-node";

interface DropHint {
  parentId: string;
  index: number;
}

export function BuilderCanvas({ builder }: { builder: UiBuilderState }) {
  const [hint, setHint] = useState<DropHint | null>(null);
  const { page, breakpoint, zoom, previewMode } = builder;
  if (!page) return null;

  const width = VIEWPORT_WIDTH[breakpoint];

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-canvas p-5" onClick={() => builder.setSelectedId(null)}>
      <div
        className="origin-top"
        style={{ width, transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
      >
        <div
          className={cn(
            "min-h-[70vh] bg-background",
            !previewMode && "rounded-[4px] border border-border shadow-sm",
          )}
        >
          <NodeView
            node={page.root}
            parent={null}
            builder={builder}
            hint={hint}
            setHint={setHint}
            depth={0}
          />
        </div>
      </div>
    </div>
  );
}

function NodeView({
  node,
  parent,
  builder,
  hint,
  setHint,
  depth,
}: {
  node: UiNode;
  parent: UiNode | null;
  builder: UiBuilderState;
  hint: DropHint | null;
  setHint: (hint: DropHint | null) => void;
  depth: number;
}) {
  const definition: ComponentDefinition | undefined = builder.definitions[node.type];
  const isRoot = node.type === "page";
  const selected = builder.selectedId === node.id;
  const editing = !builder.previewMode;
  const container = isRoot || definition?.container === true;

  if (isHidden(node, builder.breakpoint) && !editing) return null;

  const dropAt = (index: number) => ({ parentId: node.id, index });

  const onDropInto = (event: DragEvent, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setHint(null);
    const raw = event.dataTransfer.getData(DRAG_NEW);
    if (raw) {
      const def = builder.definitions[raw];
      if (def) builder.addComponent(def, dropAt(index));
      return;
    }
    const nodeId = event.dataTransfer.getData(DRAG_MOVE);
    if (nodeId) builder.moveNode(nodeId, dropAt(index));
  };

  const slot = (index: number) => (
    <div
      key={`slot-${index}`}
      onDragOver={(e) => {
        if (!editing) return;
        e.preventDefault();
        e.stopPropagation();
        setHint(dropAt(index));
      }}
      onDrop={(e) => onDropInto(e, index)}
      className={cn(
        "transition-all",
        hint && hint.parentId === node.id && hint.index === index
          ? "my-1 h-7 rounded-[3px] border border-dashed border-primary bg-primary/5"
          : "h-1.5",
      )}
      aria-hidden="true"
    />
  );

  const children: React.ReactNode = container
    ? [
        ...(editing ? [slot(0)] : []),
        ...node.children.flatMap((child, i) => [
          <NodeView
            key={child.id}
            node={child}
            parent={node}
            builder={builder}
            hint={hint}
            setHint={setHint}
            depth={depth + 1}
          />,
          ...(editing ? [slot(i + 1)] : []),
        ]),
      ]
    : null;

  const body = (
    <ComponentRenderer
      node={node}
      definition={definition}
      breakpoint={builder.breakpoint}
      editing={editing}
    >
      {children}
    </ComponentRenderer>
  );

  if (isRoot) {
    return (
      <div className="p-2" onDragLeave={() => setHint(null)}>
        {container && node.children.length === 0 && editing && (
          <p className="px-3 py-6 text-center text-[12.5px] text-muted-foreground">
            Drag a component from the library to start this page.
          </p>
        )}
        {body}
      </div>
    );
  }

  if (!editing) {
    return <div style={selfStyle(node, parent, builder.breakpoint)}>{body}</div>;
  }

  return (
    <div
      role="presentation"
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData(DRAG_MOVE, node.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={(e) => {
        e.stopPropagation();
        builder.setSelectedId(node.id);
      }}
      style={selfStyle(node, parent, builder.breakpoint)}
      className={cn(
        "group/node relative min-w-0 cursor-move rounded-[3px] outline-offset-1",
        selected ? "outline outline-2 outline-primary" : "hover:outline hover:outline-1 hover:outline-primary/40",
        isHidden(node, builder.breakpoint) && "opacity-40",
      )}
    >
      {(selected || false) && (
        <div className="absolute -top-[22px] left-0 z-20 flex items-center gap-0.5 rounded-t-[3px] bg-primary px-1 py-0.5 text-[10.5px] font-medium text-primary-foreground">
          <Icon name="move" className="size-3" />
          <span className="mr-1">{node.name ?? definition?.label ?? node.type}</span>
          <button
            type="button"
            title="Duplicate"
            aria-label="Duplicate component"
            onClick={(e) => {
              e.stopPropagation();
              builder.duplicateNode(node.id);
            }}
            className="grid size-4 place-items-center rounded-[2px] hover:bg-primary-foreground/20"
          >
            <Icon name="copy" className="size-3" />
          </button>
          <button
            type="button"
            title="Delete"
            aria-label="Delete component"
            onClick={(e) => {
              e.stopPropagation();
              builder.deleteNode(node.id);
            }}
            className="grid size-4 place-items-center rounded-[2px] hover:bg-primary-foreground/20"
          >
            <Icon name="trash-2" className="size-3" />
          </button>
        </div>
      )}
      <div
        onDragOver={(e) => {
          if (!container) return;
          e.preventDefault();
          e.stopPropagation();
          if (node.children.length === 0) setHint(dropAt(0));
        }}
        onDrop={(e) => {
          if (!container) return;
          onDropInto(e, node.children.length);
        }}
      >
        {body}
        {container && node.children.length === 0 && (
          <div
            className={cn(
              "m-1 grid h-12 place-items-center rounded-[3px] border border-dashed text-[11.5px]",
              hint && hint.parentId === node.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            Drop components into {node.name ?? definition?.label}
          </div>
        )}
      </div>
    </div>
  );
}
