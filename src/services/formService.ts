import { ApiError, mockRequest } from "./api";
import { buildFormMetadata, getDefinition, getTableData } from "./mockDb";
import type { DataRecord, FormMetadata, RecordValue } from "./types";

function nextNumber(tableName: string) {
  const rows = getTableData(tableName);
  const prefix = tableName.slice(0, 3).toUpperCase();
  return `${prefix}${String(10001 + rows.length).padStart(7, "0")}`;
}

export const formService = {
  async getFormMetadata(tableName: string): Promise<FormMetadata> {
    return mockRequest(() => buildFormMetadata(tableName), 200);
  },

  async getRecord(tableName: string, recordId: string): Promise<DataRecord> {
    return mockRequest(() => {
      const rows = getTableData(tableName);
      const found =
        rows.find((r) => r.sys_id === recordId) ||
        rows.find((r) => String(r[getDefinition(tableName).table.display_field] ?? "") === recordId);
      if (!found) throw new ApiError(`Record ${recordId} was not found.`, 404);
      return { ...found };
    }, 300);
  },

  async createRecord(tableName: string, data: Record<string, RecordValue>): Promise<DataRecord> {
    return mockRequest(() => {
      const rows = getTableData(tableName);
      const def = getDefinition(tableName);
      const hasNumber = def.fields.some((f) => f.name === "number");
      const record: DataRecord = {
        ...data,
        sys_id: `${tableName.slice(0, 3)}${String(rows.length + 1).padStart(5, "0")}`,
      };
      if (hasNumber && !record["number"]) record["number"] = nextNumber(tableName);
      rows.unshift(record);
      return { ...record };
    }, 480);
  },

  async updateRecord(
    tableName: string,
    recordId: string,
    data: Record<string, RecordValue>,
  ): Promise<DataRecord> {
    return mockRequest(() => {
      const rows = getTableData(tableName);
      const record = rows.find((r) => r.sys_id === recordId);
      if (!record) throw new ApiError("Unable to save record. The record no longer exists.", 404);
      Object.assign(record, data);
      return { ...record };
    }, 480);
  },

  async deleteRecord(tableName: string, recordId: string): Promise<void> {
    return mockRequest(() => {
      const rows = getTableData(tableName);
      const idx = rows.findIndex((r) => r.sys_id === recordId);
      if (idx >= 0) rows.splice(idx, 1);
    }, 320);
  },
};
