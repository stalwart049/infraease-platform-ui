/**
 * UI Builder metadata model.
 * A page is a tree of UiNode metadata objects — never hardcoded React pages.
 * This model is serializable and can be sent to the InfraEase backend as-is.
 */

export type Breakpoint = "desktop" | "tablet" | "mobile";

export const BREAKPOINTS: Breakpoint[] = ["desktop", "tablet", "mobile"];

export interface LayoutConfig {
  /** number of columns for grid-ish containers */
  columns?: number;
  /** how many columns this node spans inside a grid parent */
  span?: number;
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  gap?: string;
  align?: "start" | "center" | "end" | "stretch";
  direction?: "row" | "column";
  hidden?: boolean;
}

export interface StyleConfig {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  background?: string;
  border?: string;
  radius?: string;
  shadow?: string;
}

export type BindingKind = "none" | "table" | "expression";

export interface Binding {
  kind: BindingKind;
  /** e.g. "InfraEase Table" */
  source?: string;
  table?: string;
  field?: string;
  expression?: string;
}

export type ActionType =
  | "navigate"
  | "create_record"
  | "update_record"
  | "delete_record"
  | "refresh_data"
  | "open_modal"
  | "close_modal"
  | "run_workflow"
  | "call_server_script";

export interface ActionConfig {
  id: string;
  type: ActionType;
  params: Record<string, string>;
}

export interface EventConfig {
  id: string;
  /** onClick, onChange, onRowSelect … supplied by the component definition */
  event: string;
  actions: ActionConfig[];
}

export interface VisibilityConfig {
  /** expression evaluated by the runtime, e.g. currentUser.canEdit == true */
  when?: string;
}

export interface UiNode {
  id: string;
  /** component definition type from the component catalog */
  type: string;
  name?: string;
  properties: Record<string, string | number | boolean>;
  layout: Partial<Record<Breakpoint, LayoutConfig>>;
  style: StyleConfig;
  /** property name -> binding */
  bindings: Record<string, Binding>;
  events: EventConfig[];
  visibility: VisibilityConfig;
  children: UiNode[];
}

export interface UiPage {
  sys_id: string;
  name: string;
  route: string;
  description?: string;
  root: UiNode;
  updated_at?: string;
}

export interface UiPageSummary {
  sys_id: string;
  name: string;
  route: string;
  component_count: number;
  updated_at: string;
}

/* ---------- component catalog ---------- */

export type PropertyEditorType = "text" | "textarea" | "number" | "boolean" | "select" | "color";

export interface PropertySchema {
  name: string;
  label: string;
  editor: PropertyEditorType;
  options?: string[];
  placeholder?: string;
  /** property can be bound to data */
  bindable?: boolean;
}

export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  category: "layout" | "basic" | "widgets" | "custom";
  /** accepts children on the canvas */
  container?: boolean;
  /** custom widget created through the Widget Builder */
  widgetId?: string;
  description?: string;
  properties: PropertySchema[];
  /** events this component can raise */
  events?: string[];
  /** exposes the Data tab */
  dataAware?: boolean;
  defaultLayout?: LayoutConfig;
}

export interface ComponentCategory {
  id: ComponentDefinition["category"];
  label: string;
  components: ComponentDefinition[];
}
