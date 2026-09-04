import { createContext, useContext } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { NODE_TONE, outputsFor, summaryLines, type ComponentIndex } from "@/lib/workflow-model";
import type { WorkflowCatalog, WorkflowNode } from "@/services/types";

export interface WorkflowUI {
  catalog: WorkflowCatalog | null;
  index: ComponentIndex;
  invalidNodes: Set<string>;
  onConfigure: (nodeId: string) => void;
  onNodeMenu: (nodeId: string, x: number, y: number) => void;
}

export const WorkflowUIContext = createContext<WorkflowUI | null>(null);

export type WFNodeData = { node: WorkflowNode };
export type WFNode = Node<WFNodeData, "workflow">;

/** Target handles exist on all four sides, three slots each, so incoming edges
 *  can approach from the most natural direction without stacking on one point. */
export const TARGET_SIDES = ["left", "top", "right", "bottom"] as const;
export type TargetSide = (typeof TARGET_SIDES)[number];
export const TARGET_SLOTS = [0, 1, 2] as const;
export const targetHandleId = (side: TargetSide, slot: number) => `in-${side}-${slot}`;

const SIDE_POSITION: Record<TargetSide, Position> = {
  left: Position.Left,
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
};

const SLOT_OFFSET = ["32%", "50%", "68%"];

function TargetHandles() {
  return (
    <>
      {TARGET_SIDES.map((side) =>
        TARGET_SLOTS.map((slot) => {
          const primary = side === "left" && slot === 1;
          const offset = SLOT_OFFSET[slot]!;
          const style =
            side === "left" || side === "right" ? { top: offset } : { left: offset };
          return (
            <Handle
              key={targetHandleId(side, slot)}
              type="target"
              id={targetHandleId(side, slot)}
              position={SIDE_POSITION[side]}
              style={style}
              className={cn(
                "!size-3 !border-2 !border-surface",
                primary ? "!bg-muted-foreground" : "!bg-muted-foreground/0 !border-transparent",
              )}
            />
          );
        }),
      )}
    </>
  );
}

export function WorkflowNodeCard({ data, selected }: NodeProps<WFNode>) {
  const ui = useContext(WorkflowUIContext);
  const node = data.node;
  const meta = ui?.index.get(node.subtype);
  const outputs = outputsFor(node, meta);
  const lines = summaryLines(node, ui?.catalog ?? null);
  const invalid = ui?.invalidNodes.has(node.sys_id) ?? false;
  const tone = NODE_TONE[node.type] ?? NODE_TONE["flow"]!;
  const compact = node.type === "start" || node.type === "end";

  return (
    <div
      onDoubleClick={() => ui?.onConfigure(node.sys_id)}
      onContextMenu={(e) => {
        e.preventDefault();
        ui?.onNodeMenu(node.sys_id, e.clientX, e.clientY);
      }}
      className={cn(
        "group relative cursor-grab rounded-[6px] border bg-surface shadow-sm transition-colors active:cursor-grabbing",
        compact ? "w-44" : "w-64",
        selected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50",
        invalid && "border-destructive ring-1 ring-destructive/40",
        node.disabled && "opacity-50",
      )}
    >
      {meta?.no_input !== true && node.type !== "start" && <TargetHandles />}

      <div
        className={cn(
          "flex items-center gap-2 rounded-t-[5px] border-b bg-surface-sunken px-3 py-1.5",
          tone,
        )}
      >
        <Icon name={meta?.icon ?? "circle"} className="size-4" />
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em]">
          {node.type === "flow" ? "Flow" : node.type}
        </span>
        {node.disabled && (
          <span className="ml-auto rounded-[2px] border border-border px-1.5 text-[11px] uppercase text-muted-foreground">
            Off
          </span>
        )}
        {invalid && !node.disabled && (
          <Icon name="triangle-alert" className="ml-auto size-4 text-destructive" />
        )}
      </div>

      <div className="px-3 py-2.5">
        <p className="truncate text-[15px] font-semibold leading-tight text-foreground">{node.label}</p>
        {!compact && lines.length > 0 && (
          <ul className="mt-1.5 space-y-1">
            {lines.map((l, i) => (
              <li key={i} className="truncate text-[13px] leading-snug text-muted-foreground">
                {l}
              </li>
            ))}
          </ul>
        )}
        {!compact && lines.length === 0 && (
          <p className="mt-1.5 text-[13px] italic text-muted-foreground">Not configured</p>
        )}
      </div>

      {outputs.length > 0 && (
        <div className={cn(outputs.length > 1 && "border-t border-border px-3 py-2")}>
          {outputs.length === 1 ? (
            <Handle
              type="source"
              id={outputs[0]!.id}
              position={Position.Right}
              className="!size-3 !border-2 !border-surface !bg-primary"
            />
          ) : (
            outputs.map((out, i) => (
              <div key={out.id} className="relative flex h-6 items-center justify-end pr-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground/70">
                  {out.label || out.id}
                </span>
                <Handle
                  type="source"
                  id={out.id}
                  position={Position.Right}
                  style={{ top: 12 + i * 24 }}
                  className="!size-3 !border-2 !border-surface !bg-primary"
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
