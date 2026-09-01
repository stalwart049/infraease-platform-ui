import { useMemo, useState } from "react";
import { Icon } from "@/components/common/Icon";
import { MenuTree } from "./MenuTree";
import { filterMenu } from "@/lib/menu-utils";
import type { MenuNode } from "@/services/types";

export function PinnedSidebar({
  menu,
  onUnpin,
  onNavigate,
}: {
  menu: MenuNode;
  onUnpin: () => void;
  onNavigate?: () => void;
}) {
  const [term, setTerm] = useState("");
  const nodes = useMemo(() => filterMenu(menu.children ?? [], term), [menu, term]);

  return (
    <nav aria-label={`${menu.label} navigation`} className="flex h-full w-full flex-col bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <span className="truncate text-[13px] font-semibold text-foreground">{menu.label}</span>
        <button
          type="button"
          onClick={onUnpin}
          title="Unpin menu"
          aria-label="Unpin menu"
          className="grid size-7 place-items-center rounded-[3px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        >
          <Icon name="pin-off" className="size-3.5" />
        </button>
      </div>
      <div className="border-b border-border p-2">
        <label className="sr-only" htmlFor="pinned-menu-search">
          Search {menu.label} menu items
        </label>
        <div className="flex items-center gap-2 rounded-[3px] border border-input bg-background px-2 focus-within:border-ring">
          <Icon name="search" className="size-3.5 text-muted-foreground" />
          <input
            id="pinned-menu-search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search"
            className="h-8 w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {nodes.length ? (
          <MenuTree nodes={nodes} {...(onNavigate ? { onNavigate } : {})} />
        ) : (
          <p className="px-2 py-6 text-center text-[13px] text-muted-foreground">No matches.</p>
        )}
      </div>
    </nav>
  );
}
