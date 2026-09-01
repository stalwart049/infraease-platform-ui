import { mockRequest } from "./api";
import { MENUS, PROFILE, PROFILE_MENU } from "./mockDb";
import type { MenuNode, ProfileInfo, ProfileMenuItem } from "./types";

export const menuService = {
  async getMenus(): Promise<MenuNode[]> {
    return mockRequest(() => MENUS, 160);
  },
  async getProfile(): Promise<ProfileInfo> {
    return mockRequest(() => PROFILE, 120);
  },
  async getProfileMenu(): Promise<ProfileMenuItem[]> {
    return mockRequest(() => PROFILE_MENU, 120);
  },
};
