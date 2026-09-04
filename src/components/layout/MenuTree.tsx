import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";
import { useFavorites } from "@/hooks/useFavorites";
import { useMenuExpansion } from "@/hooks/useMenuExpansion";
import type { MenuNode } from "@/services/types";
import { cn } from "@/lib/utils";

/** Turns an API route string into type-safe router props. */
export function menuLinkProps(route: string) {
  const parts = route.split("/").filter(Boolean);
  if (parts[0] === "form" && parts[1]) {
    return { to: "/form/$tableName/$recordId" as const, params: { tableName: parts[1], recordId: parts[2] ?? "new" } };
  }
  if (parts[0] === "workflow") {
    return parts[1]
      ? ({ to: "/workflow/$workflowId" as const, params: { workflowId: parts[1] } })
      : ({ to: "/workflow" as const });
  }
  if (parts[0] === "builder" && parts[1]) {
    return { to: "/builder/$tableName" as const, params: { tableName: parts[1] } };
  }
  if (parts[0] === "search") {
    return { to: "/search" as const };
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
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { isExpanded, toggle: toggleExpanded } = useMenuExpansion();

  return (
    <ul className={cn("space-y-px", depth > 0 && "mt-px")} role={depth === 0 ? "tree" : "group"}>
      {nodes.map((node) => {
        const hasChildren = !!node.children?.length;
        const open = hasChildren ? isExpanded(node.id, depth === 0) : false;
        const favorite = isFavorite(node.id);
        const indent = 8 + depth * 14;

        const star = (
          <button
            type="button"
            aria-label={favorite ? `Remove ${node.label} from favorites` : `Add ${node.label} to favorites`}
            aria-pressed={favorite}
            title={favorite ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(node.id);
            }}
            className={cn(
              "grid size-5 shrink-0 place-items-center rounded-[3px] transition-colors hover:bg-background/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
              favorite ? "text-warning" : "text-muted-foreground/60 opacity-0 group-hover:opacity-100 focus:opacity-100",
              favorite && "opacity-100",
            )}
          >
            <Icon name="star" className={cn("size-3.5", favorite && "fill-current")} />
          </button>
        );

        const chevron = hasChildren ? (
          <button
            type="button"
            aria-label={open ? `Collapse ${node.label}` : `Expand ${node.label}`}
            aria-expanded={open}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleExpanded(node.id, depth === 0);
            }}
            className="grid size-5 shrink-0 place-items-center rounded-[3px] text-muted-foreground transition-colors hover:bg-background/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          >
            <Icon name={open ? "chevron-down" : "chevron-right"} className="size-3.5" />
          </button>
        ) : (
          <span className="size-5 shrink-0" aria-hidden="true" />
        );

        return (
          <li key={node.id}>
            <div className="group flex items-center gap-1 pr-1" style={{ paddingLeft: indent }}>
              {chevron}
              {node.route ? (
                <Link
                  {...menuLinkProps(node.route)}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                  activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-[3px] px-1.5 py-1.5 text-[13px] text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                >
                  <Icon name={node.icon} className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{node.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleExpanded(node.id, depth === 0)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-[3px] px-1.5 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Icon name={node.icon} className="size-3.5 shrink-0" />
                  <span className="truncate">{node.label}</span>
                </button>
              )}
              {star}
            </div>
            {hasChildren && open && (
              <MenuTree nodes={node.children!} depth={depth + 1} {...(onNavigate ? { onNavigate } : {})} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
