import { mockRequest } from "./api";
import { SEARCHABLE_TABLES, getDefinition, getTableData } from "./mockDb";
import type { RecordValue, SearchResponse, SearchResult } from "./types";

function text(value: RecordValue): string {
  if (value == null) return "";
  if (typeof value === "object") return value.display_value ?? "";
  return String(value);
}

/**
 * Platform-wide search. The list of searchable entities comes from the API —
 * the UI never assumes which tables exist.
 */
export const globalSearchService = {
  /** Top matches for the navbar overlay. */
  async search(query: string, limit = 8): Promise<SearchResponse> {
    return collect(query, limit, 4, 280);
  },

  /** Every match across every searchable entity — powers the results page. */
  async searchAll(query: string, limit = 300): Promise<SearchResponse> {
    return collect(query, limit, limit, 340);
  },
};

function collect(
  query: string,
  limit: number,
  perTable: number,
  latency: number,
): Promise<SearchResponse> {
  const q = query.trim().toLowerCase();
  if (!q) return Promise.resolve({ query, results: [], total: 0 });

  return mockRequest(() => {
      const results: SearchResult[] = [];
      let total = 0;

      for (const entity of SEARCHABLE_TABLES) {
        const def = getDefinition(entity.table);
        const rows = getTableData(entity.table);
        const matches = rows.filter((row) =>
          Object.values(row).some((v) => text(v).toLowerCase().includes(q)),
        );
        total += matches.length;
        for (const row of matches.slice(0, perTable)) {
          const subtitleValue = entity.subtitle_field ? text(row[entity.subtitle_field]) : "";
          results.push({
            table: entity.table,
            table_label: def.table.label,
            sys_id: row.sys_id,
            display_value: text(row[def.table.display_field]) || row.sys_id,
            subtitle: subtitleValue || def.table.label,
            icon: entity.icon,
            route: `/form/${entity.table}/${row.sys_id}`,
          });
        }
      }

      return { query, results: results.slice(0, limit), total };
  }, latency);
}
