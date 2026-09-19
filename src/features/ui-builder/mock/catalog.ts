import type { ComponentCategory, ComponentDefinition } from "../models/ui";

/**
 * Local component catalog. Replaceable by an InfraEase metadata endpoint —
 * the builder only consumes ComponentDefinition objects.
 */

const text = (name: string, label: string, bindable = true) =>
  ({ name, label, editor: "text", bindable }) as const;

const layoutComponents: ComponentDefinition[] = [
  {
    type: "container",
    label: "Container",
    icon: "square",
    category: "layout",
    container: true,
    properties: [{ name: "maxWidth", label: "Max width", editor: "select", options: ["full", "xl", "lg", "md"] }],
    defaultLayout: { padding: "16", gap: "12", direction: "column" },
  },
  {
    type: "section",
    label: "Section",
    icon: "rows-3",
    category: "layout",
    container: true,
    properties: [text("title", "Title")],
    defaultLayout: { padding: "12", gap: "12", direction: "column" },
  },
  {
    type: "row",
    label: "Row",
    icon: "columns-3",
    category: "layout",
    container: true,
    properties: [],
    defaultLayout: { direction: "row", gap: "12" },
  },
  {
    type: "column",
    label: "Column",
    icon: "rows-2",
    category: "layout",
    container: true,
    properties: [],
    defaultLayout: { direction: "column", gap: "12", span: 6 },
  },
  {
    type: "grid",
    label: "Grid",
    icon: "layout-grid",
    category: "layout",
    container: true,
    properties: [],
    defaultLayout: { columns: 12, gap: "12" },
  },
  {
    type: "stack",
    label: "Stack",
    icon: "layers",
    category: "layout",
    container: true,
    properties: [],
    defaultLayout: { direction: "column", gap: "8" },
  },
  {
    type: "split_pane",
    label: "Split Pane",
    icon: "panel-left",
    category: "layout",
    container: true,
    properties: [{ name: "ratio", label: "Ratio", editor: "select", options: ["50/50", "30/70", "70/30"] }],
    defaultLayout: { direction: "row", gap: "12" },
  },
  {
    type: "tabs",
    label: "Tabs",
    icon: "panels-top-left",
    category: "layout",
    container: true,
    properties: [text("tabs", "Tab labels (comma separated)", false)],
  },
  {
    type: "accordion",
    label: "Accordion",
    icon: "chevrons-up-down",
    category: "layout",
    container: true,
    properties: [text("title", "Title")],
  },
  {
    type: "card",
    label: "Card",
    icon: "square-dashed",
    category: "layout",
    container: true,
    properties: [text("title", "Title")],
    defaultLayout: { padding: "12", gap: "8", direction: "column", span: 4 },
  },
];

const basicComponents: ComponentDefinition[] = [
  { type: "text", label: "Text", icon: "type", category: "basic", properties: [text("value", "Text")] },
  {
    type: "heading",
    label: "Heading",
    icon: "heading",
    category: "basic",
    properties: [text("value", "Text"), { name: "level", label: "Level", editor: "select", options: ["h1", "h2", "h3"] }],
  },
  { type: "paragraph", label: "Paragraph", icon: "align-left", category: "basic", properties: [{ name: "value", label: "Text", editor: "textarea", bindable: true }] },
  {
    type: "button",
    label: "Button",
    icon: "mouse-pointer-click",
    category: "basic",
    events: ["onClick"],
    properties: [
      text("text", "Text"),
      { name: "variant", label: "Variant", editor: "select", options: ["primary", "default", "danger", "ghost"] },
      text("icon", "Icon", false),
      { name: "iconPosition", label: "Icon position", editor: "select", options: ["left", "right"] },
      text("tooltip", "Tooltip", false),
      { name: "disabled", label: "Disabled", editor: "boolean", bindable: true },
    ],
  },
  {
    type: "link",
    label: "Link",
    icon: "link",
    category: "basic",
    events: ["onClick"],
    properties: [text("text", "Text"), text("href", "Target", false)],
  },
  { type: "image", label: "Image", icon: "image", category: "basic", properties: [text("src", "Source"), text("alt", "Alt text", false)] },
  { type: "icon", label: "Icon", icon: "star", category: "basic", properties: [text("name", "Icon name", false)] },
  { type: "divider", label: "Divider", icon: "minus", category: "basic", properties: [] },
  {
    type: "badge",
    label: "Badge",
    icon: "tag",
    category: "basic",
    properties: [text("text", "Text"), { name: "tone", label: "Tone", editor: "select", options: ["neutral", "success", "warning", "danger"] }],
  },
  { type: "avatar", label: "Avatar", icon: "circle-user", category: "basic", properties: [text("initials", "Initials"), text("caption", "Caption")] },
  {
    type: "alert",
    label: "Alert",
    icon: "triangle-alert",
    category: "basic",
    properties: [text("title", "Title"), text("message", "Message"), { name: "tone", label: "Tone", editor: "select", options: ["info", "success", "warning", "danger"] }],
  },
  {
    type: "progress",
    label: "Progress",
    icon: "loader",
    category: "basic",
    properties: [text("label", "Label"), { name: "value", label: "Value (%)", editor: "number", bindable: true }],
  },
];

