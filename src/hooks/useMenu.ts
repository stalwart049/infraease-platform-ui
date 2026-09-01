import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { menuService } from "@/services/menuService";

const PIN_KEY = "infraease.pinnedMenu";

export function useMenu() {
  const menusQuery = useQuery({ queryKey: ["menus"], queryFn: () => menuService.getMenus(), staleTime: 300000 });
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: () => menuService.getProfile(), staleTime: 300000 });
  const profileMenuQuery = useQuery({
    queryKey: ["profile-menu"],
    queryFn: () => menuService.getProfileMenu(),
    staleTime: 300000,
  });

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [pinnedMenuId, setPinnedMenuId] = useState<string | null>(null);

  // hydrate pinned menu from local storage after mount (SSR safe)
  useEffect(() => {
    const stored = window.localStorage.getItem(PIN_KEY);
    if (stored) setPinnedMenuId(stored);
  }, []);

  const pinMenu = useCallback((id: string) => {
    // only one pinned menu at a time — pinning replaces the previous one
    setPinnedMenuId(id);
    window.localStorage.setItem(PIN_KEY, id);
    setOpenMenu(null);
  }, []);

  const unpinMenu = useCallback(() => {
    setPinnedMenuId(null);
    window.localStorage.removeItem(PIN_KEY);
  }, []);

  const menus = menusQuery.data ?? [];
  const pinnedMenu = menus.find((m) => m.id === pinnedMenuId) ?? null;

  return {
    menus,
    loading: menusQuery.isLoading,
    profile: profileQuery.data ?? null,
    profileMenu: profileMenuQuery.data ?? [],
    openMenu,
    setOpenMenu,
    pinnedMenu,
    pinnedMenuId,
    pinMenu,
    unpinMenu,
  };
}
