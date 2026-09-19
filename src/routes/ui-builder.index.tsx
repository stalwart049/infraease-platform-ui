import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";
import { uiBuilderApi } from "@/features/ui-builder/services/uiBuilderApi";
import type { UiPageSummary } from "@/features/ui-builder/models/ui";

const TITLE = "UI Builder — InfraEase";
const DESCRIPTION = "Compose application pages visually from layout components, basic components and widgets.";

export const Route = createFileRoute("/ui-builder/")({
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
  component: UiBuilderIndexPage,
});

function UiBuilderIndexPage() {
  const [pages, setPages] = useState<UiPageSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    uiBuilderApi
      .listPages()
      .then(setPages)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load pages."));
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">UI Builder</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Open a page to compose its layout, components and widgets.
          </p>
        </div>
        <Link
          to="/widget-builder"
          className="inline-flex h-8 items-center gap-1.5 rounded-[3px] border border-border bg-surface px-2.5 text-[13px] text-foreground hover:bg-muted"
        >
          <Icon name="puzzle" className="size-3.5" />
          Widget Builder
        </Link>
      </div>

      {error && <p className="mt-4 text-[13px] text-destructive">{error}</p>}
      {!pages && !error && <p className="mt-4 text-[13px] text-muted-foreground">Loading…</p>}

      <ul className="mt-4 divide-y divide-border rounded-[4px] border border-border bg-surface">
        {(pages ?? []).map((page) => (
          <li key={page.sys_id}>
            <Link
              to="/ui-builder/$pageId"
              params={{ pageId: page.sys_id }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted"
            >
              <Icon name="layout-dashboard" className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground">{page.name}</span>
                <span className="block truncate text-[11.5px] text-muted-foreground">
                  {page.route} · {page.component_count} components · updated {page.updated_at}
                </span>
              </span>
              <Icon name="chevron-right" className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