const widgetComponents: ComponentDefinition[] = [
  {
    type: "data_table",
    label: "Data Table",
    icon: "table",
    category: "widgets",
    dataAware: true,
    events: ["onRowClick"],
    properties: [
      text("title", "Title"),
      text("fields", "Fields", false),
      text("filter", "Filter", false),
      text("sort", "Sort", false),
      { name: "pageSize", label: "Page size", editor: "number" },
    ],
  },
  {
    type: "form_widget",
    label: "Form",
    icon: "clipboard-list",
    category: "widgets",
    dataAware: true,
    events: ["onSubmit"],
    properties: [text("title", "Title"), text("view", "Form view", false)],
  },
  { type: "record", label: "Record", icon: "file-text", category: "widgets", dataAware: true, properties: [text("title", "Title")] },
  { type: "list_widget", label: "List", icon: "list", category: "widgets", dataAware: true, properties: [text("title", "Title"), { name: "limit", label: "Limit", editor: "number" }] },
  {
    type: "chart",
    label: "Chart",
    icon: "chart-column",
    category: "widgets",
    dataAware: true,
    properties: [text("title", "Title"), { name: "chartType", label: "Chart type", editor: "select", options: ["bar", "line", "donut"] }, text("groupBy", "Group by", false)],
  },
  {
    type: "kpi",
    label: "KPI",
    icon: "gauge",
    category: "widgets",
    dataAware: true,
    properties: [text("label", "Label"), text("value", "Value"), text("trend", "Trend"), { name: "tone", label: "Tone", editor: "select", options: ["neutral", "success", "warning", "danger"] }],
  },
  { type: "activity_stream", label: "Activity Stream", icon: "message-square", category: "widgets", dataAware: true, properties: [text("title", "Title")] },
  { type: "calendar", label: "Calendar", icon: "calendar", category: "widgets", dataAware: true, properties: [text("title", "Title")] },
  { type: "query_builder", label: "Query Builder", icon: "filter", category: "widgets", dataAware: true, properties: [text("title", "Title")] },
];

/** Custom widgets are surfaced from the Widget Builder registry. */
export function customWidgetDefinition(widget: {
  sys_id: string;
  name: string;
  label: string;
  icon: string;
}): ComponentDefinition {
  return {
    type: `custom:${widget.name}`,
    label: widget.label,
    icon: widget.icon,
    category: "custom",
    widgetId: widget.sys_id,
    dataAware: true,
    properties: [text("title", "Title")],
    description: "Developer-created widget",
  };
}

export function buildCatalog(custom: ComponentDefinition[]): ComponentCategory[] {
  return [
    { id: "layout", label: "Layout", components: layoutComponents },
    { id: "basic", label: "Basic", components: basicComponents },
    { id: "widgets", label: "Widgets", components: widgetComponents },
    { id: "custom", label: "Custom Widgets", components: custom },
  ];
}

export function indexCatalog(categories: ComponentCategory[]): Record<string, ComponentDefinition> {
  const index: Record<string, ComponentDefinition> = {};
  for (const category of categories) for (const c of category.components) index[c.type] = c;
  return index;
}
