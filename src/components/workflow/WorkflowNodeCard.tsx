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
        compact ? "w-40" : "w-60",
        selected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50",
        invalid && "border-destructive ring-1 ring-destructive/40",
        node.disabled && "opacity-50",
      )}
    >
      {meta?.no_input !== true && node.type !== "start" && (
        <Handle
          type="target"
          id="input"
          position={Position.Left}
          className="!size-2.5 !border-2 !border-surface !bg-muted-foreground"
        />
      )}

      <div
        className={cn(
          "flex items-center gap-1.5 rounded-t-[5px] border-b bg-surface-sunken px-2.5 py-1",
          tone,
        )}
      >
        <Icon name={meta?.icon ?? "circle"} className="size-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em]">
          {node.type === "flow" ? "Flow" : node.type}
        </span>
        {node.disabled && (
          <span className="ml-auto rounded-[2px] border border-border px-1 text-[9px] uppercase text-muted-foreground">
            Off
          </span>
        )}
        {invalid && !node.disabled && (
          <Icon name="triangle-alert" className="ml-auto size-3.5 text-destructive" />
        )}
      </div>

      <div className="px-2.5 py-2">
        <p className="truncate text-[12.5px] font-semibold text-foreground">{node.label}</p>
        {!compact && lines.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {lines.map((l, i) => (
              <li key={i} className="truncate text-[11px] text-muted-foreground">
                {l}
              </li>
            ))}
          </ul>
        )}
        {!compact && lines.length === 0 && (
          <p className="mt-1 text-[11px] italic text-muted-foreground">Not configured</p>
        )}
      </div>

      {outputs.length > 0 && (
        <div className={cn(outputs.length > 1 && "border-t border-border px-2.5 py-1.5")}>
          {outputs.length === 1 ? (
            <Handle
              type="source"
              id={outputs[0]!.id}
              position={Position.Right}
              className="!size-2.5 !border-2 !border-surface !bg-primary"
            />
          ) : (
            outputs.map((out, i) => (
              <div key={out.id} className="relative flex h-5 items-center justify-end pr-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {out.label || out.id}
                </span>
                <Handle
                  type="source"
                  id={out.id}
                  position={Position.Right}
                  style={{ top: 10 + i * 20 }}
                  className="!size-2.5 !border-2 !border-surface !bg-primary"
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
