/**
 * Widget Builder model.
 * A widget definition is metadata + four source files, mirroring the
 * InfraEase widget runtime contract:
 *   React component  <-  client.js  <- (request) -  server.js  <-  InfraEase data
 */

export type WidgetFileId = "component" | "style" | "server" | "client";

export type WidgetLanguage = "javascript" | "css";

export interface WidgetFileMeta {
  id: WidgetFileId;
  label: string;
  fileName: string;
  language: WidgetLanguage;
  icon: string;
}

export const WIDGET_FILES: WidgetFileMeta[] = [
  { id: "component", label: "HTML (React)", fileName: "Component.jsx", language: "javascript", icon: "file-code-2" },
  { id: "style", label: "Style.css", fileName: "Style.css", language: "css", icon: "palette" },
  { id: "server", label: "server.js", fileName: "server.js", language: "javascript", icon: "server" },
  { id: "client", label: "client.js", fileName: "client.js", language: "javascript", icon: "monitor" },
];

export interface WidgetProperty {
  id: string;
  name: string;
  type: "String" | "Number" | "Boolean" | "Reference" | "Object";
  default: string;
  required: boolean;
  description?: string;
}

export interface WidgetBinding {
  id: string;
  name: string;
  dataType: "Record" | "RecordList" | "Aggregate" | "Value";
  source: string;
  description?: string;
}

export interface WidgetEvent {
  id: string;
  name: string;
  description: string;
}

export interface WidgetDefinition {
  sys_id: string;
  name: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  active: boolean;
  status: "draft" | "saved";
  files: Record<WidgetFileId, string>;
  properties: WidgetProperty[];
  bindings: WidgetBinding[];
  events: WidgetEvent[];
  updated_at?: string;
}

export interface WidgetSummary {
  sys_id: string;
  name: string;
  label: string;
  category: string;
  icon: string;
  active: boolean;
  updated_at: string;
}

/** Response contract the client script receives from the server script. */
export interface WidgetServerResponse {
  data: unknown;
  error?: string;
}
