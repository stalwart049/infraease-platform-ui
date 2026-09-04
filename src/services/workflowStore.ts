// Mock persistence + metadata for the Workflow Builder. Swap the functions in
// workflowService.ts for real HTTP calls and nothing in the UI changes.
import { getDefinition } from "./mockDb";
import type {
  WorkflowCatalog,
  WorkflowComponentCategory,
  WorkflowDefinition,
  WorkflowSummary,
} from "./types";

const TABLE_NAMES = [
  "incident",
  "request",
  "problem",
  "change",
  "asset",
  "sys_user",
  "department",
  "business_rule",
];

const CATEGORIES: WorkflowComponentCategory[] = [
  {
    id: "triggers",
    label: "Triggers",
    components: [
      {
        subtype: "record_created",
        type: "trigger",
        label: "Record Created",
        description: "Runs when a record is inserted",
        icon: "file-plus",
        outputs: [{ id: "default", label: "" }],
        no_input: false,
        required: ["table"],
      },
      {
        subtype: "record_updated",
        type: "trigger",
        label: "Record Updated",
        description: "Runs when a record is updated",
        icon: "file-pen",
        outputs: [{ id: "default", label: "" }],
        required: ["table"],
      },
      {
        subtype: "record_deleted",
        type: "trigger",
        label: "Record Deleted",
        description: "Runs when a record is deleted",
        icon: "file-x",
        outputs: [{ id: "default", label: "" }],
        required: ["table"],
      },
      {
        subtype: "record_created_or_updated",
        type: "trigger",
        label: "Record Created or Updated",
        description: "Runs on insert or update",
        icon: "files",
        outputs: [{ id: "default", label: "" }],
        required: ["table"],
      },
      {
        subtype: "scheduled",
        type: "trigger",
        label: "Scheduled",
        description: "Runs on a schedule",
        icon: "calendar-clock",
        outputs: [{ id: "default", label: "" }],
        required: ["schedule"],
      },
      {
        subtype: "event",
        type: "trigger",
        label: "Event Trigger",
        description: "Runs when a platform event fires",
        icon: "zap",
        outputs: [{ id: "default", label: "" }],
        required: ["event"],
      },
      {
        subtype: "manual",
        type: "trigger",
        label: "Manual Trigger",
        description: "Started by a user",
        icon: "hand",
        outputs: [{ id: "default", label: "" }],
        required: [],
      },
    ],
  },
  {
    id: "conditions",
    label: "Conditions",
    components: [
      {
        subtype: "if",
        type: "condition",
        label: "If",
        description: "Branch on a condition",
        icon: "git-branch",
        outputs: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
        ],
        required: ["conditions"],
      },
      {
        subtype: "else_if",
        type: "condition",
        label: "Else If",
        description: "Additional branch test",
        icon: "git-branch",
        outputs: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
        ],
        required: ["conditions"],
      },
      {
        subtype: "else",
        type: "condition",
        label: "Else",
        description: "Fallback branch",
        icon: "corner-down-right",
        outputs: [{ id: "default", label: "" }],
        required: [],
      },
      {
        subtype: "switch",
        type: "condition",
        label: "Switch",
        description: "Many outcomes from one field",
        icon: "list-tree",
        outputs: [{ id: "default", label: "Default" }],
        dynamic_outputs: "cases",
        required: ["field"],
      },
      {
        subtype: "wait_until",
        type: "condition",
        label: "Wait Until",
        description: "Pause until a condition is met",
        icon: "hourglass",
        outputs: [
          { id: "yes", label: "Met" },
          { id: "no", label: "Timeout" },
        ],
        required: ["conditions"],
      },
      {
        subtype: "check_record",
        type: "condition",
        label: "Check Record Condition",
        description: "Evaluate another record",
        icon: "search-check",
        outputs: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
        ],
        required: ["table", "conditions"],
      },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    components: [
      {
        subtype: "create_record",
        type: "action",
        label: "Create Record",
        description: "Insert a new record",
        icon: "plus-square",
        outputs: [{ id: "default", label: "" }],
        required: ["table", "fields"],
      },
      {
        subtype: "update_record",
        type: "action",
        label: "Update Record",
        description: "Set fields on a record",
        icon: "pencil",
        outputs: [{ id: "default", label: "" }],
        required: ["table", "fields"],
      },
      {
        subtype: "update_related_record",
        type: "action",
        label: "Update Related Record",
        description: "Set fields on a related record",
        icon: "link",
        outputs: [{ id: "default", label: "" }],
        required: ["table", "fields"],
      },
      {
        subtype: "delete_record",
        type: "action",
        label: "Delete Record",
        description: "Remove a record",
        icon: "trash-2",
        outputs: [{ id: "default", label: "" }],
        required: ["table"],
      },
      {
        subtype: "create_task",
        type: "action",
        label: "Create Task",
        description: "Generate a task record",
        icon: "clipboard-list",
        outputs: [{ id: "default", label: "" }],
        required: ["table"],
      },
      {
        subtype: "send_email",
        type: "action",
        label: "Send Email",
        description: "Send an email message",
        icon: "mail",
        outputs: [{ id: "default", label: "" }],
        required: ["recipient", "subject"],
      },
      {
        subtype: "send_notification",
        type: "action",
        label: "Send Notification",
        description: "Notify a user or group",
        icon: "bell",
        outputs: [{ id: "default", label: "" }],
        required: ["recipient", "message"],
      },
      {
        subtype: "trigger_event",
        type: "action",
        label: "Trigger Event",
        description: "Fire a platform event",
        icon: "zap",
        outputs: [{ id: "default", label: "" }],
        required: ["event"],
      },
      {
        subtype: "approval",
        type: "action",
        label: "Approval",
        description: "Route for approval",
        icon: "badge-check",
        outputs: [
          { id: "approved", label: "Approved" },
          { id: "rejected", label: "Rejected" },
        ],
        required: ["approver"],
      },
      {
        subtype: "ask_approval",
        type: "action",
        label: "Ask for Approval",
        description: "Request an ad-hoc approval",
        icon: "user-check",
        outputs: [
          { id: "approved", label: "Approved" },
          { id: "rejected", label: "Rejected" },
        ],
        required: ["approver"],
      },
      {
        subtype: "run_script",
        type: "action",
        label: "Run Script",
        description: "Execute server-side script",
        icon: "file-code",
        outputs: [{ id: "default", label: "" }],
        required: ["script"],
      },
      {
        subtype: "rest_api",
        type: "action",
        label: "Call REST API",
        description: "Outbound HTTP request",
        icon: "globe",
        outputs: [{ id: "default", label: "" }],
        required: ["endpoint"],
      },
      {
        subtype: "log_message",
        type: "action",
        label: "Log Message",
        description: "Write to the workflow log",
        icon: "scroll-text",
        outputs: [{ id: "default", label: "" }],
        required: ["message"],
      },
    ],
  },
  {
    id: "flow",
    label: "Flow Control",
    components: [
      {
        subtype: "wait",
        type: "flow",
        label: "Wait",
        description: "Pause the workflow",
        icon: "pause",
        outputs: [{ id: "default", label: "" }],
        required: ["duration"],
      },
      {
        subtype: "timer",
        type: "flow",
        label: "Timer",
        description: "Wait for a duration",
        icon: "timer",
        outputs: [{ id: "default", label: "" }],
        required: ["duration"],
      },
      {
        subtype: "delay",
        type: "flow",
        label: "Delay",
        description: "Short delay before continuing",
        icon: "clock",
        outputs: [{ id: "default", label: "" }],
        required: ["duration"],
      },
      {
        subtype: "parallel",
        type: "flow",
        label: "Parallel",
        description: "Run branches at the same time",
        icon: "split",
        outputs: [],
        dynamic_outputs: "branches",
        required: ["branches"],
      },
      {
        subtype: "join",
        type: "flow",
        label: "Join",
        description: "Merge parallel branches",
        icon: "merge",
        outputs: [{ id: "default", label: "" }],
        multi_input: true,
        required: ["join_mode"],
      },
      {
        subtype: "subflow",
        type: "flow",
        label: "Subflow",
        description: "Execute another workflow",
        icon: "workflow",
        outputs: [{ id: "default", label: "" }],
        required: ["subflow"],
      },
      {
        subtype: "stop",
        type: "flow",
        label: "Stop",
        description: "Terminate this branch",
        icon: "octagon-x",
        outputs: [],
        required: [],
      },
      {
        subtype: "end",
        type: "end",
        label: "End",
        description: "Workflow completed",
        icon: "circle-check",
        outputs: [],
        multi_input: true,
        required: [],
      },
    ],
  },
];

