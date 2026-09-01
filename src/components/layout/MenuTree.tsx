import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";
import type { MenuNode } from "@/services/types";
import { cn } from "@/lib/utils";

/** Turns an API route string into type-safe router props. */
export function menuLinkProps(route: string) {
  const parts = route.split("/").filter(Boolean);
  if (parts[0] === "form" && parts[1]) {
    return { to: "/form/$tableName/$recordId" as const, params: { tableName: parts[1], recordId: parts[2] ?? "new" } };
  }
  return { to: "/list/$tableName" as const, params: { tableName: parts[1] ?? "incident" } };
}

export function MenuTree({
  nodes,
  depth = 0,
  onNavigate,
}: {
  nodes: MenuNode[];
  depth?: number;
  onNavigate?: () => void;
}) {
  return (
    <ul className={cn("space-y-px", depth > 0 && "mt-px")} role={depth === 0 ? "tree" : "group"}>
      {nodes.map((node) => {
        const hasChildren = !!node.children?.length;
        return (
          <li key={node.id}>
            {node.route ? (
              <Link
                {...menuLinkProps(node.route)}
                {...(onNavigate ? { onClick: onNavigate } : {})}
                activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}
                className="flex items-center gap-2 rounded-[3px] py-1.5 pr-2 text-[13px] text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                style={{ paddingLeft: 8 + depth * 14 }}
              >
                <Icon name={node.icon} className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{node.label}</span>
              </Link>
            ) : (
              <div
                className="flex items-center gap-2 py-1.5 pr-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                style={{ paddingLeft: 8 + depth * 14 }}
              >
                <Icon name={node.icon} className="size-3.5 shrink-0" />
                <span className="truncate">{node.label}</span>
              </div>
            )}
            {hasChildren && <MenuTree nodes={node.children!} depth={depth + 1} {...(onNavigate ? { onNavigate } : {})} />}
          </li>
        );
      })}
    </ul>
  );
}
