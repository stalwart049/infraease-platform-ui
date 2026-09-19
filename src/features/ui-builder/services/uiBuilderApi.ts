import type { ComponentCategory, UiPage, UiPageSummary } from "../models/ui";
import { buildCatalog, customWidgetDefinition } from "../mock/catalog";
import { pageStore } from "../mock/pages";
import { countNodes } from "../models/node-utils";
import { widgetApi } from "./widgetApi";

/**
 * Service boundary for the UI Builder. Every call is async and returns plain
 * metadata, so the local adapter below can be swapped for InfraEase endpoints
 * (GET/POST /api/ui/pages …) without touching any component.
 */

const delay = (ms = 200) => new Promise<void>((r) => setTimeout(r, ms));

export const uiBuilderApi = {
  async listPages(): Promise<UiPageSummary[]> {
    await delay(120);
    return [...pageStore.values()].map((p) => ({
      sys_id: p.sys_id,
      name: p.name,
      route: p.route,
      component_count: countNodes(p.root) - 1,
      updated_at: p.updated_at ?? "—",
    }));
  },

  async getPage(pageId: string): Promise<UiPage> {
    await delay();
    const page = pageStore.get(pageId);
    if (!page) throw new Error(`Page "${pageId}" was not found.`);
    return structuredClone(page);
  },

  async getComponentCatalog(): Promise<ComponentCategory[]> {
    await delay(80);
    const widgets = await widgetApi.listWidgets();
    return buildCatalog(widgets.filter((w) => w.active).map(customWidgetDefinition));
  },

  async savePage(page: UiPage): Promise<UiPage> {
    await delay(320);
    if (!page.name.trim()) throw new Error("The page needs a name before it can be saved.");
    const saved: UiPage = { ...structuredClone(page), updated_at: "just now" };
    pageStore.set(saved.sys_id, saved);
    return structuredClone(saved);
  },
};
