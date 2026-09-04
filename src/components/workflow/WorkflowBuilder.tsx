import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { ActionButton } from "@/components/common/ActionButton";
import { useWorkflowEditor } from "@/hooks/useWorkflowEditor";
import { validateWorkflow, type WorkflowIssue } from "@/lib/workflow-validate";
import {
  buildComponentIndex,
  cloneNode,
  defaultConfiguration,
  newId,
  outputsFor,
} from "@/lib/workflow-model";
import { WorkflowPalette } from "./WorkflowPalette";
import { WorkflowToolbar } from "./WorkflowToolbar";
import { ValidationPanel } from "./ValidationPanel";
import { NodeConfigDrawer } from "./NodeConfigDrawer";
import { WorkflowNodeCard, WorkflowUIContext, type WFNode } from "./WorkflowNodeCard";
import type { WorkflowComponentMeta, WorkflowDefinition, WorkflowNode } from "@/services/types";

const nodeTypes = { workflow: WorkflowNodeCard };
const GRID = 16;

export function WorkflowBuilder({ workflowId }: { workflowId: string }) {
  return (
    <ReactFlowProvider>
      <Editor workflowId={workflowId} />
    </ReactFlowProvider>
  );
}

interface Menu {
  nodeId: string;
  x: number;
  y: number;
}

