// -----------------------------------------------------------------------------
// Mock backend. This module fakes the InfraEase REST API in-memory.
// Swap the service implementations (src/services/*Service.ts) to hit the real
// backend later — the UI never imports this file directly.
// -----------------------------------------------------------------------------
import type {
  DataRecord,
  FieldMeta,
  FormMetadata,
  ListMetadata,
  MenuNode,
  ProfileInfo,
  ProfileMenuItem,
  SectionMeta,
  TableMeta,
  ActivityEntry,
  ActivityType,
  ActivityTypeMeta,
} from "./types";

interface TableDefinition {
  table: TableMeta;
  fields: FieldMeta[];
  sections: SectionMeta[];
  listColumns: string[];
  seedCount: number;
}

const FORM_ACTIONS = [
  { id: "save", label: "Save", icon: "save", variant: "primary" as const, in_header: true, in_menu: true },
  { id: "save_new", label: "Save & New", icon: "file-plus", in_header: true, in_menu: true },
  { id: "new", label: "New", icon: "plus", in_menu: true },
  { id: "refresh", label: "Refresh", icon: "refresh-cw", in_header: true, in_menu: true },
  { id: "cancel", label: "Cancel", icon: "x", in_header: true },
  {
    id: "delete",
    label: "Delete",
    icon: "trash-2",
    variant: "danger" as const,
    in_menu: true,
    confirm: "Delete this record? This action cannot be undone.",
  },
  { id: "configure", label: "Configure Form", icon: "settings-2", in_menu: true },
  { id: "personalize", label: "Personalize", icon: "sliders-horizontal", in_menu: true },
];

const LIST_ACTIONS = [
  { id: "new", label: "New", icon: "plus", variant: "primary" as const, in_header: true, in_menu: true },
  { id: "refresh", label: "Refresh", icon: "refresh-cw", in_header: true, in_menu: true },
  { id: "export", label: "Export", icon: "download", in_header: true, in_menu: true },
  { id: "import", label: "Import", icon: "upload", in_menu: true },
  { id: "configure", label: "Configure List", icon: "settings-2", in_menu: true },
  { id: "personalize", label: "Personalize", icon: "sliders-horizontal", in_menu: true },
];

const RELATED_LINKS = [
  { id: "activity", label: "Open Activity", icon: "activity" },
  { id: "attachments", label: "View Attachments", icon: "paperclip" },
  { id: "related", label: "View Related Records", icon: "git-branch" },
  { id: "history", label: "Show History", icon: "history" },
];

const choice = (...vals: string[]) => vals.map((v) => ({ value: v.toLowerCase().replace(/\s+/g, "_"), label: v }));

// ---------------------------------------------------------------- definitions

