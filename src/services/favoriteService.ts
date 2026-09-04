import { mockRequest } from "./api";
import { findMenuNode, getFavoriteIds, setFavorite } from "./mockDb";
import type { FavoriteItem } from "./types";

/**
 * User personalization API.
 *   GET    /api/user/favorites
 *   POST   /api/user/favorites
 *   DELETE /api/user/favorites/{menuItemId}
 */
export const favoriteService = {
  async getFavorites(): Promise<FavoriteItem[]> {
    return mockRequest(() => toItems(getFavoriteIds()), 140);
  },

  async add(menuItemId: string): Promise<FavoriteItem[]> {
    return mockRequest(() => toItems(setFavorite(menuItemId, true)), 180);
  },

  async remove(menuItemId: string): Promise<FavoriteItem[]> {
    return mockRequest(() => toItems(setFavorite(menuItemId, false)), 180);
  },
};

function toItems(ids: string[]): FavoriteItem[] {
  return ids
    .map((id) => {
      const node = findMenuNode(id);
      if (!node) return null;
      const item: FavoriteItem = { id: node.id, label: node.label };
      if (node.icon) item.icon = node.icon;
      if (node.route) item.route = node.route;
      return item;
    })
    .filter((f): f is FavoriteItem => f !== null);
}
