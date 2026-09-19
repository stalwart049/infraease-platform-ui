import type { WidgetDefinition, WidgetSummary } from "../models/widget";
import { seedWidgets } from "../mock/widgets";
import { newId } from "../models/node-utils";

/** Service boundary for widget definitions — local adapter, real APIs later. */

const delay = (ms = 180) => new Promise<void>((r) => setTimeout(r, ms));

const store = new Map<string, WidgetDefinition>();
for (const widget of seedWidgets) store.set(widget.sys_id, widget);

function blankWidget(): WidgetDefinition {
  const seed = seedWidgets[0]!;
  return {
    sys_id: newId("wgt"),
    name: "new_widget",
    label: "New Widget",
    description: "",
    category: "General",
    icon: "box",
    active: false,
    status: "draft",
    files: {
      component: `export default function NewWidget({ data, properties }) {\n  return <div className="ie-widget">{properties.title ?? "New widget"}</div>;\n}`,
      style: `.ie-widget {\n  border: 1px solid #e2e8f0;\n  border-radius: 3px;\n  padding: 12px;\n}`,
      server: seed.files.server,
      client: seed.files.client,
    },
    properties: [],
    bindings: [],
    events: [],
    updated_at: "not saved",
  };
}

export const widgetApi = {
  async listWidgets(): Promise<WidgetSummary[]> {
    await delay(100);
    return [...store.values()].map((w) => ({
      sys_id: w.sys_id,
      name: w.name,
      label: w.label,
      category: w.category,
      icon: w.icon,
      active: w.active,
      updated_at: w.updated_at ?? "—",
    }));
  },

  async getWidget(widgetId: string): Promise<WidgetDefinition> {
    await delay();
    if (widgetId === "new") return blankWidget();
    const widget = store.get(widgetId);
    if (!widget) throw new Error(`Widget "${widgetId}" was not found.`);
    return structuredClone(widget);
  },

  async saveWidget(widget: WidgetDefinition): Promise<WidgetDefinition> {
    await delay(300);
    if (!widget.name.trim()) throw new Error("The widget needs a name before it can be saved.");
    const saved: WidgetDefinition = { ...structuredClone(widget), status: "saved", updated_at: "just now" };
    store.set(saved.sys_id, saved);
    return structuredClone(saved);
  },
};
