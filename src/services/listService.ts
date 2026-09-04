import { mockRequest, ApiError } from "./api";
import { buildListMetadata, getTableData } from "./mockDb";
import type {
  DataRecord,
  FieldMeta,
  GroupBucket,
  GroupedPage,
  FilterCondition,
  ListMetadata,
  ListQuery,
  RecordValue,
} from "./types";

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

/** Server-side evaluation of one condition against one record. */
function matches(row: DataRecord, c: FilterCondition): boolean {
  const raw = row[c.field];
  const cell = textOf(raw).toLowerCase();
  const target = (c.value ?? "").trim().toLowerCase();
  switch (c.operator) {
    case "is":
      return cell === target;
    case "is_not":
      return cell !== target;
    case "contains":
      return cell.includes(target);
    case "not_contains":
      return !cell.includes(target);
    case "starts_with":
      return cell.startsWith(target);
    case "is_empty":
      return cell === "";
    case "is_not_empty":
      return cell !== "";
    case "greater_than":
    case "less_than": {
      const an = Number(raw);
      const bn = Number(c.value);
      if (!Number.isNaN(an) && !Number.isNaN(bn)) {
        return c.operator === "greater_than" ? an > bn : an < bn;
      }
      return c.operator === "greater_than" ? cell > target : cell < target;
    }
    default:
      return true;
  }
}

function isActive(c: FilterCondition) {
  return (
    Boolean(c.field) &&
    (c.operator === "is_empty" || c.operator === "is_not_empty" || c.value.trim().length > 0)
  );
}

/** Groups the matching rows server-side and attaches the current page slice. */
function buildGroups(
  tableName: string,
  groupBy: string,
  allRows: DataRecord[],
  pageRows: DataRecord[],
): GroupBucket[] {
  const field: FieldMeta | undefined = buildListMetadata(tableName).columns.find(
    (c) => c.name === groupBy,
  );
  const counts = new Map<string, number>();
  allRows.forEach((row) => {
    const key = groupKey(row[groupBy]);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const order: string[] = [];
  const byKey = new Map<string, DataRecord[]>();
  pageRows.forEach((row) => {
    const key = groupKey(row[groupBy]);
    if (!byKey.has(key)) {
      byKey.set(key, []);
      order.push(key);
    }
    byKey.get(key)!.push(row);
  });

  return order.map((key) => ({
    value: key,
    label: groupLabel(key, field),
    count: counts.get(key) ?? byKey.get(key)!.length,
    records: byKey.get(key)!,
  }));
}

function groupKey(value: RecordValue): string {
  if (value == null || value === "") return "";
  if (typeof value === "object") return value.display_value ?? "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function groupLabel(key: string, field?: FieldMeta): string {
  if (key === "") return "(empty)";
  if (field?.type === "boolean") return key === "true" ? "Yes" : "No";
  const opt = field?.choices?.find((c) => c.value === key);
  return opt ? opt.label : key;
}

export const listService = {
  async getListMetadata(tableName: string): Promise<ListMetadata> {
    return mockRequest(() => buildListMetadata(tableName), 180);
  },

  /** Server-side search + condition filters + sort + grouping + pagination. */
  async getRecords(tableName: string, query: ListQuery = {}): Promise<GroupedPage<DataRecord>> {
    const {
      page = 0,
      pageSize = 10,
      query: q = "",
      sortBy = null,
      sortOrder = "asc",
      filters = [],
      groupBy = null,
    } = query;
    return mockRequest(() => {
      let rows = [...getTableData(tableName)];
      const term = q.trim().toLowerCase();
      if (term) {
        rows = rows.filter((row) =>
          Object.values(row).some((v) => textOf(v).toLowerCase().includes(term)),
        );
      }
      const active = filters.filter(isActive);
      if (active.length) {
        rows = rows.filter((row) => active.every((c) => matches(row, c)));
      }
      if (sortBy) {
        rows.sort((a, b) => compare(a[sortBy], b[sortBy]) * (sortOrder === "desc" ? -1 : 1));
      }
      const totalElements = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
      const safePage = Math.min(page, totalPages - 1);
      const start = safePage * pageSize;
      const content = rows.slice(start, start + pageSize);
      return {
        content,
        page: safePage,
        pageSize,
        totalElements,
        totalPages,
        group_by: groupBy,
        groups: groupBy ? buildGroups(tableName, groupBy, rows, content) : [],
      };
    }, 320);
  },

  /** Bulk delete of the selected records. */
  async deleteRecords(tableName: string, ids: string[]): Promise<number> {
    return mockRequest(() => {
      const rows = getTableData(tableName);
      let removed = 0;
      ids.forEach((id) => {
        const idx = rows.findIndex((r) => r.sys_id === id);
        if (idx >= 0) {
          rows.splice(idx, 1);
          removed += 1;
        }
      });
      return removed;
    }, 480);
  },

  /** Bulk field update across the selected records. */
  async updateRecords(
    tableName: string,
    ids: string[],
    patch: Record<string, RecordValue>,
  ): Promise<number> {
    return mockRequest(() => {
      const rows = getTableData(tableName);
      let updated = 0;
      ids.forEach((id) => {
        const record = rows.find((r) => r.sys_id === id);
        if (record) {
          Object.assign(record, patch);
          updated += 1;
        }
      });
      return updated;
    }, 520);
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
