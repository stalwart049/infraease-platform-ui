import { ApiError, mockRequest } from "./api";
import { buildFormMetadata } from "./mockDb";
import { findWorkflow, getCatalog, listWorkflowSummaries, persistWorkflow } from "./workflowStore";
import type { FieldMeta, WorkflowCatalog, WorkflowDefinition, WorkflowSummary } from "./types";

/**
 * The only place the Workflow Builder talks to the backend.
 * Replace each body with a fetch and the editor keeps working:
 *   GET  /api/workflow
 *   GET  /api/workflow/{id}
 *   POST /api/workflow
 *   GET  /api/workflow/catalog
 *   GET  /api/table/{table}/form  (field metadata for condition/action forms)
 */
export const workflowService = {
  async listWorkflows(): Promise<WorkflowSummary[]> {
    return mockRequest(() => listWorkflowSummaries(), 240);
  },

  async getWorkflow(workflowId: string): Promise<WorkflowDefinition> {
    return mockRequest(() => {
      const found = findWorkflow(workflowId);
      if (!found) throw new ApiError(`Workflow ${workflowId} was not found.`, 404);
      return found;
    }, 320);
  },

  async getCatalog(): Promise<WorkflowCatalog> {
    return mockRequest(() => getCatalog(), 180);
  },

  /** Field metadata used by condition rows and action field pickers. */
  async getTableFields(tableName: string): Promise<FieldMeta[]> {
    return mockRequest(() => buildFormMetadata(tableName).fields, 160);
  },

  async saveWorkflow(definition: WorkflowDefinition): Promise<WorkflowDefinition> {
    return mockRequest(() => {
      if (!definition.nodes.length) throw new ApiError("A workflow needs at least one node.", 400);
      return persistWorkflow(definition);
    }, 520);
  },
};
