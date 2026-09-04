import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoriteService } from "@/services/favoriteService";
import type { FavoriteItem } from "@/services/types";

export function useFavorites() {
  const queryClient = useQueryClient();
  const query = useQuery<FavoriteItem[]>({
    queryKey: ["favorites"],
    queryFn: () => favoriteService.getFavorites(),
    staleTime: 60000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) =>
      on ? favoriteService.add(id) : favoriteService.remove(id),
    onSuccess: (items) => {
      queryClient.setQueryData(["favorites"], items);
      // the favorites menu section is served by the menu API — refresh it too
      void queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });

  const favorites = query.data ?? [];
  const ids = new Set(favorites.map((f) => f.id));

  const toggle = useCallback(
    (id: string) => mutation.mutate({ id, on: !ids.has(id) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutation, favorites],
  );

  return { favorites, isFavorite: (id: string) => ids.has(id), toggle, loading: query.isLoading };
}
