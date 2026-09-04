import { mockRequest } from "./api";
import { buildMenus, PROFILE, PROFILE_MENU } from "./mockDb";
import type { MenuNode, ProfileInfo, ProfileMenuItem } from "./types";

export const menuService = {
  async getMenus(): Promise<MenuNode[]> {
    return mockRequest(() => buildMenus(), 160);
  },
  async getProfile(): Promise<ProfileInfo> {
    return mockRequest(() => PROFILE, 120);
  },
  async getProfileMenu(): Promise<ProfileMenuItem[]> {
    return mockRequest(() => PROFILE_MENU, 120);
  },
};
