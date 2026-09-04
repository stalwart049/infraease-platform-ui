import { outputsFor, type ComponentIndex } from "./workflow-model";
import type { WorkflowDefinition } from "@/services/types";

export interface WorkflowIssue {
  id: string;
  message: string;
  nodeId?: string;
  connectionId?: string;
}

/** Node subtypes that make a loop legitimate (they pause execution). */
const LOOP_SAFE = new Set(["wait", "timer", "delay", "wait_until"]);

const CONFIG_LABEL: Record<string, string> = {
  table: "Table",
  event: "Event",
  schedule: "Schedule",
  conditions: "Conditions",
  fields: "Fields",
  approver: "Approver",
  recipient: "Recipient",
  subject: "Subject",
  message: "Message",
  script: "Script",
  endpoint: "Endpoint",
  duration: "Duration",
  subflow: "Subflow",
  branches: "Branches",
  join_mode: "Join behaviour",
  field: "Field",
};

export function validateWorkflow(def: WorkflowDefinition, index: ComponentIndex): WorkflowIssue[] {
  const issues: WorkflowIssue[] = [];
  const push = (message: string, nodeId?: string, connectionId?: string) =>
    issues.push({
      id: `${nodeId ?? connectionId ?? "wf"}:${issues.length}`,
      message,
      ...(nodeId ? { nodeId } : {}),
      ...(connectionId ? { connectionId } : {}),
    });

  const byId = new Map(def.nodes.map((n) => [n.sys_id, n]));
  const starts = def.nodes.filter((n) => n.type === "start");
  const ends = def.nodes.filter((n) => n.type === "end");

  if (!def.name.trim()) push("The workflow needs a name.");
  if (starts.length === 0) push("The workflow has no Start node.");
  if (starts.length > 1) starts.slice(1).forEach((n) => push("Only one Start node is allowed.", n.sys_id));
  if (ends.length === 0) push("The workflow has no End node.");

  const outgoing = new Map<string, number>();
  const incoming = new Map<string, number>();

  for (const c of def.connections) {
    const source = byId.get(c.source);
    const target = byId.get(c.target);
    if (!source || !target) {
      push("A connection points at a node that no longer exists.", undefined, c.sys_id);
      continue;
    }
    if (source.sys_id === target.sys_id) push("A node cannot connect to itself.", source.sys_id, c.sys_id);
    if (target.type === "start") push("Nothing may connect into Start.", target.sys_id, c.sys_id);
    if (source.type === "end" || source.subtype === "stop")
      push(`${source.label} cannot have an outgoing connection.`, source.sys_id, c.sys_id);
    if (source.type === "start" && target.type !== "trigger")
      push("Start must connect to a trigger node.", target.sys_id, c.sys_id);
    outgoing.set(c.source, (outgoing.get(c.source) ?? 0) + 1);
    incoming.set(c.target, (incoming.get(c.target) ?? 0) + 1);
  }

  // duplicate connections on the same handle pair
  const seen = new Set<string>();
  for (const c of def.connections) {
    const key = `${c.source}|${c.source_handle}|${c.target}`;
    if (seen.has(key)) push("Duplicate connection between the same handles.", c.source, c.sys_id);
    seen.add(key);
  }

  for (const node of def.nodes) {
    const meta = index.get(node.subtype);
    if (!meta) {
      push(`Unknown node type "${node.subtype}".`, node.sys_id);
      continue;
    }
    if (node.disabled) continue;

    if (node.type !== "start" && !incoming.get(node.sys_id))
      push(`"${node.label}" has no incoming connection.`, node.sys_id);

    const outs = outputsFor(node, meta);
    if (outs.length === 1 && !outgoing.get(node.sys_id))
      push(`"${node.label}" is not connected to a next step.`, node.sys_id);
    if (outs.length > 1) {
      const used = new Set(
        def.connections.filter((c) => c.source === node.sys_id).map((c) => c.source_handle),
      );
      for (const out of outs) {
        if (!used.has(out.id))
          push(`"${node.label}" branch "${out.label || out.id}" is not connected.`, node.sys_id);
      }
    }

    for (const key of meta.required ?? []) {
      const value = (node.configuration as Record<string, unknown>)[key];
      const missing =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (missing) push(`"${node.label}" is missing ${CONFIG_LABEL[key] ?? key}.`, node.sys_id);
    }

    for (const row of node.configuration.conditions ?? []) {
      const needsValue = row.operator !== "is_empty" && row.operator !== "is_not_empty";
      if (!row.field) push(`"${node.label}" has a condition without a field.`, node.sys_id);
      else if (needsValue && !String(row.value).trim())
        push(`"${node.label}" condition on ${row.field} has no value.`, node.sys_id);
    }
    for (const row of node.configuration.fields ?? []) {
      if (!row.field) push(`"${node.label}" has a field assignment without a field.`, node.sys_id);
    }
    if (meta.multi_input && (incoming.get(node.sys_id) ?? 0) < 2 && node.subtype === "join")
      push(`"${node.label}" needs at least two incoming branches.`, node.sys_id);
  }

  for (const nodeId of findIllegalCycle(def, byId)) {
    push("This node is part of a loop that its type does not allow.", nodeId);
  }

  return issues;
}

/** DFS looking for a cycle that contains no waiting node. */
function findIllegalCycle(
  def: WorkflowDefinition,
  byId: Map<string, WorkflowDefinition["nodes"][number]>,
): string[] {
  const adjacency = new Map<string, string[]>();
  for (const c of def.connections) {
    adjacency.set(c.source, [...(adjacency.get(c.source) ?? []), c.target]);
  }
  const state = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];
  const flagged = new Set<string>();

  const visit = (id: string) => {
    state.set(id, 1);
    stack.push(id);
    for (const next of adjacency.get(id) ?? []) {
      const s = state.get(next) ?? 0;
      if (s === 1) {
        const cycle = stack.slice(stack.indexOf(next));
        const pauses = cycle.some((n) => LOOP_SAFE.has(byId.get(n)?.subtype ?? ""));
        if (!pauses) cycle.forEach((n) => flagged.add(n));
      } else if (s === 0) visit(next);
    }
    stack.pop();
    state.set(id, 2);
  };

  for (const node of def.nodes) if (!state.get(node.sys_id)) visit(node.sys_id);
  return [...flagged];
}
