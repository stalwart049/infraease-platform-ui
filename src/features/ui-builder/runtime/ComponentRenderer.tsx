import type { ReactNode } from "react";
import { Icon } from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import type { Breakpoint, ComponentDefinition, UiNode } from "../models/ui";
import { dataBindingService } from "../services/dataBindingService";
import { containerStyle } from "./layout";

interface RenderProps {
  node: UiNode;
  definition: ComponentDefinition | undefined;
  breakpoint: Breakpoint;
  /** already-wrapped children (canvas chrome applied by the caller) */
  children?: ReactNode;
  editing: boolean;
}

const str = (node: UiNode, key: string, fallback = "") => {
  const raw = node.properties[key];
  return raw === undefined || raw === "" ? fallback : String(raw);
};

const num = (node: UiNode, key: string, fallback: number) => {
  const raw = Number(node.properties[key]);
  return Number.isFinite(raw) && raw !== 0 ? raw : fallback;
};

const tones: Record<string, string> = {
  neutral: "border-border text-foreground",
  success: "border-success/40 text-success",
  warning: "border-warning/40 text-warning",
  danger: "border-destructive/40 text-destructive",
  info: "border-primary/40 text-primary",
};

function BindingTag({ node, property }: { node: UiNode; property: string }) {
  const label = dataBindingService.describe(node.bindings[property]);
  if (!label) return null;
  return (
    <span className="ml-1 inline-flex items-center gap-1 rounded-[2px] border border-primary/30 bg-primary/5 px-1 text-[10px] font-medium text-primary">
      <Icon name="database" className="size-2.5" />
      {label}
    </span>
  );
}

function WidgetFrame({
  title,
  icon,
  binding,
  children,
  editing,
}: {
  title: string;
  icon: string;
  binding?: ReactNode;
  children: ReactNode;
  editing: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[3px] border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border bg-surface-sunken px-2.5 py-1.5">
        <Icon name={icon} className="size-3.5 text-muted-foreground" />
        <span className="text-[12px] font-semibold text-foreground">{title}</span>
        {editing && binding}
      </div>
      <div className="p-2.5">{children}</div>
    </div>
  );
}

