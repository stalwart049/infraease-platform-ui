import { mockRequest, ApiError } from "./api";
import { buildListMetadata, getTableData } from "./mockDb";
import type { DataRecord, ListMetadata, ListQuery, Page, RecordValue } from "./types";

function textOf(value: RecordValue): string {
  if (value == null) return "";
  if (typeof value === "object") return value.display_value ?? "";
  return String(value);
}

function compare(a: RecordValue, b: RecordValue) {
  const av = typeof a === "number" ? a : textOf(a).toLowerCase();
  const bv = typeof b === "number" ? b : textOf(b).toLowerCase();
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
}

export const listService = {
  async getListMetadata(tableName: string): Promise<ListMetadata> {
    return mockRequest(() => buildListMetadata(tableName), 180);
  },

  /** Server-side search + sort + pagination. */
  async getRecords(tableName: string, query: ListQuery = {}): Promise<Page<DataRecord>> {
    const { page = 0, pageSize = 10, query: q = "", sortBy = null, sortOrder = "asc" } = query;
    return mockRequest(() => {
      let rows = [...getTableData(tableName)];
      const term = q.trim().toLowerCase();
      if (term) {
        rows = rows.filter((row) =>
          Object.values(row).some((v) => textOf(v).toLowerCase().includes(term)),
        );
      }
      if (sortBy) {
        rows.sort((a, b) => compare(a[sortBy], b[sortBy]) * (sortOrder === "desc" ? -1 : 1));
      }
      const totalElements = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
      const safePage = Math.min(page, totalPages - 1);
      const start = safePage * pageSize;
      return {
        content: rows.slice(start, start + pageSize),
        page: safePage,
        pageSize,
        totalElements,
        totalPages,
      };
    }, 320);
  },

  /** Inline-edit patch of a single cell. */
  async patchRecord(
    tableName: string,
    recordId: string,
    patch: Record<string, RecordValue>,
  ): Promise<DataRecord> {
    return mockRequest(() => {
      const rows = getTableData(tableName);
      const record = rows.find((r) => r.sys_id === recordId);
      if (!record) throw new ApiError("Record not found.", 404);
      Object.assign(record, patch);
      return { ...record };
    }, 420);
  },
};
