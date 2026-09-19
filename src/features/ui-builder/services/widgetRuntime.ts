import type { WidgetDefinition, WidgetServerResponse } from "../models/widget";
import { widgetPreviewData } from "../mock/widgets";

/**
 * Widget runtime contract:
 *   React component  <-  client.js  <- (request) -  server.js  <-  InfraEase data
 *
 * The real runtime will execute server.js on the InfraEase server. This local
 * adapter only returns structural preview data so the builder UI is usable.
 */

export interface WidgetInvocation {
  widget: WidgetDefinition;
  properties: Record<string, string>;
}

export const widgetRuntime = {
  /** Stand-in for the client.js -> server.js request. */
  async requestData({ widget }: WidgetInvocation): Promise<WidgetServerResponse> {
    await new Promise<void>((r) => setTimeout(r, 200));
    if (widget.bindings.length === 0) return { data: {} };
    return { data: widgetPreviewData };
  },

  /** Default property values declared on the widget definition. */
  resolveProperties(widget: WidgetDefinition, overrides: Record<string, string> = {}): Record<string, string> {
    const values: Record<string, string> = {};
    for (const property of widget.properties) values[property.name] = property.default;
    return { ...values, ...overrides };
  },
};
