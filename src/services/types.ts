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
  | "url";

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
}

export interface MenuNode {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  children?: MenuNode[];
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
