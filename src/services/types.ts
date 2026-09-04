// Frontend API contract for InfraEase. Everything the UI renders is described
// by these metadata shapes — no table-specific code anywhere in the UI.

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "select"
  | "reference"
  | "password"
  | "url"
  | "script";

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface FieldMeta {
  name: string;
  label: string;
  type: FieldType;
  mandatory?: boolean;
  readonly?: boolean;
  visible?: boolean;
  icon?: string;
  hint?: string;
  choices?: ChoiceOption[];
  reference_table?: string;
  display_field?: string;
  min_length?: number;
  max_length?: number;
  min?: number;
  max?: number;
  pattern?: string;
  pattern_message?: string;
  /** relative column width hint for list view */
  width?: number;
  /** the list view may group records by this field */
  groupable?: boolean;
}

export interface SectionMeta {
  id: string;
  label: string;
  fields: string[];
}

export interface ActionMeta {
  id: string;
  label: string;
  icon?: string;
  /** primary | default | danger */
  variant?: "primary" | "default" | "danger";
  /** show in the header button bar */
  in_header?: boolean;
  /** show in the hamburger context menu */
  in_menu?: boolean;
  confirm?: string;
}

export interface RelatedLink {
  id: string;
  label: string;
  icon?: string;
  href?: string;
}

export interface TableMeta {
  name: string;
  label: string;
  plural_label: string;
  display_field: string;
  id_field: string;
}

export interface FormMetadata {
  table: TableMeta;
  sections: SectionMeta[];
  fields: FieldMeta[];
  actions: ActionMeta[];
  related_links: RelatedLink[];
}

export interface ListMetadata {
  table: TableMeta;
  columns: FieldMeta[];
  actions: ActionMeta[];
  page_sizes: number[];
}

export type RecordValue = string | number | boolean | ReferenceValue | null | undefined;

export interface ReferenceValue {
  sys_id: string;
  display_value: string;
}

export type DataRecord = Record<string, RecordValue> & { sys_id: string };

export interface Page<T> {
  content: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ListQuery {
  page?: number;
  pageSize?: number;
  query?: string;
  sortBy?: string | null;
  sortOrder?: "asc" | "desc";
  filters?: FilterCondition[];
  groupBy?: string | null;
}


export interface MenuNode {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  children?: MenuNode[];
  /** message rendered by the UI when the API returns no children */
  empty_message?: string;
}

export interface ProfileInfo {
  name: string;
  title: string;
  organization: string;
  initials: string;
  notifications: number;
}

export interface ProfileMenuItem {
  id: string;
  label: string;
  icon: string;
  separator_before?: boolean;
}

// ---------------------------------------------------------------- filtering

export type FilterOperator =
  | "is"
  | "is_not"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "is_empty"
  | "is_not_empty"
  | "greater_than"
  | "less_than";

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

// ------------------------------------------------------------------ grouping

export interface GroupBucket {
  /** raw stored value ("" when the field is empty) */
  value: string;
  /** human readable label resolved from field metadata */
  label: string;
  /** total number of matching records in this group (server-wide) */
  count: number;
  /** records of this group that belong to the requested page */
  records: DataRecord[];
  /** how many of this group's records are on the requested page */
  page_count: number;
}

export interface GroupedPage<T> extends Page<T> {
  group_by: string | null;
  groups: GroupBucket[];
}

// ------------------------------------------------------------- global search

export interface SearchResult {
  table: string;
  table_label: string;
  sys_id: string;
  display_value: string;
  subtitle?: string;
  icon?: string;
  /** route the frontend should navigate to, provided by the API */
  route?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

// ---------------------------------------------------------------- favorites

export interface FavoriteItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
}

// ---------------------------------------------------------------- activities

export type ActivityType = "comment" | "work_note" | "system" | "field_change" | "attachment";

export interface ActivityAuthor {
  id?: string;
  displayName: string;
  initials?: string;
}

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  author: ActivityAuthor;
  createdAt: string;
  content: string;
  /** optional metadata for field_change entries */
  field_label?: string;
  old_value?: string;
  new_value?: string;
}

export interface ActivityTypeMeta {
  id: ActivityType;
  label: string;
  icon: string;
}

export interface ActivityStreamData {
  types: ActivityTypeMeta[];
  entries: ActivityEntry[];
  can_post: boolean;
}

// ------------------------------------------------------------- form builder

export type JournalType = "comments" | "work_notes" | "activity_stream";

export interface FormViewTableRef {
  sys_id: string;
  name: string;
  display_value: string;
}

export interface FormViewFieldRef {
  sys_id: string;
  name: string;
  display_value: string;
  /** backend field type, e.g. "string", "reference", "boolean" */
  type: string;
}

