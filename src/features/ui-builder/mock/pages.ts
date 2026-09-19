import type { UiNode, UiPage } from "../models/ui";

/** Local page store. Serialized metadata only — swap for InfraEase page APIs. */

let seq = 0;
const id = (p: string) => `${p}_${++seq}`;

function node(
  type: string,
  name: string,
  properties: Record<string, string | number | boolean> = {},
  extra: Partial<UiNode> = {},
): UiNode {
  return {
    id: id(type),
    type,
    name,
    properties,
    layout: {},
    style: {},
    bindings: {},
    events: [],
    visibility: {},
    children: [],
    ...extra,
  };
}

function kpi(label: string, value: string, trend: string, tone: string, table: string, field: string): UiNode {
  return node(
    "kpi",
    label,
    { label, value, trend, tone },
    {
      layout: { desktop: { span: 3 }, tablet: { span: 4 }, mobile: { span: 12 } },
      bindings: { value: { kind: "table", source: "InfraEase Table", table, field } },
    },
  );
}

function defaultPage(): UiPage {
  const header = node("row", "Header", {}, {
    layout: { desktop: { direction: "row", gap: "16", padding: "12", align: "center" } },
    children: [
      node("text", "Logo", { value: "InfraEase" }, { layout: { desktop: { span: 3 } } }),
      node("link", "Navigation", { text: "Overview · Incidents · Assets", href: "/list/incident" }, { layout: { desktop: { span: 6 } } }),
      node("avatar", "User Menu", { initials: "AK", caption: "Service Desk" }, { layout: { desktop: { span: 3, align: "end" } } }),
    ],
  });

  const kpiGrid = node("grid", "KPI Grid", {}, {
    layout: { desktop: { columns: 12, gap: "12" }, tablet: { columns: 8 }, mobile: { columns: 4 } },
    children: [
      kpi("Open Incidents", "128", "+12% week", "danger", "incident", "sys_id"),
      kpi("Breaching SLA", "9", "-3 today", "warning", "incident", "sla_due"),
      kpi("Open Requests", "54", "+4 today", "neutral", "request", "sys_id"),
      kpi("Assets Online", "97%", "stable", "success", "asset", "state"),
    ],
  });

  const table = node(
    "data_table",
    "Data Table",
    { title: "Active Incidents", fields: "number, short_description, priority, state, assigned_to", pageSize: 10 },
    {
      layout: { desktop: { span: 12 } },
      bindings: { rows: { kind: "table", source: "InfraEase Table", table: "incident", field: "" } },
      events: [
        {
          id: "ev_table",
          event: "onRowClick",
          actions: [{ id: "ac_table", type: "navigate", params: { target: "/form/incident/{record.sys_id}" } }],
        },
      ],
    },
  );

  const main = node("container", "Main Container", { maxWidth: "full" }, {
    layout: { desktop: { padding: "16", gap: "16", direction: "column" } },
    children: [
      node("heading", "Heading", { value: "Service Operations", level: "h1" }),
      kpiGrid,
      node("row", "Insights", {}, {
        layout: { desktop: { direction: "row", gap: "12" } },
        children: [
          node("chart", "Chart", { title: "Incidents by Priority", chartType: "bar", groupBy: "priority" }, {
            layout: { desktop: { span: 7 }, mobile: { span: 12 } },
            bindings: { series: { kind: "table", source: "InfraEase Table", table: "incident", field: "priority" } },
          }),
          node("activity_stream", "Activity Stream", { title: "Recent Activity" }, {
            layout: { desktop: { span: 5 }, mobile: { span: 12 } },
          }),
        ],
      }),
      table,
    ],
  });

  const footer = node("section", "Footer", { title: "" }, {
    layout: { desktop: { padding: "12" } },
    children: [node("text", "Footer note", { value: "InfraEase Platform · UI Builder page metadata" })],
  });

  return {
    sys_id: "page_service_operations",
    name: "Service Operations",
    route: "/x/service-operations",
    description: "Operations overview composed from InfraEase widgets.",
    updated_at: "just now",
    root: node("page", "Page", {}, { children: [header, main, footer] }),
  };
}

function incidentWorkspace(): UiPage {
  return {
    sys_id: "page_incident_workspace",
    name: "Incident Workspace",
    route: "/x/incident-workspace",
    description: "Record-centric workspace page.",
    updated_at: "2 days ago",
    root: node("page", "Page", {}, {
      children: [
        node("container", "Main Container", { maxWidth: "xl" }, {
          layout: { desktop: { padding: "16", gap: "16", direction: "column" } },
          children: [
            node("heading", "Heading", { value: "Incident Workspace", level: "h1" }),
            node("row", "Workspace", {}, {
              layout: { desktop: { direction: "row", gap: "12" } },
              children: [
                node("form_widget", "Form", { title: "Incident", view: "Default" }, {
                  layout: { desktop: { span: 8 }, mobile: { span: 12 } },
                  bindings: { record: { kind: "table", source: "InfraEase Table", table: "incident", field: "" } },
                }),
                node("activity_stream", "Activity Stream", { title: "Activity" }, {
                  layout: { desktop: { span: 4 }, mobile: { span: 12 } },
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  };
}

const store = new Map<string, UiPage>();
for (const page of [defaultPage(), incidentWorkspace()]) store.set(page.sys_id, page);

export const pageStore = store;
