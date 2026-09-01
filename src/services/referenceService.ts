import { mockRequest, ApiError } from "./api";
import { buildFormMetadata, getDefinition, getTableData } from "./mockDb";
import type { DataRecord, FieldMeta, ReferenceValue } from "./types";

export interface ReferencePreview {
  table_label: string;
  title: string;
  sys_id: string;
  fields: { label: string; value: string; icon?: string }[];
}

function displayOf(record: DataRecord, field: string) {
  return String(record[field] ?? record["name"] ?? record.sys_id);
}

export const referenceService = {
  async search(tableName: string, term: string, displayField = "name"): Promise<ReferenceValue[]> {
    return mockRequest(() => {
      const q = term.trim().toLowerCase();
      return getTableData(tableName)
        .filter((r) => (q ? displayOf(r, displayField).toLowerCase().includes(q) : true))
        .slice(0, 12)
        .map((r) => ({ sys_id: r.sys_id, display_value: displayOf(r, displayField) }));
    }, 300);
  },

  async getPreview(tableName: string, recordId: string, displayField = "name"): Promise<ReferencePreview> {
    return mockRequest(() => {
      const record = getTableData(tableName).find((r) => r.sys_id === recordId);
      if (!record) throw new ApiError("Referenced record not found.", 404);
      const meta = buildFormMetadata(tableName);
      const preview = meta.fields
        .filter((f: FieldMeta) => f.name !== displayField && f.type !== "textarea")
        .slice(0, 6)
        .map((f) => {
          const raw = record[f.name];
          const value =
            raw == null || raw === ""
              ? "—"
              : typeof raw === "object"
                ? raw.display_value
                : typeof raw === "boolean"
                  ? raw
                    ? "Yes"
                    : "No"
                  : String(raw);
          return f.icon ? { label: f.label, value, icon: f.icon } : { label: f.label, value };
        });
      return {
        table_label: getDefinition(tableName).table.label,
        title: displayOf(record, displayField),
        sys_id: record.sys_id,
        fields: preview,
      };
    }, 320);
  },
};