function SkeletonRows({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="space-y-1">
      <div className="flex gap-2 border-b border-border pb-1">
        {Array.from({ length: cols }).map((_, i) => (
          <span key={i} className="h-2 flex-1 rounded-[2px] bg-muted-foreground/25" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2 py-1">
          {Array.from({ length: cols }).map((_, c) => (
            <span key={c} className="h-2 flex-1 rounded-[2px] bg-muted" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Renders one metadata node. Presentation only — no data is fetched and no
 * business logic runs; the InfraEase runtime will supply real data later.
 */
export function ComponentRenderer({ node, definition, breakpoint, children, editing }: RenderProps) {
  const inner = containerStyle(node, breakpoint);
  const kids = <div style={inner}>{children}</div>;

  switch (node.type) {
    case "page":
      return kids;
    case "container":
      return <div className="rounded-[3px]" style={inner}>{children}</div>;
    case "section":
      return (
        <section style={inner}>
          {str(node, "title") && (
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {str(node, "title")}
            </h3>
          )}
          {children}
        </section>
      );
    case "row":
    case "column":
    case "stack":
    case "grid":
      return kids;
    case "split_pane":
      return <div style={inner}>{children}</div>;
    case "tabs": {
      const labels = str(node, "tabs", "Details, Related, History").split(",").map((t) => t.trim());
      return (
        <div className="rounded-[3px] border border-border bg-surface">
          <div className="flex gap-1 border-b border-border px-2">
            {labels.map((label, i) => (
              <span
                key={label + i}
                className={cn(
                  "-mb-px border-b-2 px-2 py-1.5 text-[12px]",
                  i === 0 ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground",
                )}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="p-2.5" style={inner}>{children}</div>
        </div>
      );
    }
    case "accordion":
      return (
        <div className="rounded-[3px] border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-2.5 py-1.5 text-[12px] font-medium text-foreground">
            {str(node, "title", "Accordion")}
            <Icon name="chevron-down" className="size-3.5 text-muted-foreground" />
          </div>
          <div className="p-2.5" style={inner}>{children}</div>
        </div>
      );
    case "card":
      return (
        <div className="rounded-[3px] border border-border bg-surface p-2.5">
          {str(node, "title") && <p className="mb-1.5 text-[12px] font-semibold text-foreground">{str(node, "title")}</p>}
          <div style={inner}>{children}</div>
        </div>
      );

    case "text":
      return (
        <p className="text-[13px] text-foreground">
          {str(node, "value", "Text")}
          {editing && <BindingTag node={node} property="value" />}
        </p>
      );
    case "heading": {
      const level = str(node, "level", "h1");
      const size = level === "h1" ? "text-[20px]" : level === "h2" ? "text-[16px]" : "text-[14px]";
      return (
        <p className={cn(size, "font-semibold tracking-tight text-foreground")}>
          {str(node, "value", "Heading")}
          {editing && <BindingTag node={node} property="value" />}
        </p>
      );
    }
    case "paragraph":
      return (
        <p className="max-w-prose text-[13px] leading-5 text-muted-foreground">
          {str(node, "value", "Paragraph text used to describe the page or a section of it.")}
          {editing && <BindingTag node={node} property="value" />}
        </p>
      );
    case "button": {
      const variant = str(node, "variant", "primary");
      const icon = str(node, "icon");
      const position = str(node, "iconPosition", "left");
      return (
        <span
          title={str(node, "tooltip")}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-[3px] border px-2.5 text-[13px] font-medium",
            variant === "primary" && "border-primary bg-primary text-primary-foreground",
            variant === "default" && "border-border bg-surface text-foreground",
            variant === "danger" && "border-destructive/40 bg-surface text-destructive",
            variant === "ghost" && "border-transparent text-muted-foreground",
            node.properties["disabled"] === true && "opacity-50",
          )}
        >
          {icon && position === "left" && <Icon name={icon} className="size-3.5" />}
          {str(node, "text", "Button")}
          {icon && position === "right" && <Icon name={icon} className="size-3.5" />}
          {editing && node.events.length > 0 && <Icon name="zap" className="size-3 text-current opacity-70" />}
        </span>
      );
    }
    case "link":
      return (
        <span className="text-[13px] font-medium text-primary underline-offset-2 hover:underline">
          {str(node, "text", "Link")}
        </span>
      );
    case "image":
      return str(node, "src") ? (
        <img src={str(node, "src")} alt={str(node, "alt")} className="max-h-48 rounded-[3px] border border-border object-cover" />
      ) : (
        <div className="grid h-28 place-items-center rounded-[3px] border border-dashed border-border bg-surface-sunken text-muted-foreground">
          <Icon name="image" className="size-5" />
        </div>
      );
    case "icon":
      return <Icon name={str(node, "name", "star")} className="size-5 text-foreground" />;
    case "divider":
      return <hr className="my-1 border-border" />;
    case "badge":
      return (
        <span className={cn("inline-block rounded-[2px] border px-1.5 py-0.5 text-[11px]", tones[str(node, "tone", "neutral")] ?? tones["neutral"])}>
          {str(node, "text", "Badge")}
        </span>
      );
    case "avatar":
      return (
        <span className="inline-flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-surface-sunken text-[11px] font-semibold text-foreground">
            {str(node, "initials", "IE")}
          </span>
          <span className="text-[12px] text-muted-foreground">{str(node, "caption")}</span>
        </span>
      );
    case "alert":
      return (
        <div className={cn("rounded-[3px] border px-2.5 py-2", tones[str(node, "tone", "info")] ?? tones["info"])}>
          <p className="text-[12.5px] font-semibold">{str(node, "title", "Notice")}</p>
          <p className="text-[12px] text-muted-foreground">{str(node, "message", "Contextual message for the operator.")}</p>
        </div>
      );
    case "progress": {
      const value = Math.max(0, Math.min(100, num(node, "value", 62)));
      return (
        <div>
          <div className="mb-1 flex justify-between text-[11.5px] text-muted-foreground">
            <span>{str(node, "label", "Progress")}</span>
            <span>{value}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${value}%` }} />
          </div>
        </div>
      );
    }

    case "kpi": {
      const tone = str(node, "tone", "neutral");
      return (
        <div className="rounded-[3px] border border-border bg-surface p-2.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {str(node, "label", "Metric")}
          </p>
          <p className={cn("mt-1 text-[22px] font-semibold leading-none", tones[tone]?.split(" ").at(-1))}>
            {str(node, "value", "—")}
          </p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {str(node, "trend")}
            {editing && <BindingTag node={node} property="value" />}
          </p>
        </div>
      );
    }
    case "data_table":
      return (
        <WidgetFrame
          title={str(node, "title", "Data Table")}
          icon="table"
          editing={editing}
          binding={<BindingTag node={node} property="rows" />}
        >
          <SkeletonRows rows={Math.min(6, num(node, "pageSize", 5))} cols={Math.max(3, str(node, "fields", "a,b,c,d").split(",").length)} />
        </WidgetFrame>
      );
    case "form_widget":
      return (
        <WidgetFrame title={str(node, "title", "Form")} icon="clipboard-list" editing={editing} binding={<BindingTag node={node} property="record" />}>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <span className="block h-2 w-16 rounded-[2px] bg-muted-foreground/25" />
                <span className="block h-6 rounded-[2px] border border-border bg-background" />
              </div>
            ))}
          </div>
        </WidgetFrame>
      );
    case "record":
      return (
        <WidgetFrame title={str(node, "title", "Record")} icon="file-text" editing={editing} binding={<BindingTag node={node} property="record" />}>
          <SkeletonRows rows={3} cols={2} />
        </WidgetFrame>
      );
    case "list_widget":
      return (
        <WidgetFrame title={str(node, "title", "List")} icon="list" editing={editing} binding={<BindingTag node={node} property="rows" />}>
          <ul className="space-y-1.5">
            {Array.from({ length: Math.min(5, num(node, "limit", 4)) }).map((_, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                <span className="h-2 flex-1 rounded-[2px] bg-muted" />
              </li>
            ))}
          </ul>
        </WidgetFrame>
      );
    case "chart": {
      const bars = [64, 38, 82, 47, 55, 29, 71];
      return (
        <WidgetFrame title={str(node, "title", "Chart")} icon="chart-column" editing={editing} binding={<BindingTag node={node} property="series" />}>
          <div className="flex h-28 items-end gap-1.5">
            {bars.map((h, i) => (
              <span key={i} className="flex-1 rounded-t-[2px] bg-primary/70" style={{ height: `${h}%` }} />
            ))}
          </div>
        </WidgetFrame>
      );
    }
    case "activity_stream":
      return (
        <WidgetFrame title={str(node, "title", "Activity Stream")} icon="message-square" editing={editing} binding={<BindingTag node={node} property="records" />}>
          <ol className="space-y-2.5 border-l border-border pl-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="space-y-1">
                <span className="block h-2 w-24 rounded-[2px] bg-muted-foreground/25" />
                <span className="block h-2 w-full rounded-[2px] bg-muted" />
              </li>
            ))}
          </ol>
        </WidgetFrame>
      );
    case "calendar":
      return (
        <WidgetFrame title={str(node, "title", "Calendar")} icon="calendar" editing={editing} binding={<BindingTag node={node} property="events" />}>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="grid aspect-square place-items-center rounded-[2px] border border-border text-[10px] text-muted-foreground">
                {i + 1}
              </span>
            ))}
          </div>
        </WidgetFrame>
      );
    case "query_builder":
      return (
        <WidgetFrame title={str(node, "title", "Query Builder")} icon="filter" editing={editing} binding={<BindingTag node={node} property="query" />}>
          <div className="flex flex-wrap gap-1.5">
            {["Field", "Operator", "Value"].map((label) => (
              <span key={label} className="rounded-[2px] border border-border px-2 py-1 text-[11.5px] text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
        </WidgetFrame>
      );

    default:
      // custom widgets created in the Widget Builder
      return (
        <WidgetFrame
          title={str(node, "title") || definition?.label || node.type}
          icon={definition?.icon ?? "box"}
          editing={editing}
          binding={<BindingTag node={node} property="data" />}
        >
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Icon name="puzzle" className="size-3.5" />
            Custom widget · rendered by the InfraEase widget runtime
          </div>
          <SkeletonRows rows={2} cols={3} />
        </WidgetFrame>
      );
  }
}
