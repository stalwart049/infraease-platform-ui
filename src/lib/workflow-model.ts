import { START_COMPONENT } from "@/services/workflowStore";
import type {
  WorkflowCatalog,
  WorkflowComponentMeta,
  WorkflowConfiguration,
  WorkflowDefinition,
  WorkflowHandleMeta,
  WorkflowNode,
} from "@/services/types";

export function newId(prefix: string): string {
  const rand = Math.random().toString(16).slice(2, 10) + Date.now().toString(16).slice(-4);
  return `${prefix}_${rand}`;
}

export type ComponentIndex = Map<string, WorkflowComponentMeta>;

export function buildComponentIndex(catalog: WorkflowCatalog | null): ComponentIndex {
  const index: ComponentIndex = new Map();
  index.set(START_COMPONENT.subtype, START_COMPONENT as WorkflowComponentMeta);
  for (const category of catalog?.categories ?? []) {
    for (const component of category.components) index.set(component.subtype, component);
  }
  return index;
}

/** Output handles of a node, including handles derived from its configuration. */
export function outputsFor(node: WorkflowNode, meta?: WorkflowComponentMeta): WorkflowHandleMeta[] {
  if (!meta) return [{ id: "default", label: "" }];
  if (meta.dynamic_outputs === "cases") {
    const cases = node.configuration.cases ?? [];
    return [...cases.map((c) => ({ id: c.id, label: c.label || c.value || "Case" })), ...meta.outputs];
  }
  if (meta.dynamic_outputs === "branches") {
    const count = Math.max(2, node.configuration.branches ?? 2);
    return Array.from({ length: count }, (_, i) => ({ id: `branch_${i + 1}`, label: `Branch ${i + 1}` }));
  }
  return meta.outputs;
}

export function hasInput(meta?: WorkflowComponentMeta): boolean {
  return !meta?.no_input;
}

export function defaultConfiguration(meta: WorkflowComponentMeta, table?: string): WorkflowConfiguration {
  const config: WorkflowConfiguration = {};
  if (meta.required?.includes("table") || meta.type === "trigger") {
    if (table) config.table = table;
  }
  if (meta.required?.includes("conditions")) {
    config.logic = "AND";
    config.conditions = [{ id: newId("cond"), field: "", operator: "is", value: "" }];
  }
  if (meta.required?.includes("fields")) config.fields = [{ id: newId("fld"), field: "", value: "" }];
  if (meta.dynamic_outputs === "cases") config.cases = [{ id: newId("case"), label: "Case 1", value: "" }];
  if (meta.dynamic_outputs === "branches") config.branches = 2;
  if (meta.subtype === "join") config.join_mode = "all";
  if (meta.required?.includes("duration")) {
    config.duration = 1;
    config.unit = "hours";
  }
  if (meta.subtype === "rest_api") config.method = "POST";
  if (meta.subtype === "approval" || meta.subtype === "ask_approval") config.approval_type = "manager";
  if (meta.subtype === "run_script") {
    config.script =
      '(function run(current, workflow) {\n  // server-side script executed by the workflow engine\n})(current, workflow);';
  }
  return config;
}

/** Short lines shown on the node card once it is configured. */
export function summaryLines(node: WorkflowNode, catalog: WorkflowCatalog | null): string[] {
  const c = node.configuration;
  const lines: string[] = [];
  const tableLabel = (name?: string) =>
    catalog?.tables.find((t) => t.name === name)?.label ?? name ?? "";
  const opLabel = (op: string) => catalog?.operators.find((o) => o.value === op)?.label ?? op;

  if (c.table) lines.push(tableLabel(c.table));
  if (c.schedule) lines.push(catalog?.schedules.find((s) => s.value === c.schedule)?.label ?? c.schedule);
  if (c.event) lines.push(c.event);
  for (const row of c.conditions ?? []) {
    if (!row.field) continue;
    lines.push(`${row.field} ${opLabel(row.operator)} ${row.value}`.trim());
  }
  for (const row of c.fields ?? []) {
    if (!row.field) continue;
    lines.push(`${row.field} = ${row.value}`);
  }
  if (c.approver) lines.push(c.approver);
  if (c.recipient) lines.push(`To: ${c.recipient}`);
  if (c.subject) lines.push(c.subject);
  if (c.message) lines.push(c.message);
  if (c.endpoint) lines.push(`${c.method ?? "GET"} ${c.endpoint}`);
  if (c.duration) lines.push(`${c.duration} ${c.unit ?? "hours"}`);
  if (c.join_mode) lines.push(c.join_mode === "all" ? "Wait for all branches" : "Continue on first branch");
  if (c.branches) lines.push(`${c.branches} branches`);
  if (c.subflow) lines.push(c.subflow);
  return lines.slice(0, 3);
}

export const NODE_TONE: Record<string, string> = {
  start: "text-success border-success/40",
  trigger: "text-info border-info/40",
  condition: "text-warning border-warning/40",
  action: "text-primary border-primary/40",
  flow: "text-muted-foreground border-border",
  end: "text-destructive border-destructive/40",
};

export function cloneNode(node: WorkflowNode, offset = 40): WorkflowNode {
  return {
    ...structuredClone(node),
    sys_id: newId("node"),
    position: { x: node.position.x + offset, y: node.position.y + offset },
  };
}

export function emptyWorkflow(name: string, table?: string): WorkflowDefinition {
  return {
    sys_id: newId("workflow"),
    name,
    ...(table ? { table } : {}),
    active: false,
    nodes: [
      { sys_id: newId("node"), type: "start", subtype: "start", label: "Start", position: { x: 120, y: 220 }, configuration: {} },
      { sys_id: newId("node"), type: "end", subtype: "end", label: "End", position: { x: 640, y: 220 }, configuration: {} },
    ],
    connections: [],
  };
}