function Editor({ workflowId }: { workflowId: string }) {
  const navigate = useNavigate();
  const editor = useWorkflowEditor({ workflowId });
  const { definition, catalog, update } = editor;
  const flow = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);
  const clipboard = useRef<WorkflowNode[]>([]);

  const [selection, setSelection] = useState<{ nodes: string[]; edges: string[] }>({ nodes: [], edges: [] });
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [snap, setSnap] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [issues, setIssues] = useState<WorkflowIssue[] | null>(null);

  const index = useMemo(() => buildComponentIndex(catalog), [catalog]);
  const invalidNodes = useMemo(
    () => new Set((issues ?? []).map((i) => i.nodeId).filter(Boolean) as string[]),
    [issues],
  );

  const nodes = useMemo<WFNode[]>(
    () =>
      (definition?.nodes ?? []).map((node) => ({
        id: node.sys_id,
        type: "workflow" as const,
        position: node.position,
        data: { node },
        selected: selection.nodes.includes(node.sys_id),
        deletable: node.type !== "start",
      })),
    [definition, selection.nodes],
  );

  const edges = useMemo<Edge[]>(
    () =>
      (definition?.connections ?? []).map((c) => ({
        id: c.sys_id,
        source: c.source,
        sourceHandle: c.source_handle,
        target: c.target,
        targetHandle: c.target_handle,
        type: "smoothstep",
        selected: selection.edges.includes(c.sys_id),
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { strokeWidth: selection.edges.includes(c.sys_id) ? 2.5 : 1.5 },
      })),
    [definition, selection.edges],
  );

  // ------------------------------------------------------------- graph edits

  const addComponent = useCallback(
    (component: WorkflowComponentMeta, position?: { x: number; y: number }) => {
      update((def) => {
        const node: WorkflowNode = {
          sys_id: newId("node"),
          type: component.type,
          subtype: component.subtype,
          label: component.label,
          position: position ?? { x: 320, y: 120 + def.nodes.length * 20 },
          configuration: defaultConfiguration(component, def.table),
        };
        return { ...def, nodes: [...def.nodes, node] };
      });
    },
    [update],
  );

  const deleteNodes = useCallback(
    (ids: string[]) => {
      const removable = ids.filter((id) => definition?.nodes.find((n) => n.sys_id === id)?.type !== "start");
      if (!removable.length) return;
      update((def) => ({
        ...def,
        nodes: def.nodes.filter((n) => !removable.includes(n.sys_id)),
        connections: def.connections.filter(
          (c) => !removable.includes(c.source) && !removable.includes(c.target),
        ),
      }));
      setSelection((s) => ({ ...s, nodes: [] }));
    },
    [definition, update],
  );

  const deleteEdges = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      update((def) => ({ ...def, connections: def.connections.filter((c) => !ids.includes(c.sys_id)) }));
      setSelection((s) => ({ ...s, edges: [] }));
    },
    [update],
  );

  const duplicateNodes = useCallback(
    (ids: string[]) => {
      update((def) => ({
        ...def,
        nodes: [
          ...def.nodes,
          ...def.nodes.filter((n) => ids.includes(n.sys_id) && n.type !== "start").map((n) => cloneNode(n)),
        ],
      }));
    },
    [update],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<WFNode>[]) => {
      const moves = changes.filter((c) => c.type === "position" && c.position);
      if (moves.length) {
        const dragging = moves.some((c) => c.type === "position" && c.dragging);
        update(
          (def) => ({
            ...def,
            nodes: def.nodes.map((n) => {
              const move = moves.find((m) => m.type === "position" && m.id === n.sys_id);
              return move && move.type === "position" && move.position ? { ...n, position: move.position } : n;
            }),
          }),
          { history: !dragging },
        );
      }
      const removed = changes.filter((c) => c.type === "remove").map((c) => c.id);
      if (removed.length) deleteNodes(removed);
    },
    [update, deleteNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removed = changes.filter((c) => c.type === "remove").map((c) => c.id);
      if (removed.length) deleteEdges(removed);
    },
    [deleteEdges],
  );

  const isValidConnection = useCallback(
    (c: Connection | Edge) => {
      if (!definition || !c.source || !c.target) return false;
      if (c.source === c.target) return false;
      const source = definition.nodes.find((n) => n.sys_id === c.source);
      const target = definition.nodes.find((n) => n.sys_id === c.target);
      if (!source || !target) return false;
      if (target.type === "start") return false;
      if (source.type === "end" || source.subtype === "stop") return false;
      if (source.type === "start" && target.type !== "trigger") return false;
      const duplicate = definition.connections.some(
        (x) => x.source === c.source && x.source_handle === (c.sourceHandle ?? "default") && x.target === c.target,
      );
      if (duplicate) return false;
      // one connection per output handle, except from multi-branch nodes to different targets
      return true;
    },
    [definition],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) return;
      update((def) => ({
        ...def,
        connections: [
          ...def.connections,
          {
            sys_id: newId("conn"),
            source: connection.source,
            source_handle: connection.sourceHandle ?? "default",
            target: connection.target,
            target_handle: connection.targetHandle ?? "input",
          },
        ],
      }));
    },
    [isValidConnection, update],
  );

  // ------------------------------------------------------------- interaction

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelection({ nodes: params.nodes.map((n) => n.id), edges: params.edges.map((e) => e.id) });
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const subtype = event.dataTransfer.getData("application/infraease-workflow-node");
      const component = index.get(subtype);
      if (!component) return;
      const position = flow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addComponent(component, {
        x: Math.round(position.x / GRID) * GRID,
        y: Math.round(position.y / GRID) * GRID,
      });
    },
    [addComponent, flow, index],
  );

  const runValidation = useCallback(
    (def?: WorkflowDefinition) => {
      const target = def ?? definition;
      if (!target) return [];
      const found = validateWorkflow(target, index);
      setIssues(found);
      return found;
    },
    [definition, index],
  );

  async function handleSave() {
    const found = runValidation();
    if (found.length) return;
    await editor.save();
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? editor.redo() : editor.undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        editor.redo();
      } else if (mod && e.key.toLowerCase() === "c") {
        clipboard.current = (definition?.nodes ?? []).filter((n) => selection.nodes.includes(n.sys_id));
      } else if (mod && e.key.toLowerCase() === "v") {
        if (clipboard.current.length)
          update((def) => ({ ...def, nodes: [...def.nodes, ...clipboard.current.map((n) => cloneNode(n, 60))] }));
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateNodes(selection.nodes);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selection.nodes.length || selection.edges.length) {
          e.preventDefault();
          deleteNodes(selection.nodes);
          deleteEdges(selection.edges);
        }
      } else if (e.key === "Escape") {
        setMenu(null);
        setSelection({ nodes: [], edges: [] });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [definition, selection, editor, update, duplicateNodes, deleteNodes, deleteEdges]);

  const ui = useMemo(
    () => ({
      catalog,
      index,
      invalidNodes,
      onConfigure: (nodeId: string) => setConfiguringId(nodeId),
      onNodeMenu: (nodeId: string, x: number, y: number) => setMenu({ nodeId, x, y }),
    }),
    [catalog, index, invalidNodes],
  );

  const configuring = definition?.nodes.find((n) => n.sys_id === configuringId) ?? null;
  const menuNode = definition?.nodes.find((n) => n.sys_id === menu?.nodeId) ?? null;

  if (editor.loading) {
    return <StateBlock icon="loader-circle" spin title="Loading workflow…" />;
  }
  if (editor.loadError || !definition) {
    return <StateBlock icon="triangle-alert" title={editor.loadError ?? "Workflow not found."} />;
  }

  return (
    <WorkflowUIContext.Provider value={ui}>
      <div className="flex h-[calc(100vh-96px)] min-h-0 flex-col border border-border bg-canvas">
        <header className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2">
          <Icon name="workflow" className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-foreground">
              Workflow: {definition.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {definition.nodes.length} nodes · {definition.connections.length} connections
              {definition.table ? ` · ${definition.table}` : ""}
            </p>
          </div>
          <label className="ml-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <input
              type="checkbox"
              checked={definition.active}
              onChange={(e) => update((def) => ({ ...def, active: e.target.checked }))}
            />
            Active
          </label>
          <div className="ml-auto flex items-center gap-2">
            <ActionButton icon="x" onClick={() => navigate({ to: "/workflow" })}>
              Cancel
            </ActionButton>
            <ActionButton icon="save" variant="primary" loading={editor.saving} onClick={handleSave}>
              Save
            </ActionButton>
          </div>
        </header>

        {editor.saveError && (
          <p className="border-b border-destructive/40 bg-destructive/10 px-3 py-1.5 text-[12px] text-destructive">
            {editor.saveError}
          </p>
        )}

        <div className="flex min-h-0 flex-1">
          <WorkflowPalette
            catalog={catalog}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
            onAdd={(component) => {
              const box = wrapper.current?.getBoundingClientRect();
              const center = box
                ? flow.screenToFlowPosition({ x: box.x + box.width / 2, y: box.y + box.height / 2 })
                : undefined;
              addComponent(component, center);
            }}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <WorkflowToolbar
              zoom={zoom}
              canUndo={editor.canUndo}
              canRedo={editor.canRedo}
              minimap={minimap}
              snap={snap}
              issueCount={issues?.length ?? 0}
              dirty={editor.dirty}
              saving={editor.saving}
              savedAt={editor.savedAt}
              onUndo={editor.undo}
              onRedo={editor.redo}
              onZoomIn={() => flow.zoomIn()}
              onZoomOut={() => flow.zoomOut()}
              onFit={() => flow.fitView({ padding: 0.2 })}
              onToggleMinimap={() => setMinimap((m) => !m)}
              onToggleSnap={() => setSnap((s) => !s)}
              onValidate={() => runValidation()}
            />

            <div ref={wrapper} className="min-h-0 flex-1" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
              <ReactFlow<WFNode>
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
                onSelectionChange={onSelectionChange}
                onNodeDoubleClick={(_, n) => setConfiguringId(n.id)}
                onPaneClick={() => setMenu(null)}
                onMove={(_, viewport) => setZoom(viewport.zoom)}
                snapToGrid={snap}
                snapGrid={[GRID, GRID]}
                connectionRadius={28}
                minZoom={0.2}
                maxZoom={2}
                fitView
                deleteKeyCode={null}
                multiSelectionKeyCode={["Shift", "Meta", "Control"]}
                proOptions={{ hideAttribution: true }}
              >
                <Background variant={BackgroundVariant.Dots} gap={GRID} size={1} />
                <Controls showInteractive={false} />
                {minimap && <MiniMap pannable zoomable nodeColor="#94a3b8" className="!bg-surface" />}
              </ReactFlow>
            </div>

            {issues !== null && (
              <ValidationPanel
                issues={issues}
                onClose={() => setIssues(null)}
                onSelect={(nodeId) => {
                  setSelection({ nodes: [nodeId], edges: [] });
                  const node = definition.nodes.find((n) => n.sys_id === nodeId);
                  if (node) flow.setCenter(node.position.x + 120, node.position.y + 40, { zoom: 1, duration: 300 });
                }}
              />
            )}
          </div>
        </div>
      </div>

      {menu && menuNode && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
          <div
            className="fixed z-50 w-48 rounded-[3px] border border-border bg-surface py-1 shadow-lg"
            style={{ left: menu.x, top: menu.y }}
          >
            <MenuRow
              icon="settings-2"
              label="Configure"
              onClick={() => {
                setConfiguringId(menuNode.sys_id);
                setMenu(null);
              }}
            />
            <MenuRow
              icon="copy"
              label="Duplicate"
              onClick={() => {
                duplicateNodes([menuNode.sys_id]);
                setMenu(null);
              }}
            />
            <MenuRow
              icon="clipboard"
              label="Copy"
              onClick={() => {
                clipboard.current = [menuNode];
                setMenu(null);
              }}
            />
            <MenuRow
              icon={menuNode.disabled ? "play" : "pause"}
              label={menuNode.disabled ? "Enable" : "Disable"}
              onClick={() => {
                update((def) => ({
                  ...def,
                  nodes: def.nodes.map((n) =>
                    n.sys_id === menuNode.sys_id ? { ...n, disabled: !n.disabled } : n,
                  ),
                }));
                setMenu(null);
              }}
            />
            <MenuRow
              icon="git-branch"
              label={`Connections (${definition.connections.filter((c) => c.source === menuNode.sys_id || c.target === menuNode.sys_id).length})`}
              onClick={() => {
                setSelection({
                  nodes: [menuNode.sys_id],
                  edges: definition.connections
                    .filter((c) => c.source === menuNode.sys_id || c.target === menuNode.sys_id)
                    .map((c) => c.sys_id),
                });
                setMenu(null);
              }}
            />
            {menuNode.type !== "start" && (
              <MenuRow
                icon="trash-2"
                label="Delete"
                destructive
                onClick={() => {
                  deleteNodes([menuNode.sys_id]);
                  setMenu(null);
                }}
              />
            )}
          </div>
        </>
      )}

      {configuring && (
        <NodeConfigDrawer
          node={configuring}
          meta={index.get(configuring.subtype)}
          catalog={catalog}
          workflows={editor.workflows}
          onClose={() => setConfiguringId(null)}
          onApply={(patch) =>
            update((def) => ({
              ...def,
              nodes: def.nodes.map((n) => {
                if (n.sys_id !== configuring.sys_id) return n;
                const next = { ...n, ...patch } as WorkflowNode;
                // drop connections whose handle disappeared after a config change
                return next;
              }),
              connections: def.connections.filter((c) => {
                if (c.source !== configuring.sys_id) return true;
                const node = { ...configuring, ...patch } as WorkflowNode;
                return outputsFor(node, index.get(node.subtype)).some((o) => o.id === c.source_handle);
              }),
            }))
          }
        />
      )}
    </WorkflowUIContext.Provider>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12.5px] hover:bg-muted",
        destructive ? "text-destructive" : "text-foreground",
      )}
    >
      <Icon name={icon} className="size-3.5" />
      {label}
    </button>
  );
}

function StateBlock({
  icon,
  title,
  spin,
}: {
  icon: string;
  title: string;
  spin?: boolean;
}) {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-[4px] border border-border bg-surface">
      <Icon name={icon} className={cn("size-5 text-muted-foreground", spin && "animate-spin")} />
      <p className="text-[13px] text-muted-foreground">{title}</p>
    </div>
  );
}