/** layout width of a field on the form canvas */
export type FieldWidth = "half" | "full";

export interface FormViewFieldItem {
  sys_id: string;
  type: "field";
  field: FormViewFieldRef;
  order: number;
  properties: { width: FieldWidth; mandatory: boolean; readonly: boolean; visible: boolean };
}


export interface FormViewJournalItem {
  sys_id: string;
  type: "journal";
  journalType: JournalType;
  label: string;
  order: number;
  properties: { visible: boolean };
}

export type FormViewItem = FormViewFieldItem | FormViewJournalItem;

export interface FormViewSection {
  sys_id: string;
  name: string;
  order: number;
  fields: FormViewItem[];
}

export interface FormViewConfig {
  sys_id: string;
  name: string;
  table: FormViewTableRef;
  sections: FormViewSection[];
}

export interface FormViewPayload {
  formView: FormViewConfig;
}

export type ClientScriptType = "onLoad" | "onChange" | "onSubmit" | "onCellEdit";

/** Read-only association. The form builder never creates or edits these. */
export interface ClientScriptRef {
  sys_id: string;
  name: string;
  type: ClientScriptType;
  field: string;
  table: string;
  active: boolean;
  route?: string;
}

export interface JournalComponentMeta {
  journalType: JournalType;
  label: string;
  description: string;
}

/** Everything the form builder needs to render, from the API. */
export interface FormBuilderData {
  formView: FormViewConfig;
  /** every field of the table, placed or not */
  fields: FormViewFieldRef[];
  journalComponents: JournalComponentMeta[];
  /** keyed by field name */
  clientScripts: Record<string, ClientScriptRef[]>;
  views: { sys_id: string; name: string }[];
}

// --------------------------------------------------------------- workflows

export type WorkflowNodeType = "start" | "trigger" | "condition" | "action" | "flow" | "end";

export interface WorkflowPosition {
  x: number;
  y: number;
}

export interface WorkflowConditionRow {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

export interface WorkflowFieldAssignment {
  id: string;
  field: string;
  value: string;
}

export interface WorkflowSwitchCase {
  id: string;
  label: string;
  value: string;
}

/** Free-form, but every key the builder writes is declared here. */
export interface WorkflowConfiguration {
  table?: string;
  record?: string;
  event?: string;
  schedule?: string;
  logic?: "AND" | "OR";
  conditions?: WorkflowConditionRow[];
  fields?: WorkflowFieldAssignment[];
  cases?: WorkflowSwitchCase[];
  /** field a Switch node evaluates */
  field?: string;
  branches?: number;
  join_mode?: "all" | "any";
  approver?: string;
  approval_type?: "user" | "group" | "manager";
  duration?: number;
  unit?: "minutes" | "hours" | "days";
  message?: string;
  subject?: string;
  body?: string;
  recipient?: string;
  script?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint?: string;
  payload?: string;
  subflow?: string;
  reason?: string;
}

export interface WorkflowNode {
  sys_id: string;
  type: WorkflowNodeType;
  subtype: string;
  label: string;
  description?: string;
  position: WorkflowPosition;
  disabled?: boolean;
  configuration: WorkflowConfiguration;
}

export interface WorkflowConnection {
  sys_id: string;
  source: string;
  source_handle: string;
  target: string;
  target_handle: string;
}

export interface WorkflowDefinition {
  sys_id: string;
  name: string;
  description?: string;
  table?: string;
  active: boolean;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export interface WorkflowSummary {
  sys_id: string;
  name: string;
  table?: string;
  active: boolean;
  node_count: number;
  updated_at: string;
}

export interface WorkflowHandleMeta {
  id: string;
  label: string;
}

export interface WorkflowComponentMeta {
  subtype: string;
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: string;
  /** static output handles; empty for terminal nodes */
  outputs: WorkflowHandleMeta[];
  /** node has no input handle */
  no_input?: boolean;
  /** outputs are derived from the configuration (switch cases, parallel branches) */
  dynamic_outputs?: "cases" | "branches";
  /** node accepts many incoming connections */
  multi_input?: boolean;
  /** required configuration keys */
  required?: string[];
}

export interface WorkflowComponentCategory {
  id: string;
  label: string;
  components: WorkflowComponentMeta[];
}

export interface WorkflowOperatorMeta {
  value: FilterOperator;
  label: string;
}

export interface WorkflowCatalog {
  categories: WorkflowComponentCategory[];
  tables: { name: string; label: string }[];
  operators: WorkflowOperatorMeta[];
  schedules: { value: string; label: string }[];
  events: { value: string; label: string }[];
}
