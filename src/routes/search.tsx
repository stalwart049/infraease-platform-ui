import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/common/Icon";
import { menuLinkProps } from "@/components/layout/MenuTree";
import { globalSearchService } from "@/services/globalSearchService";
import type { SearchResponse, SearchResult } from "@/services/types";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Search results — InfraEase" },
      { name: "description", content: "Search every InfraEase record across all tables and open the matching reference." },
      { property: "og:title", content: "Search results — InfraEase" },
      { property: "og:description", content: "Search every InfraEase record across all tables." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const query = useQuery<SearchResponse>({
    queryKey: ["global-search-all", q],
    queryFn: () => globalSearchService.searchAll(q),
    enabled: q.trim().length > 0,
  });

  const results = query.data?.results ?? [];
  const groups = new Map<string, { label: string; items: SearchResult[] }>();
  results.forEach((r) => {
    if (!groups.has(r.table)) groups.set(r.table, { label: r.table_label, items: [] });
    groups.get(r.table)!.items.push(r);
  });

  return (
    <div className="min-h-full bg-canvas px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-[18px] font-semibold text-foreground">Search results</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {q ? (
            <>
              {query.data?.total ?? 0} match{(query.data?.total ?? 0) === 1 ? "" : "es"} for “{q}”
            </>
          ) : (
            "Type a term in the global search box to find records."
          )}
        </p>

        {query.isLoading ? (
          <div className="mt-6 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-[4px] bg-muted" />
            ))}
          </div>
        ) : query.error ? (
          <p className="mt-8 text-[13px] text-destructive">Search is unavailable right now.</p>
        ) : q && results.length === 0 ? (
          <p className="mt-8 text-[13px] text-muted-foreground">No records match “{q}”.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {[...groups.entries()].map(([table, group]) => (
              <section key={table} className="rounded-[4px] border border-border bg-surface">
                <header className="flex items-center justify-between border-b border-border px-3 py-2">
                  <h2 className="text-[13px] font-semibold text-foreground">{group.label}</h2>
                  <Link
                    to="/list/$tableName"
                    params={{ tableName: table }}
                    className="text-[12px] text-primary underline-offset-2 hover:underline"
                  >
                    Open list
                  </Link>
                </header>
                <ul className="divide-y divide-border">
                  {group.items.map((r) => (
                    <li key={`${r.table}:${r.sys_id}`}>
                      <Link
                        {...menuLinkProps(r.route ?? `/form/${r.table}/${r.sys_id}`)}
                        className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted"
                      >
                        <Icon name={r.icon} className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-foreground">
                            {r.display_value}
                          </span>
                          <span className="block truncate text-[12px] text-muted-foreground">{r.subtitle}</span>
                        </span>
                        <Icon name="chevron-right" className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
