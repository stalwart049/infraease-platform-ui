import { workflowService } from "@/services/workflowService";
import type { Binding } from "../models/ui";

/**
 * Data binding metadata provider. Tables and fields come from the existing
 * InfraEase metadata service; nothing here is hardcoded per table.
 */

export interface BindingSourceMeta {
  id: string;
  label: string;
}

export const BINDING_SOURCES: BindingSourceMeta[] = [
  { id: "InfraEase Table", label: "InfraEase Table" },
  { id: "Current Record", label: "Current Record" },
  { id: "Widget Data", label: "Widget Data" },
  { id: "Session", label: "Session / Current User" },
];

export const dataBindingService = {
  async listTables(): Promise<{ name: string; label: string }[]> {
    const catalog = await workflowService.getCatalog();
    return catalog.tables.map((t) => ({ name: t.name, label: t.label }));
  },

  async listFields(tableName: string): Promise<{ name: string; label: string }[]> {
    if (!tableName) return [];
    const fields = await workflowService.getTableFields(tableName);
    return fields.map((f) => ({ name: f.name, label: f.label }));
  },

  /** Human readable summary shown in the inspector and on the canvas. */
  describe(binding: Binding | undefined): string | null {
    if (!binding || binding.kind === "none") return null;
    if (binding.kind === "expression") return binding.expression ? `= ${binding.expression}` : "= expression";
    if (binding.table && binding.field) return `${binding.table}.${binding.field}`;
    return binding.table || binding.source || "unbound";
  },
};
