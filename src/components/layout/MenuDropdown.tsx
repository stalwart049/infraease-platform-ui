import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@/components/common/Icon";
import { MenuTree } from "./MenuTree";
import { filterMenu } from "@/lib/menu-utils";
import type { MenuNode } from "@/services/types";
import { cn } from "@/lib/utils";

export function MenuDropdown({
  menu,
  open,
  onOpenChange,
  pinned,
  onPin,
  onUnpin,
}: {
  menu: MenuNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinned: boolean;
  onPin: () => void;
  onUnpin: () => void;
}) {
  const [term, setTerm] = useState("");
  const nodes = useMemo(() => filterMenu(menu.children ?? [], term), [menu, term]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-[3px] px-2.5 text-[13px] font-medium transition-colors",
            "text-nav-foreground/80 hover:bg-nav-hover hover:text-nav-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-nav-foreground",
            (open || pinned) && "bg-nav-hover text-nav-foreground",
          )}
        >
          <Icon name={menu.icon} className="size-3.5" />
          {menu.label}
          <Icon name="chevron-down" className="size-3 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-80 rounded-[4px] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <span className="text-[13px] font-semibold text-foreground">{menu.label}</span>
          <button
            type="button"
            onClick={pinned ? onUnpin : onPin}
            title={pinned ? "Unpin menu from sidebar" : "Pin menu as sidebar"}
            className="inline-flex items-center gap-1.5 rounded-[3px] px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          >
            <Icon name={pinned ? "pin-off" : "pin"} className="size-3.5" />
            {pinned ? "Unpin menu" : "Pin menu"}
          </button>
        </div>
        <div className="border-b border-border p-2">
          <label className="sr-only" htmlFor={`menu-search-${menu.id}`}>
            Search {menu.label} menu items
          </label>
          <div className="flex items-center gap-2 rounded-[3px] border border-input bg-background px-2 focus-within:border-ring">
            <Icon name="search" className="size-3.5 text-muted-foreground" />
            <input
              id={`menu-search-${menu.id}`}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search menu items..."
              className="h-8 w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {nodes.length ? (
            <MenuTree nodes={nodes} onNavigate={() => onOpenChange(false)} />
          ) : (
            <p className="px-2 py-6 text-center text-[13px] text-muted-foreground">No menu items match "{term}".</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
