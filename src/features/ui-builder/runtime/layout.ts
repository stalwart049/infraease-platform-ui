import type { CSSProperties } from "react";
import type { Breakpoint, UiNode } from "../models/ui";
import { resolveLayout } from "../models/node-utils";

const GRID_TYPES = new Set(["grid"]);
const FLEX_TYPES = new Set(["row", "column", "stack", "container", "section", "card", "split_pane", "page"]);

const px = (value?: string) => (value && value.trim() !== "" ? `${Number(value) || value}px` : undefined);

/** Style applied to the node itself (its own box inside the parent). */
export function selfStyle(node: UiNode, parent: UiNode | null, breakpoint: Breakpoint): CSSProperties {
  const layout = resolveLayout(node, breakpoint);
  const style: CSSProperties = {};
  const parentLayout = parent ? resolveLayout(parent, breakpoint) : null;
  const columns = parentLayout?.columns ?? (parent && GRID_TYPES.has(parent.type) ? 12 : null);

  if (parent && GRID_TYPES.has(parent.type) && layout.span) {
    style.gridColumn = `span ${Math.min(layout.span, columns ?? 12)} / span ${Math.min(layout.span, columns ?? 12)}`;
  } else if (parent && FLEX_TYPES.has(parent.type) && parentLayout?.direction === "row" && layout.span) {
    style.flex = `0 0 ${(Math.min(layout.span, 12) / 12) * 100}%`;
    style.maxWidth = `${(Math.min(layout.span, 12) / 12) * 100}%`;
  }

  if (layout.width) style.width = px(layout.width) ?? layout.width;
  if (layout.height) style.height = px(layout.height) ?? layout.height;
  if (layout.margin) style.margin = px(layout.margin);
  if (layout.align === "end") style.marginLeft = "auto";
  if (layout.align === "center") style.marginInline = "auto";

  const s = node.style;
  if (s.fontSize) style.fontSize = px(s.fontSize) ?? s.fontSize;
  if (s.fontWeight) style.fontWeight = s.fontWeight;
  if (s.color) style.color = s.color;
  if (s.background) style.background = s.background;
  if (s.border) style.border = s.border;
  if (s.radius) style.borderRadius = px(s.radius) ?? s.radius;
  if (s.shadow && s.shadow !== "none") style.boxShadow = s.shadow;

  return style;
}

/** Style applied to the node's children container. */
export function containerStyle(node: UiNode, breakpoint: Breakpoint): CSSProperties {
  const layout = resolveLayout(node, breakpoint);
  const style: CSSProperties = {};
  if (GRID_TYPES.has(node.type)) {
    style.display = "grid";
    style.gridTemplateColumns = `repeat(${layout.columns ?? 12}, minmax(0, 1fr))`;
  } else if (FLEX_TYPES.has(node.type)) {
    style.display = "flex";
    style.flexDirection = layout.direction === "row" ? "row" : "column";
    if (layout.direction === "row") style.flexWrap = "wrap";
    if (layout.align && layout.direction === "row") {
      style.alignItems = layout.align === "stretch" ? "stretch" : layout.align === "end" ? "flex-end" : layout.align === "center" ? "center" : "flex-start";
    }
  }
  if (layout.gap) style.gap = px(layout.gap);
  if (layout.padding) style.padding = px(layout.padding);
  return style;
}

export function isHidden(node: UiNode, breakpoint: Breakpoint): boolean {
  return resolveLayout(node, breakpoint).hidden === true;
}

export const VIEWPORT_WIDTH: Record<Breakpoint, number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};