/** Start is created with every workflow and is not offered in the palette. */
export const START_COMPONENT = {
  subtype: "start",
  type: "start" as const,
  label: "Start",
  description: "Workflow entry point",
  icon: "play",
  outputs: [{ id: "default", label: "" }],
  no_input: true,
  required: [] as string[],
};

export function getCatalog(): WorkflowCatalog {
  return {
    categories: CATEGORIES,
    tables: TABLE_NAMES.map((name) => ({ name, label: getDefinition(name).table.label })),
    operators: [
      { value: "is", label: "is" },
      { value: "is_not", label: "is not" },
      { value: "contains", label: "contains" },
      { value: "not_contains", label: "does not contain" },
      { value: "starts_with", label: "starts with" },
      { value: "greater_than", label: "greater than" },
      { value: "less_than", label: "less than" },
      { value: "is_empty", label: "is empty" },
      { value: "is_not_empty", label: "is not empty" },
    ],
    schedules: [
      { value: "every_hour", label: "Every hour" },
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ],
    events: [
      { value: "incident.escalated", label: "incident.escalated" },
      { value: "incident.resolved", label: "incident.resolved" },
      { value: "request.approved", label: "request.approved" },
      { value: "asset.retired", label: "asset.retired" },
    ],
  };
}

// ------------------------------------------------------------------- store

