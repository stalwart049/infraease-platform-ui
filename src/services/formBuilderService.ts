import { ApiError, mockRequest } from "./api";
import { getFormViewData, saveFormViewConfig } from "./mockDb";
import type { FormBuilderData, FormViewConfig, FormViewPayload } from "./types";

/**
 * Single place the Form Builder talks to the backend through.
 * Swap these two implementations for real fetch calls and the UI is unchanged.
 *   GET  /api/form_builder/{tableId}/{viewId}
 *   POST /api/form_builder
 */
export const formBuilderService = {
  async getFormView(tableId: string, viewId?: string): Promise<FormBuilderData> {
    return mockRequest(() => getFormViewData(tableId, viewId), 320);
  },

  async saveFormView(payload: FormViewPayload): Promise<FormViewConfig> {
    return mockRequest(() => {
      const config = payload.formView;
      if (!config.sections.length) {
        throw new ApiError("A form view needs at least one section.", 400);
      }
      return saveFormViewConfig(config);
    }, 520);
  },
};
