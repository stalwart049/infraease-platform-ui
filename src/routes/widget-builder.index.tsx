import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";
import { widgetApi } from "@/features/ui-builder/services/widgetApi";
import type { WidgetSummary } from "@/features/ui-builder/models/widget";

const TITLE = "Widget Builder — InfraEase";
const DESCRIPTION = "Develop reusable InfraEase widgets: React component, styles, server script and client script.";

export const Route = createFileRoute("/widget-builder/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WidgetIndexPage,
});

function WidgetIndexPage() {
  const [widgets, setWidgets] = useState<WidgetSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    widgetApi
      .listWidgets()
      .then(setWidgets)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load widgets."));
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">Widget Builder</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Each widget is a React component, a stylesheet, a server script and a client script.
          </p>
        </div>
        <Link
          to="/widget-builder/$widgetId"
          params={{ widgetId: "new" }}
          className="inline-flex h-8 items-center gap-1.5 rounded-[3px] border border-primary bg-primary px-2.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Icon name="plus" className="size-3.5" />
          New widget
        </Link>
      </div>

      {error && <p className="mt-4 text-[13px] text-destructive">{error}</p>}
      {!widgets && !error && <p className="mt-4 text-[13px] text-muted-foreground">Loading…</p>}

      <ul className="mt-4 divide-y divide-border rounded-[4px] border border-border bg-surface">
        {(widgets ?? []).map((widget) => (
          <li key={widget.sys_id}>
            <Link
              to="/widget-builder/$widgetId"
              params={{ widgetId: widget.sys_id }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted"
            >
              <Icon name={widget.icon} className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground">{widget.label}</span>
                <span className="block truncate text-[11.5px] text-muted-foreground">
                  {widget.name} · {widget.category} · updated {widget.updated_at}
                </span>
              </span>
              <span
                className={
                  widget.active
                    ? "rounded-[2px] border border-success/40 px-1.5 py-0.5 text-[10px] uppercase text-success"
                    : "rounded-[2px] border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground"
                }
              >
                {widget.active ? "Active" : "Inactive"}
              </span>
              <Icon name="chevron-right" className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
