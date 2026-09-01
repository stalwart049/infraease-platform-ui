import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listService } from "@/services/listService";
import type { ListMetadata, Page, DataRecord } from "@/services/types";

export function useList(tableName: string) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const metaQuery = useQuery<ListMetadata>({
    queryKey: ["list-meta", tableName],
    queryFn: () => listService.getListMetadata(tableName),
  });

  const recordsKey = ["records", tableName, page, pageSize, debouncedQuery, sortBy, sortOrder] as const;
  const recordsQuery = useQuery<Page<DataRecord>>({
    queryKey: recordsKey,
    queryFn: () => listService.getRecords(tableName, { page, pageSize, query: debouncedQuery, sortBy, sortOrder }),
    placeholderData: (prev) => prev,
  });

  const toggleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(column);
        setSortOrder("asc");
      }
      setPage(0);
    },
    [sortBy],
  );

  const records = recordsQuery.data?.content ?? [];

  const toggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const allOnPage = records.every((r) => prev.has(r.sys_id)) && records.length > 0;
      const next = new Set(prev);
      records.forEach((r) => (allOnPage ? next.delete(r.sys_id) : next.add(r.sys_id)));
      return next;
    });
  }, [records]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["records", tableName] });
  }, [queryClient, tableName]);

  const pageInfo = useMemo(() => {
    const data = recordsQuery.data;
    const total = data?.totalElements ?? 0;
    const from = total === 0 ? 0 : page * pageSize + 1;
    const to = Math.min(total, (page + 1) * pageSize);
    return { from, to, total, totalPages: data?.totalPages ?? 1 };
  }, [recordsQuery.data, page, pageSize]);

  return {
    meta: metaQuery.data ?? null,
    columns: metaQuery.data?.columns ?? [],
    records,
    loading: recordsQuery.isLoading || metaQuery.isLoading,
    fetching: recordsQuery.isFetching,
    error: (recordsQuery.error ?? metaQuery.error) as Error | null,
    page,
    setPage,
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(0);
    },
    query,
    setQuery,
    debouncedQuery,
    sortBy,
    sortOrder,
    toggleSort,
    selected,
    toggleRow,
    toggleAll,
    clearSelection: () => setSelected(new Set()),
    pageInfo,
    refresh,
  };
}