const definitions: Record<string, TableDefinition> = {
  incident: {
    table: {
      name: "incident",
      label: "Incident",
      plural_label: "Incidents",
      display_field: "number",
      id_field: "sys_id",
    },
    seedCount: 100,
    listColumns: ["number", "short_description", "caller", "priority", "state", "assigned_to", "opened_at"],
    sections: [
      {
        id: "details",
        label: "Details",
        fields: ["number", "short_description", "description", "caller", "category", "subcategory", "priority", "state"],
      },
      {
        id: "assignment",
        label: "Assignment",
        fields: ["assigned_to", "assignment_group", "department", "escalated"],
      },
      {
        id: "additional",
        label: "Additional Information",
        fields: ["email", "mobile", "location", "knowledge_url", "opened_at", "due_date"],
      },
      { id: "notes", label: "Notes", fields: ["work_notes", "close_notes"] },
    ],
    fields: [
      { name: "number", label: "Number", type: "text", readonly: true, width: 130 },
      {
        name: "short_description",
        label: "Short Description",
        type: "text",
        mandatory: true,
        min_length: 5,
        max_length: 120,
        width: 320,
      },
      { name: "description", label: "Description", type: "textarea", icon: "file-text" },
      {
        name: "caller",
        label: "Caller",
        type: "reference",
        reference_table: "sys_user",
        display_field: "name",
        mandatory: true,
        icon: "user",
      },
      { name: "category", label: "Category", type: "select", choices: choice("Hardware", "Software", "Network", "Database", "Access") },
      { name: "subcategory", label: "Subcategory", type: "select", choices: choice("Laptop", "Email", "VPN", "Storage", "Login") },
      { name: "priority", label: "Priority", type: "select", mandatory: true, choices: choice("Critical", "High", "Moderate", "Low"), width: 120 },
      { name: "state", label: "State", type: "select", choices: choice("New", "In Progress", "On Hold", "Resolved", "Closed"), width: 130 },
      { name: "assigned_to", label: "Assigned To", type: "reference", reference_table: "sys_user", display_field: "name", icon: "user" },
      {
        name: "assignment_group",
        label: "Assignment Group",
        type: "select",
        choices: choice("Service Desk", "Network Ops", "Database Team", "Field Support"),
      },
      { name: "department", label: "Department", type: "reference", reference_table: "department", display_field: "name", icon: "building" },
      { name: "escalated", label: "Escalated", type: "boolean" },
      { name: "email", label: "Email", type: "email", icon: "mail", pattern: "^[^@\\s]+@[^@\\s]+\\.[a-zA-Z]{2,}$", pattern_message: "Please enter a valid email address." },
      { name: "mobile", label: "Mobile", type: "phone", icon: "phone" },
      { name: "location", label: "Location", type: "text", icon: "map-pin" },
      { name: "knowledge_url", label: "Knowledge Article", type: "url", icon: "link" },
      { name: "opened_at", label: "Opened", type: "datetime", icon: "clock", readonly: true, width: 170 },
      { name: "due_date", label: "Due Date", type: "date", icon: "calendar" },
      { name: "work_notes", label: "Work Notes", type: "textarea" },
      { name: "close_notes", label: "Resolution Notes", type: "textarea" },
    ],
  },

  sys_user: {
    table: { name: "sys_user", label: "User", plural_label: "Users", display_field: "name", id_field: "sys_id" },
    seedCount: 48,
    listColumns: ["user_name", "name", "email", "mobile", "department", "active"],
    sections: [
      { id: "identity", label: "Identity", fields: ["user_name", "name", "title", "active"] },
      { id: "contact", label: "Contact", fields: ["email", "mobile", "location"] },
      { id: "org", label: "Organization", fields: ["department", "manager", "started_on"] },
    ],
    fields: [
      { name: "user_name", label: "User ID", type: "text", mandatory: true, width: 140 },
      { name: "name", label: "Full Name", type: "text", mandatory: true, icon: "user", width: 200 },
      { name: "title", label: "Job Title", type: "text" },
      { name: "active", label: "Active", type: "boolean", width: 90 },
      { name: "email", label: "Email", type: "email", icon: "mail", mandatory: true, width: 240 },
      { name: "mobile", label: "Mobile", type: "phone", icon: "phone", width: 160 },
      { name: "location", label: "Location", type: "text", icon: "map-pin" },
      { name: "department", label: "Department", type: "reference", reference_table: "department", display_field: "name", icon: "building", width: 180 },
      { name: "manager", label: "Manager", type: "reference", reference_table: "sys_user", display_field: "name", icon: "user" },
      { name: "started_on", label: "Start Date", type: "date", icon: "calendar" },
    ],
  },

  department: {
    table: { name: "department", label: "Department", plural_label: "Departments", display_field: "name", id_field: "sys_id" },
    seedCount: 12,
    listColumns: ["name", "code", "head", "cost_center", "active"],
    sections: [
      { id: "details", label: "Details", fields: ["name", "code", "description", "active"] },
      { id: "ownership", label: "Ownership", fields: ["head", "cost_center"] },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", mandatory: true, width: 220 },
      { name: "code", label: "Code", type: "text", max_length: 8, width: 110 },
      { name: "description", label: "Description", type: "textarea" },
      { name: "active", label: "Active", type: "boolean", width: 90 },
      { name: "head", label: "Department Head", type: "reference", reference_table: "sys_user", display_field: "name", icon: "user", width: 200 },
      { name: "cost_center", label: "Cost Center", type: "text", width: 140 },
    ],
  },

  request: {
    table: { name: "request", label: "Request", plural_label: "Requests", display_field: "number", id_field: "sys_id" },
    seedCount: 64,
    listColumns: ["number", "short_description", "requested_for", "stage", "priority", "due_date"],
    sections: [
      { id: "details", label: "Details", fields: ["number", "short_description", "description", "requested_for", "priority", "stage"] },
      { id: "fulfilment", label: "Fulfilment", fields: ["assigned_to", "due_date", "approved"] },
    ],
    fields: [
      { name: "number", label: "Number", type: "text", readonly: true, width: 130 },
      { name: "short_description", label: "Short Description", type: "text", mandatory: true, width: 320 },
      { name: "description", label: "Description", type: "textarea", icon: "file-text" },
      { name: "requested_for", label: "Requested For", type: "reference", reference_table: "sys_user", display_field: "name", icon: "user", mandatory: true },
      { name: "stage", label: "Stage", type: "select", choices: choice("Draft", "Awaiting Approval", "Fulfilment", "Delivered", "Closed"), width: 160 },
      { name: "priority", label: "Priority", type: "select", choices: choice("Critical", "High", "Moderate", "Low"), width: 120 },
      { name: "assigned_to", label: "Assigned To", type: "reference", reference_table: "sys_user", display_field: "name", icon: "user" },
      { name: "due_date", label: "Due Date", type: "date", icon: "calendar", width: 140 },
      { name: "approved", label: "Approved", type: "boolean" },
    ],
  },

  asset: {
    table: { name: "asset", label: "Asset", plural_label: "Assets", display_field: "asset_tag", id_field: "sys_id" },
    seedCount: 80,
    listColumns: ["asset_tag", "model", "asset_class", "status", "assigned_to", "purchased_on"],
    sections: [
      { id: "details", label: "Details", fields: ["asset_tag", "model", "serial_number", "asset_class", "status"] },
      { id: "assignment", label: "Assignment", fields: ["assigned_to", "department", "location"] },
      { id: "finance", label: "Finance", fields: ["cost", "purchased_on", "warranty_expires"] },
    ],
    fields: [
      { name: "asset_tag", label: "Asset Tag", type: "text", mandatory: true, width: 140 },
      { name: "model", label: "Model", type: "text", width: 220 },
      { name: "serial_number", label: "Serial Number", type: "text" },
      { name: "asset_class", label: "Class", type: "select", choices: choice("Hardware", "Software", "Contract", "Consumable"), width: 130 },
      { name: "status", label: "Status", type: "select", choices: choice("In Stock", "In Use", "In Repair", "Retired"), width: 130 },
      { name: "assigned_to", label: "Assigned To", type: "reference", reference_table: "sys_user", display_field: "name", icon: "user", width: 200 },
      { name: "department", label: "Department", type: "reference", reference_table: "department", display_field: "name", icon: "building" },
      { name: "location", label: "Location", type: "text", icon: "map-pin" },
      { name: "cost", label: "Cost (USD)", type: "number", min: 0 },
      { name: "purchased_on", label: "Purchased", type: "date", icon: "calendar", width: 140 },
      { name: "warranty_expires", label: "Warranty Expires", type: "date", icon: "calendar" },
    ],
  },
  business_rule: {
    table: {
      name: "business_rule",
      label: "Business Rule",
      plural_label: "Business Rules",
      display_field: "name",
      id_field: "sys_id",
    },
    seedCount: 12,
    listColumns: ["name", "table_name", "when", "order", "active", "updated_at"],
    sections: [
      { id: "details", label: "Details", fields: ["name", "table_name", "when", "order", "active"] },
      { id: "script", label: "Script", fields: ["description", "script"] },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", mandatory: true, max_length: 80, icon: "file-code", width: 280 },
      {
        name: "table_name",
        label: "Table",
        type: "select",
        mandatory: true,
        choices: choice("Incident", "Request", "Asset", "User", "Department"),
        width: 150,
      },
      {
        name: "when",
        label: "When",
        type: "select",
        choices: choice("Before", "After", "Async", "Display"),
        width: 120,
      },
      { name: "order", label: "Order", type: "number", min: 0, max: 10000, width: 100 },
      { name: "active", label: "Active", type: "boolean", width: 90 },
      { name: "description", label: "Description", type: "textarea", icon: "file-text" },
      {
        name: "script",
        label: "Script",
        type: "script",
        hint: "Server-side script. It runs on the platform, never in the browser.",
      },
      { name: "updated_at", label: "Updated", type: "datetime", readonly: true, icon: "clock", width: 170 },
    ],
  },
};