function seedWorkflows(): WorkflowDefinition[] {
  return [
    {
      sys_id: "wf_incident_automation",
      name: "Incident Automation",
      description: "Escalates critical incidents through approval before resolution.",
      table: "incident",
      active: true,
      nodes: [
        {
          sys_id: "node_start",
          type: "start",
          subtype: "start",
          label: "Start",
          position: { x: 80, y: 260 },
          configuration: {},
        },
        {
          sys_id: "node_trigger",
          type: "trigger",
          subtype: "record_created",
          label: "Incident Created",
          position: { x: 300, y: 250 },
          configuration: { table: "incident" },
        },
        {
          sys_id: "node_if",
          type: "condition",
          subtype: "if",
          label: "Priority is Critical",
          position: { x: 580, y: 240 },
          configuration: {
            logic: "AND",
            conditions: [{ id: "c1", field: "priority", operator: "is", value: "1 - Critical" }],
          },
        },
        {
          sys_id: "node_approval",
          type: "action",
          subtype: "approval",
          label: "Manager Approval",
          position: { x: 880, y: 120 },
          configuration: { approval_type: "manager", approver: "Reporting manager" },
        },
        {
          sys_id: "node_update",
          type: "action",
          subtype: "update_record",
          label: "Resolve Incident",
          position: { x: 1200, y: 100 },
          configuration: {
            table: "incident",
            record: "current",
            fields: [
              { id: "f1", field: "state", value: "Resolved" },
              { id: "f2", field: "priority", value: "3 - Moderate" },
            ],
          },
        },
        {
          sys_id: "node_notify",
          type: "action",
          subtype: "send_notification",
          label: "Notify Requester",
          position: { x: 1200, y: 300 },
          configuration: { recipient: "Caller", message: "Escalation was rejected." },
        },
        {
          sys_id: "node_update_low",
          type: "action",
          subtype: "update_record",
          label: "Assign to Service Desk",
          position: { x: 880, y: 460 },
          configuration: {
            table: "incident",
            record: "current",
            fields: [{ id: "f1", field: "state", value: "Active" }],
          },
        },
        {
          sys_id: "node_end",
          type: "end",
          subtype: "end",
          label: "End",
          position: { x: 1520, y: 280 },
          configuration: {},
        },
      ],
      connections: [
        { sys_id: "cn1", source: "node_start", source_handle: "default", target: "node_trigger", target_handle: "input" },
        { sys_id: "cn2", source: "node_trigger", source_handle: "default", target: "node_if", target_handle: "input" },
        { sys_id: "cn3", source: "node_if", source_handle: "yes", target: "node_approval", target_handle: "input" },
        { sys_id: "cn4", source: "node_if", source_handle: "no", target: "node_update_low", target_handle: "input" },
        { sys_id: "cn5", source: "node_approval", source_handle: "approved", target: "node_update", target_handle: "input" },
        { sys_id: "cn6", source: "node_approval", source_handle: "rejected", target: "node_notify", target_handle: "input" },
        { sys_id: "cn7", source: "node_update", source_handle: "default", target: "node_end", target_handle: "input" },
        { sys_id: "cn8", source: "node_notify", source_handle: "default", target: "node_end", target_handle: "input" },
        { sys_id: "cn9", source: "node_update_low", source_handle: "default", target: "node_end", target_handle: "input" },
      ],
    },
    {
      sys_id: "wf_asset_retirement",
      name: "Asset Retirement",
      description: "Blank canvas ready for a new automation.",
      table: "asset",
      active: false,
      nodes: [
        {
          sys_id: "node_start",
          type: "start",
          subtype: "start",
          label: "Start",
          position: { x: 120, y: 220 },
          configuration: {},
        },
        {
          sys_id: "node_end",
          type: "end",
          subtype: "end",
          label: "End",
          position: { x: 620, y: 220 },
          configuration: {},
        },
      ],
      connections: [],
    },
  ];
}

let workflows: WorkflowDefinition[] | null = null;
const updatedAt: Record<string, string> = {};

function all(): WorkflowDefinition[] {
  if (!workflows) {
    workflows = seedWorkflows();
    for (const w of workflows) updatedAt[w.sys_id] = new Date(Date.UTC(2026, 7, 12, 9, 5)).toISOString();
  }
  return workflows;
}

export function listWorkflowSummaries(): WorkflowSummary[] {
  return all().map((w) => ({
    sys_id: w.sys_id,
    name: w.name,
    ...(w.table ? { table: w.table } : {}),
    active: w.active,
    node_count: w.nodes.length,
    updated_at: updatedAt[w.sys_id] ?? new Date().toISOString(),
  }));
}

export function findWorkflow(id: string): WorkflowDefinition | undefined {
  const found = all().find((w) => w.sys_id === id);
  return found ? structuredClone(found) : undefined;
}

export function persistWorkflow(def: WorkflowDefinition): WorkflowDefinition {
  const rows = all();
  const idx = rows.findIndex((w) => w.sys_id === def.sys_id);
  const stored = structuredClone(def);
  if (idx >= 0) rows[idx] = stored;
  else rows.push(stored);
  updatedAt[def.sys_id] = new Date().toISOString();
  return structuredClone(stored);
}
