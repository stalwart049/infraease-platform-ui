import type { WidgetDefinition } from "../models/widget";

/** Local widget store. Replace with InfraEase widget APIs later. */

const componentSource = `export default function EmployeeStatistics({ data, properties }) {
  const stats = data?.stats ?? [];
  return (
    <div className="ie-widget">
      <header className="ie-widget__head">
        <h3>{properties.title ?? "Employee Statistics"}</h3>
        <span>{properties.department}</span>
      </header>
      <ul className="ie-widget__grid">
        {stats.map((stat) => (
          <li key={stat.key}>
            <span className="ie-widget__value">{stat.value}</span>
            <span className="ie-widget__label">{stat.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`;

const styleSource = `.ie-widget {
  border: 1px solid var(--ie-border, #e2e8f0);
  border-radius: 3px;
  background: #fff;
}

.ie-widget__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--ie-border, #e2e8f0);
  font-size: 13px;
}

.ie-widget__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
}

.ie-widget__value { font-size: 20px; font-weight: 600; }
.ie-widget__label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; }`;

const serverSource = `// Runs on the InfraEase server. Receives widget properties, returns data.
(function () {
  const department = input.properties.department;
  const limit = Number(input.properties.limit || 10);

  const employees = new InfraEaseRecord('sys_user');
  employees.addQuery('department', department);
  employees.setLimit(limit);

  data.stats = [
    { key: 'headcount', label: 'Headcount', value: employees.getRowCount() },
    { key: 'open_tasks', label: 'Open Tasks', value: employees.aggregate('open_tasks') },
    { key: 'avg_tenure', label: 'Avg Tenure', value: employees.aggregate('tenure_years') },
  ];
})();`;

const clientSource = `// Runs in the browser. Requests data from server.js and hands it to the component.
export function controller({ properties, server, setData, emit }) {
  async function refresh() {
    const response = await server.get({ properties });
    setData(response.data);
  }

  refresh();

  return {
    refresh,
    onEmployeeClick(employee) {
      emit('onEmployeeClick', { employee });
    },
  };
}`;

export const seedWidgets: WidgetDefinition[] = [
  {
    sys_id: "wgt_employee_statistics",
    name: "employee_statistics",
    label: "Employee Statistics",
    description: "Headcount and workload statistics for a department.",
    category: "People",
    icon: "users",
    active: true,
    status: "saved",
    files: { component: componentSource, style: styleSource, server: serverSource, client: clientSource },
    properties: [
      { id: "p1", name: "department", type: "String", default: "IT", required: true, description: "Department to report on." },
      { id: "p2", name: "limit", type: "Number", default: "10", required: false, description: "Maximum records read." },
    ],
    bindings: [
      { id: "b1", name: "stats", dataType: "Aggregate", source: "server.stats", description: "Aggregated statistics." },
    ],
    events: [{ id: "e1", name: "onEmployeeClick", description: "Triggered when an employee is selected." }],
    updated_at: "2 days ago",
  },
  {
    sys_id: "wgt_employee_card",
    name: "employee_card",
    label: "Employee Card",
    description: "Compact profile card for a single employee record.",
    category: "People",
    icon: "id-card",
    active: true,
    status: "saved",
    files: {
      component: componentSource.replace("EmployeeStatistics", "EmployeeCard"),
      style: styleSource,
      server: serverSource,
      client: clientSource,
    },
    properties: [{ id: "p1", name: "user", type: "Reference", default: "", required: true }],
    bindings: [{ id: "b1", name: "employee", dataType: "Record", source: "server.employee" }],
    events: [{ id: "e1", name: "onOpenProfile", description: "Triggered when the profile link is used." }],
    updated_at: "5 days ago",
  },
  {
    sys_id: "wgt_employee_hierarchy",
    name: "employee_hierarchy",
    label: "Employee Hierarchy",
    description: "Reporting tree for an organisation branch.",
    category: "People",
    icon: "network",
    active: true,
    status: "saved",
    files: { component: componentSource, style: styleSource, server: serverSource, client: clientSource },
    properties: [{ id: "p1", name: "root_user", type: "Reference", default: "", required: true }],
    bindings: [{ id: "b1", name: "tree", dataType: "RecordList", source: "server.tree" }],
    events: [],
    updated_at: "1 week ago",
  },
  {
    sys_id: "wgt_approval_summary",
    name: "approval_summary",
    label: "Approval Summary",
    description: "Pending approvals grouped by state.",
    category: "Process",
    icon: "check-check",
    active: true,
    status: "saved",
    files: { component: componentSource, style: styleSource, server: serverSource, client: clientSource },
    properties: [{ id: "p1", name: "state", type: "String", default: "requested", required: false }],
    bindings: [{ id: "b1", name: "approvals", dataType: "RecordList", source: "server.approvals" }],
    events: [],
    updated_at: "3 days ago",
  },
  {
    sys_id: "wgt_student_statistics",
    name: "student_statistics",
    label: "Student Statistics",
    description: "Enrolment metrics for an academic programme.",
    category: "Education",
    icon: "graduation-cap",
    active: false,
    status: "draft",
    files: { component: componentSource, style: styleSource, server: serverSource, client: clientSource },
    properties: [{ id: "p1", name: "programme", type: "String", default: "", required: false }],
    bindings: [],
    events: [],
    updated_at: "yesterday",
  },
  {
    sys_id: "wgt_vendor_status",
    name: "vendor_status",
    label: "Vendor Status",
    description: "Contract and SLA status per vendor.",
    category: "Supplier",
    icon: "truck",
    active: true,
    status: "saved",
    files: { component: componentSource, style: styleSource, server: serverSource, client: clientSource },
    properties: [{ id: "p1", name: "vendor", type: "Reference", default: "", required: true }],
    bindings: [{ id: "b1", name: "vendor", dataType: "Record", source: "server.vendor" }],
    events: [],
    updated_at: "4 days ago",
  },
];

/** Structural preview payload — clearly mock, replaced by server.js output later. */
export const widgetPreviewData: Record<string, unknown> = {
  stats: [
    { key: "headcount", label: "Headcount", value: 42 },
    { key: "open_tasks", label: "Open Tasks", value: 17 },
    { key: "avg_tenure", label: "Avg Tenure", value: "3.4y" },
  ],
};
