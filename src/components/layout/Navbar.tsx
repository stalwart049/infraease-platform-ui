import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Icon } from "@/components/common/Icon";
import { MenuDropdown } from "./MenuDropdown";
import { UserProfileMenu } from "./UserProfileMenu";
import type { MenuNode, ProfileInfo, ProfileMenuItem } from "@/services/types";

export function Navbar({
  menus,
  loading,
  openMenu,
  setOpenMenu,
  pinnedMenuId,
  pinMenu,
  unpinMenu,
  profile,
  profileMenu,
  onToggleMobileNav,
}: {
  menus: MenuNode[];
  loading: boolean;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
  pinnedMenuId: string | null;
  pinMenu: (id: string) => void;
  unpinMenu: () => void;
  profile: ProfileInfo | null;
  profileMenu: ProfileMenuItem[];
  onToggleMobileNav: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 h-12 bg-nav text-nav-foreground">
      <div className="flex h-12 items-center gap-2 px-2 sm:px-3">
        <button
          type="button"
          onClick={onToggleMobileNav}
          aria-label="Toggle navigation menu"
          className="grid size-8 shrink-0 place-items-center rounded-[3px] text-nav-foreground transition-colors hover:bg-nav-hover md:hidden"
        >
          <Icon name="menu" className="size-4" />
        </button>

        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 rounded-[3px] px-1 py-1 transition-colors hover:bg-nav-hover"
        >
          <span className="grid size-6 place-items-center rounded-[4px] bg-nav-foreground text-[12px] font-black text-nav">
            IE
          </span>
          <span className="text-[14px] font-semibold tracking-[0.14em]">INFRAEASE</span>
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden min-w-0 flex-1 items-center gap-0.5 md:flex">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-20 animate-pulse rounded-[3px] bg-nav-hover" />
              ))
            : menus.map((menu) => (
                <MenuDropdown
                  key={menu.id}
                  menu={menu}
                  open={openMenu === menu.id}
                  onOpenChange={(o) => setOpenMenu(o ? menu.id : null)}
                  pinned={pinnedMenuId === menu.id}
                  onPin={() => pinMenu(menu.id)}
                  onUnpin={unpinMenu}
                />
              ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label={`Notifications${profile ? `: ${profile.notifications} unread` : ""}`}
            onClick={() => toast.info("Notification center is delivered by the InfraEase event service.")}
            className="relative grid size-8 place-items-center rounded-[3px] text-nav-foreground transition-colors hover:bg-nav-hover"
          >
            <Icon name="bell" className="size-4" />
            {!!profile?.notifications && (
              <span className="absolute right-1 top-1 grid min-w-3.5 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-3.5 text-destructive-foreground">
                {profile.notifications}
              </span>
            )}
          </button>
          <UserProfileMenu profile={profile} items={profileMenu} />
        </div>
      </div>
    </header>
  );
}
