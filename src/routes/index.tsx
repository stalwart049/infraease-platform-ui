import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";

const TITLE = "InfraEase Workspace — Enterprise Service Management";
const DESCRIPTION =
  "Open metadata-driven list and form views for incidents, requests, assets, users and departments in InfraEase.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

const entries = [
  { table: "incident", label: "Incidents", icon: "siren", body: "Track, triage and resolve service disruptions." },
  { table: "request", label: "Requests", icon: "clipboard-list", body: "Fulfil catalog and access requests." },
  { table: "asset", label: "Assets", icon: "server", body: "Manage hardware and infrastructure inventory." },
  { table: "sys_user", label: "Users", icon: "users", body: "People records used across every reference field." },
  { table: "department", label: "Departments", icon: "building-2", body: "Organisational structure and owners." },
];

function Index() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        InfraEase Platform
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Metadata-driven service workspace
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground">
        Every list and form below is rendered from table metadata — the same components serve any table the
        platform exposes. Pick a table to browse records, edit inline, or open a full form.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <Link
            key={entry.table}
            to="/list/$tableName"
            params={{ tableName: entry.table }}
            className="group flex flex-col gap-2 rounded-[4px] border border-border bg-surface p-4 transition-colors hover:border-primary/50 hover:bg-surface-raised"
          >
            <span className="grid size-9 place-items-center rounded-[4px] bg-surface-sunken text-foreground">
              <Icon name={entry.icon} className="size-4" />
            </span>
            <span className="text-[14px] font-semibold text-foreground">{entry.label}</span>
            <span className="text-[13px] text-muted-foreground">{entry.body}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-primary">
              Open list
              <Icon name="arrow-right" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
