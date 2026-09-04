import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { globalSearchService } from "@/services/globalSearchService";
import type { SearchResponse } from "@/services/types";

/** Debounced platform-wide search. Never calls the API for an empty term. */
export function useGlobalSearch(term: string, debounceMs = 300) {
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [term, debounceMs]);

  const query = useQuery<SearchResponse>({
    queryKey: ["global-search", debounced],
    queryFn: () => globalSearchService.search(debounced),
    enabled: debounced.length > 0,
    staleTime: 30000,
  });

  return {
    debounced,
    results: query.data?.results ?? [],
    total: query.data?.total ?? 0,
    loading: debounced.length > 0 && (query.isLoading || query.isFetching),
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
