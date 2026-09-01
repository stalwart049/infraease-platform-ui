import { useState, type ReactNode } from "react";
import { useMenu } from "@/hooks/useMenu";
import { Navbar } from "./Navbar";
import { PinnedSidebar } from "./PinnedSidebar";
import { MenuTree } from "./MenuTree";

export function AppShell({ children }: { children: ReactNode }) {
  const menu = useMenu();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar
        menus={menu.menus}
        loading={menu.loading}
        openMenu={menu.openMenu}
        setOpenMenu={menu.setOpenMenu}
        pinnedMenuId={menu.pinnedMenuId}
        pinMenu={menu.pinMenu}
        unpinMenu={menu.unpinMenu}
        profile={menu.profile}
        profileMenu={menu.profileMenu}
        onToggleMobileNav={() => setMobileNavOpen((o) => !o)}
      />

      {mobileNavOpen && (
        <nav
          aria-label="Mobile navigation"
          className="max-h-[60vh] overflow-y-auto border-b border-border bg-surface p-2 md:hidden"
        >
          {menu.menus.map((m) => (
            <div key={m.id} className="mb-2">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {m.label}
              </p>
              <MenuTree nodes={m.children ?? []} onNavigate={() => setMobileNavOpen(false)} />
            </div>
          ))}
        </nav>
      )}

      <div className="flex min-h-0 flex-1">
        {menu.pinnedMenu && (
          <aside className="hidden w-64 shrink-0 border-r border-border md:block">
            <div className="sticky top-12 max-h-[calc(100vh-3rem)] overflow-y-auto">
              <PinnedSidebar menu={menu.pinnedMenu} onUnpin={menu.unpinMenu} />
            </div>
          </aside>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
