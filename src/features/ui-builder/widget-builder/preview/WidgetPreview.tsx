import { useEffect, useState } from "react";
import { Icon } from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import type { Breakpoint } from "../../models/ui";
import { BREAKPOINTS } from "../../models/ui";
import type { WidgetDefinition } from "../../models/widget";
import { widgetRuntime } from "../../services/widgetRuntime";

const WIDTHS: Record<Breakpoint, number> = { desktop: 900, tablet: 700, mobile: 380 };
const ICONS: Record<Breakpoint, string> = { desktop: "monitor", tablet: "tablet", mobile: "smartphone" };

/**
 * Preview surface. It renders the widget shell the runtime will produce and
 * shows the development context (properties + data returned by server.js).
 */
export function WidgetPreview({
  widget,
  onClose,
  embedded = false,
}: {
  widget: WidgetDefinition;
  onClose?: () => void;
  embedded?: boolean;
}) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [properties, setProperties] = useState<Record<string, string>>(() => widgetRuntime.resolveProperties(widget));
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    widgetRuntime.requestData({ widget, properties }).then((response) => {
      if (!alive) return;
      setData(response.data);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [widget, properties]);

  const stats = ((data as { stats?: { key: string; label: string; value: string | number }[] } | null)?.stats) ?? [];

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-background",
        embedded ? "h-full" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm",
      )}
      {...(!embedded ? { role: "dialog", "aria-modal": true } : {})}
      aria-label="Widget preview"
    >
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-surface px-3">
        <Icon name="eye" className="size-4 text-primary" />
        <span className="text-[13px] font-semibold text-foreground">Preview · {widget.label}</span>
        <div className="ml-auto inline-flex rounded-[3px] border border-border p-0.5">
          {BREAKPOINTS.map((b) => (
            <button
              key={b}
              type="button"
              aria-label={`${b} viewport`}
              onClick={() => setBreakpoint(b)}
              className={cn(
                "grid size-6 place-items-center rounded-[2px]",
                breakpoint === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon name={ICONS[b]} className="size-3.5" />
            </button>
          ))}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-2 inline-flex h-7 items-center gap-1 rounded-[3px] border border-border px-2 text-[12.5px] text-foreground hover:bg-muted"
          >
            <Icon name="x" className="size-3.5" />
            Close
          </button>
        )}
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-canvas p-6">
          <div style={{ width: WIDTHS[breakpoint] }} className="h-fit rounded-[4px] border border-border bg-background p-4 shadow-sm">
            <div className="rounded-[3px] border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-[13px] font-semibold text-foreground">{widget.label}</span>
                <span className="text-[11.5px] text-muted-foreground">{properties["department"] ?? widget.category}</span>
              </div>
              <div className="p-3">
                {loading ? (
                  <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    <Icon name="loader-circle" className="size-4 animate-spin" />
                    client.js is requesting data from server.js…
                  </div>
                ) : stats.length > 0 ? (
                  <ul className={cn("grid gap-3", breakpoint === "mobile" ? "grid-cols-1" : "grid-cols-3")}>
                    {stats.map((stat) => (
                      <li key={stat.key} className="rounded-[3px] border border-border bg-background p-2.5">
                        <p className="text-[22px] font-semibold leading-none text-foreground">{stat.value}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">{stat.label}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[12.5px] text-muted-foreground">
                    No bindings declared yet — add a binding so the server script can return data.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-surface">
          <p className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Widget context
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <p className="mb-1.5 text-[11.5px] font-semibold text-foreground">Properties</p>
            <div className="space-y-2">
              {widget.properties.length === 0 && <p className="text-[12px] text-muted-foreground">No properties defined.</p>}
              {widget.properties.map((property) => (
                <label key={property.id} className="block space-y-1">
                  <span className="block text-[11px] text-muted-foreground">
                    {property.name} <span className="opacity-70">({property.type})</span>
                  </span>
                  <input
                    value={properties[property.name] ?? ""}
                    onChange={(e) => setProperties((p) => ({ ...p, [property.name]: e.target.value }))}
                    className="h-7 w-full rounded-[3px] border border-input bg-background px-2 text-[12.5px] outline-none focus:border-ring"
                  />
                </label>
              ))}
            </div>

            <p className="mb-1.5 mt-4 text-[11.5px] font-semibold text-foreground">Data</p>
            <pre className="max-h-64 overflow-auto rounded-[3px] border border-border bg-background p-2 font-mono text-[11.5px] leading-4 text-muted-foreground">
{JSON.stringify(data ?? {}, null, 2)}
            </pre>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Preview data comes from the local development adapter and will be replaced by the server script response.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