// Generic fallback so ANY table name renders something sensible.
function genericDefinition(name: string): TableDefinition {
  const label = name
    .split(/[_-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return {
    table: { name, label, plural_label: `${label}s`, display_field: "name", id_field: "sys_id" },
    seedCount: 24,
    listColumns: ["number", "name", "state", "owner", "updated_at"],
    sections: [
      { id: "details", label: "Details", fields: ["number", "name", "description", "state"] },
      { id: "ownership", label: "Ownership", fields: ["owner", "updated_at"] },
    ],
    fields: [
      { name: "number", label: "Number", type: "text", readonly: true, width: 130 },
      { name: "name", label: "Name", type: "text", mandatory: true, width: 260 },
      { name: "description", label: "Description", type: "textarea", icon: "file-text" },
      { name: "state", label: "State", type: "select", choices: choice("New", "Active", "Closed"), width: 130 },
      { name: "owner", label: "Owner", type: "reference", reference_table: "sys_user", display_field: "name", icon: "user", width: 200 },
      { name: "updated_at", label: "Updated", type: "datetime", readonly: true, icon: "clock", width: 170 },
    ],
  };
}

export function getDefinition(tableName: string): TableDefinition {
  return definitions[tableName] ?? genericDefinition(tableName);
}

// ---------------------------------------------------------------- seed data

const FIRST = ["John", "Priya", "Marcus", "Elena", "Tomas", "Aisha", "Daniel", "Mei", "Oliver", "Sofia", "Rahul", "Nora"];
const LAST = ["Smith", "Iyer", "Delgado", "Novak", "Bauer", "Khan", "Okafor", "Lin", "Hayes", "Moretti", "Verma", "Sundgren"];
const CITIES = ["Amsterdam", "Austin", "Bengaluru", "Berlin", "Dublin", "Singapore", "Toronto", "Zurich"];
const TITLES = ["Service Desk Analyst", "Network Engineer", "Database Administrator", "IT Manager", "Field Technician", "Product Owner"];
const SUMMARIES = [
  "Unable to sign in to the corporate VPN",
  "Outlook not syncing mailbox",
  "Laptop overheating after firmware update",
  "Shared drive permissions missing",
  "Printer on floor 3 offline",
  "Database latency on reporting cluster",
  "Password reset required for contractor",
  "New monitor request for workstation",
  "Wi-Fi drops in meeting rooms",
  "Access needed to finance dashboard",
];

// deterministic pseudo random so refreshes stay stable
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const pad = (n: number, size = 7) => String(n).padStart(size, "0");

const store: Record<string, DataRecord[]> = {};

function isoDate(base: number, offsetDays: number) {
  const d = new Date(base + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}
function isoDateTime(base: number, offsetHours: number) {
  const d = new Date(base + offsetHours * 3600000);
  return d.toISOString().slice(0, 16);
}

function buildUsers(): DataRecord[] {
  const r = rng(7);
  return Array.from({ length: definitions["sys_user"]!.seedCount }, (_, i) => {
    const first = FIRST[i % FIRST.length]!;
    const last = LAST[(i * 5) % LAST.length]!;
    const name = `${first} ${last}`;
    return {
      sys_id: `usr${pad(i + 1, 5)}`,
      user_name: `${first.toLowerCase()}.${last.toLowerCase()}`,
      name,
      title: TITLES[Math.floor(r() * TITLES.length)]!,
      active: i % 9 !== 0,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@infraease.io`,
      mobile: `+1 415 ${String(200 + i).slice(0, 3)} ${pad(1000 + i * 7, 4)}`,
      location: CITIES[i % CITIES.length]!,
      department: null as never,
      manager: null as never,
      started_on: isoDate(Date.UTC(2019, 0, 1), i * 23),
    } as DataRecord;
  });
}

function buildDepartments(): DataRecord[] {
  const names = [
    "Engineering", "IT Operations", "Finance", "Human Resources", "Customer Success",
    "Security", "Legal", "Marketing", "Sales", "Facilities", "Data Platform", "Procurement",
  ];
  return names.map((n, i) => ({
    sys_id: `dep${pad(i + 1, 5)}`,
    name: n,
    code: n.slice(0, 3).toUpperCase() + (i + 1),
    description: `${n} organisational unit at InfraEase.`,
    active: true,
    head: null as never,
    cost_center: `CC-${1000 + i * 5}`,
  })) as DataRecord[];
}

function ref(records: DataRecord[], idx: number, displayField: string) {
  const rec = records[idx % records.length]!;
  return { sys_id: rec.sys_id, display_value: String(rec[displayField] ?? rec.sys_id) };
}

function seed() {
  if (store["sys_user"]) return;
  const users = buildUsers();
  const departments = buildDepartments();
  store["sys_user"] = users;
  store["department"] = departments;

  users.forEach((u, i) => {
    u["department"] = ref(departments, i, "name");
    u["manager"] = ref(users, (i + 3) % users.length, "name");
  });
  departments.forEach((d, i) => {
    d["head"] = ref(users, i * 3, "name");
  });

  const base = Date.UTC(2026, 5, 1);
  const r = rng(42);
  const cat = definitions["incident"]!.fields.find((f) => f.name === "category")!.choices!;
  const sub = definitions["incident"]!.fields.find((f) => f.name === "subcategory")!.choices!;
  const pri = definitions["incident"]!.fields.find((f) => f.name === "priority")!.choices!;
  const st = definitions["incident"]!.fields.find((f) => f.name === "state")!.choices!;
  const groups = definitions["incident"]!.fields.find((f) => f.name === "assignment_group")!.choices!;

  store["incident"] = Array.from({ length: 100 }, (_, i) => {
    const caller = users[(i * 3) % users.length]!;
    return {
      sys_id: `inc${pad(i + 1, 5)}`,
      number: `INC${pad(10001 + i)}`,
      short_description: SUMMARIES[i % SUMMARIES.length]!,
      description: `${SUMMARIES[i % SUMMARIES.length]}. Reported by ${caller["name"]} from ${caller["location"]}. Impact assessed by the service desk during triage.`,
      caller: { sys_id: caller.sys_id, display_value: String(caller["name"]) },
      category: cat[i % cat.length]!.value,
      subcategory: sub[i % sub.length]!.value,
      priority: pri[Math.floor(r() * pri.length)]!.value,
      state: st[Math.floor(r() * st.length)]!.value,
      assigned_to: ref(users, i * 7 + 2, "name"),
      assignment_group: groups[i % groups.length]!.value,
      department: ref(departments, i, "name"),
      escalated: i % 11 === 0,
      email: String(caller["email"]),
      mobile: String(caller["mobile"]),
      location: String(caller["location"]),
      knowledge_url: `https://kb.infraease.io/articles/KB${pad(100 + i, 4)}`,
      opened_at: isoDateTime(base, -i * 5),
      due_date: isoDate(base, (i % 20) + 1),
      work_notes: "",
      close_notes: "",
    } as DataRecord;
  });

  const stage = definitions["request"]!.fields.find((f) => f.name === "stage")!.choices!;
  store["request"] = Array.from({ length: 64 }, (_, i) => ({
    sys_id: `req${pad(i + 1, 5)}`,
    number: `REQ${pad(20001 + i)}`,
    short_description: ["New laptop", "Software licence", "Access to repository", "Monitor replacement", "Mobile plan upgrade"][i % 5]!,
    description: "Standard catalogue request submitted through the InfraEase portal.",
    requested_for: ref(users, i * 2, "name"),
    stage: stage[i % stage.length]!.value,
    priority: pri[i % pri.length]!.value,
    assigned_to: ref(users, i * 5 + 1, "name"),
    due_date: isoDate(base, (i % 30) + 2),
    approved: i % 3 === 0,
  })) as DataRecord[];

  const cls = definitions["asset"]!.fields.find((f) => f.name === "asset_class")!.choices!;
  const status = definitions["asset"]!.fields.find((f) => f.name === "status")!.choices!;
  const models = ["ThinkBook 14 G6", "MacBook Pro 14", "Dell Latitude 7450", "HP EliteDesk 800", "Cisco Catalyst 9200"];
  store["asset"] = Array.from({ length: 80 }, (_, i) => ({
    sys_id: `ast${pad(i + 1, 5)}`,
    asset_tag: `AST${pad(30001 + i)}`,
    model: models[i % models.length]!,
    serial_number: `SN-${pad(48219 + i * 13, 8)}`,
    asset_class: cls[i % cls.length]!.value,
    status: status[i % status.length]!.value,
    assigned_to: ref(users, i * 3, "name"),
    department: ref(departments, i * 2, "name"),
    location: CITIES[i % CITIES.length]!,
    cost: 780 + (i % 17) * 95,
    purchased_on: isoDate(base, -((i % 400) + 30)),
    warranty_expires: isoDate(base, 300 - (i % 200)),
  })) as DataRecord[];
}

function seedGeneric(tableName: string) {
  const def = getDefinition(tableName);
  const users = store["sys_user"]!;
  const base = Date.UTC(2026, 5, 1);
  store[tableName] = Array.from({ length: def.seedCount }, (_, i) => ({
    sys_id: `${tableName.slice(0, 3)}${pad(i + 1, 5)}`,
    number: `${tableName.slice(0, 3).toUpperCase()}${pad(1001 + i)}`,
    name: `${def.table.label} record ${i + 1}`,
    description: `Auto-generated ${def.table.label} record used to demonstrate metadata-driven rendering.`,
    state: ["new", "active", "closed"][i % 3]!,
    owner: ref(users, i, "name"),
    updated_at: isoDateTime(base, -i * 9),
  })) as DataRecord[];
}

export function getTableData(tableName: string): DataRecord[] {
  seed();
  if (!store[tableName]) seedGeneric(tableName);
  return store[tableName]!;
}

export function buildFormMetadata(tableName: string): FormMetadata {
  const def = getDefinition(tableName);
  return {
    table: def.table,
    sections: def.sections,
    fields: def.fields.map((f) => ({ visible: true, ...f })),
    actions: FORM_ACTIONS,
    related_links: RELATED_LINKS,
  };
}

/** Field types the backend can group by. */
const GROUPABLE_TYPES = ["select", "reference", "boolean", "date"];

export function buildListMetadata(tableName: string): ListMetadata {
  const def = getDefinition(tableName);
  const byName = new Map(def.fields.map((f) => [f.name, f]));
  return {
    table: def.table,
    columns: (def.listColumns.map((n) => byName.get(n)).filter(Boolean) as FieldMeta[]).map((c) => ({
      ...c,
      groupable: c.groupable ?? GROUPABLE_TYPES.includes(c.type),
    })),
    actions: LIST_ACTIONS,
    page_sizes: [10, 20, 50, 100],
  };
}

// ---------------------------------------------------------------- navigation

export const MENUS: MenuNode[] = [
  {
    id: "all",
    label: "All",
    icon: "layout-grid",
    children: [
      {
        id: "service_management",
        label: "Service Management",
        icon: "life-buoy",
        children: [
          {
            id: "sm_operations",
            label: "Operations",
            icon: "activity",
            children: [
              { id: "incidents", label: "Incidents", icon: "alert-circle", route: "/list/incident" },
              { id: "requests", label: "Requests", icon: "clipboard-list", route: "/list/request" },
              { id: "problems", label: "Problems", icon: "search-x", route: "/list/problem" },
              { id: "changes", label: "Changes", icon: "git-pull-request", route: "/list/change" },
            ],
          },
          {
            id: "sm_knowledge",
            label: "Knowledge",
            icon: "book-open",
            children: [
              { id: "kb_articles", label: "Articles", icon: "file-text", route: "/list/kb_article" },
              { id: "kb_bases", label: "Knowledge Bases", icon: "library", route: "/list/kb_base" },
            ],
          },
        ],
      },
      {
        id: "asset_management",
        label: "Asset Management",
        icon: "boxes",
        children: [
          { id: "assets", label: "Assets", icon: "package", route: "/list/asset" },
          { id: "hardware", label: "Hardware", icon: "cpu", route: "/list/hardware" },
          { id: "software", label: "Software", icon: "app-window", route: "/list/software" },
          { id: "contracts", label: "Contracts", icon: "file-signature", route: "/list/contract" },
        ],
      },
      {
        id: "organization",
        label: "Organization",
        icon: "building-2",
        children: [
          { id: "users", label: "Users", icon: "users", route: "/list/sys_user" },
          { id: "departments", label: "Departments", icon: "building", route: "/list/department" },
          { id: "groups", label: "Groups", icon: "users-round", route: "/list/sys_group" },
        ],
      },
      {
        id: "platform",
        label: "Platform",
        icon: "settings",
        children: [
          { id: "tables", label: "Tables", icon: "table", route: "/list/sys_db_table" },
          { id: "custom_table", label: "Custom Table", icon: "layers", route: "/list/custom_table" },
        ],
      },
    ],
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: "star",
    empty_message: "No favorites added.",
    children: [],
  },
  {
    id: "applications",
    label: "Applications",
    icon: "layers",
    children: [
      {
        id: "app_itsm",
        label: "IT Service Management",
        icon: "life-buoy",
        children: [
          { id: "app_inc", label: "Incident Management", icon: "alert-circle", route: "/list/incident" },
          { id: "app_req", label: "Request Management", icon: "clipboard-list", route: "/list/request" },
        ],
      },
      {
        id: "app_itam",
        label: "IT Asset Management",
        icon: "boxes",
        children: [{ id: "app_asset", label: "Asset Inventory", icon: "package", route: "/list/asset" }],
      },
      {
        id: "app_hr",
        label: "HR Service Delivery",
        icon: "briefcase",
        children: [
          { id: "app_people", label: "People", icon: "users", route: "/list/sys_user" },
          { id: "app_dept", label: "Departments", icon: "building", route: "/list/department" },
        ],
      },
    ],
  },
];

export const PROFILE: ProfileInfo = {
  name: "Avery Callahan",
  title: "Service Desk Manager",
  organization: "Northwind Global · Production",
  initials: "AC",
  notifications: 4,
};

export const PROFILE_MENU: ProfileMenuItem[] = [
  { id: "profile", label: "My Profile", icon: "user" },
  { id: "preferences", label: "Preferences", icon: "sliders-horizontal" },
  { id: "personalization", label: "Personalization", icon: "palette" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "settings", label: "Settings", icon: "settings", separator_before: true },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: "keyboard" },
  { id: "help", label: "Help", icon: "circle-help" },
  { id: "logout", label: "Logout", icon: "log-out", separator_before: true },
];

// ---------------------------------------------------------------- stage 2

/** Tables the global search indexes. Served by the API, never hard-coded in UI. */
export const SEARCHABLE_TABLES: { table: string; icon: string; subtitle_field?: string }[] = [
  { table: "incident", icon: "alert-circle", subtitle_field: "short_description" },
  { table: "request", icon: "clipboard-list", subtitle_field: "short_description" },
  { table: "asset", icon: "laptop", subtitle_field: "model" },
  { table: "sys_user", icon: "user", subtitle_field: "title" },
  { table: "department", icon: "building", subtitle_field: "cost_center" },
];

export const ACTIVITY_TYPES: ActivityTypeMeta[] = [
  { id: "comment", label: "Comment", icon: "message-square" },
  { id: "work_note", label: "Work note", icon: "notebook-pen" },
  { id: "system", label: "System", icon: "settings" },
  { id: "field_change", label: "Field change", icon: "pencil-line" },
  { id: "attachment", label: "Attachment", icon: "paperclip" },
];

const activityStore: Record<string, ActivityEntry[]> = {};

function seedActivities(key: string): ActivityEntry[] {
  const now = Date.UTC(2026, 6, 29, 10, 20);
  return [
    {
      id: `${key}-3`,
      type: "comment",
      author: { id: "usr00003", displayName: "Anna Kowalski", initials: "AK" },
      createdAt: new Date(now).toISOString(),
      content: "approved this request",
    },
    {
      id: `${key}-2`,
      type: "field_change",
      author: { displayName: "System" },
      createdAt: new Date(now - 3600000 * 5).toISOString(),
      content: "State changed from New to In Progress",
      field_label: "State",
      old_value: "New",
      new_value: "In Progress",
    },
    {
      id: `${key}-1`,
      type: "system",
      author: { displayName: "System" },
      createdAt: new Date(now - 86400000 * 26).toISOString(),
      content: "Record created",
    },
  ];
}

export function getActivities(tableName: string, recordId: string): ActivityEntry[] {
  const key = `${tableName}:${recordId}`;
  if (!activityStore[key]) activityStore[key] = seedActivities(key);
  return activityStore[key]!;
}

export function addActivity(
  tableName: string,
  recordId: string,
  entry: { type: ActivityType; content: string },
): ActivityEntry {
  const list = getActivities(tableName, recordId);
  const created: ActivityEntry = {
    id: `${tableName}-${recordId}-${Date.now()}`,
    type: entry.type,
    author: { id: "me", displayName: PROFILE.name, initials: PROFILE.initials },
    createdAt: new Date().toISOString(),
    content: entry.content,
  };
  list.unshift(created);
  return created;
}

// ------------------------------------------------------------ favorites store

const FAVORITE_SEED = ["incidents", "requests", "assets"];
let favoriteIds: string[] | null = null;

export function getFavoriteIds(): string[] {
  if (!favoriteIds) favoriteIds = [...FAVORITE_SEED];
  return favoriteIds;
}

export function setFavorite(id: string, on: boolean): string[] {
  const list = getFavoriteIds();
  const idx = list.indexOf(id);
  if (on && idx < 0) list.push(id);
  if (!on && idx >= 0) list.splice(idx, 1);
  return [...list];
}

/**
 * The menu the API serves: the favorites section is materialised from the
 * user's starred items, everything else is the static application menu.
 */
export function buildMenus(): MenuNode[] {
  return MENUS.map((menu) =>
    menu.id === "favorites"
      ? { ...menu, children: getFavoriteIds().map((id) => findMenuNode(id)).filter((n): n is MenuNode => n !== null) }
      : menu,
  );
}

/** Finds a menu node anywhere in the API-provided tree. */
export function findMenuNode(id: string, nodes: MenuNode[] = MENUS): MenuNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = node.children ? findMenuNode(id, node.children) : null;
    if (child) return child;
  }
  return null;
}
