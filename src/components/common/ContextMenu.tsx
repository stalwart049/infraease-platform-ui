import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icon } from "./Icon";
import type { ActionMeta } from "@/services/types";
import { cn } from "@/lib/utils";

/** Hamburger context menu used by both FormView and ListView. */
export function RecordContextMenu({
  actions,
  onAction,
  label,
}: {
  actions: ActionMeta[];
  onAction: (action: ActionMeta) => void;
  label: string;
}) {
  const items = actions.filter((a) => a.in_menu);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${label} actions`}
          title={`${label} actions`}
          className="grid size-9 shrink-0 place-items-center rounded-[3px] border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        >
          <Icon name="menu" className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 rounded-[4px] p-1">
        {items.map((action) => (
          <div key={action.id}>
            {action.variant === "danger" && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={() => onAction(action)}
              className={cn(
                "gap-2 rounded-[3px] text-[13px]",
                action.variant === "danger" && "text-destructive focus:text-destructive",
              )}
            >
              <Icon name={action.icon} className="size-4" />
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
