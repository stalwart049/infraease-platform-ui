import type { Breakpoint, ComponentDefinition, LayoutConfig, UiNode } from "./ui";

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createNode(def: ComponentDefinition, overrides: Partial<UiNode> = {}): UiNode {
  const properties: Record<string, string | number | boolean> = {};
  for (const p of def.properties) {
    if (p.editor === "boolean") properties[p.name] = false;
    else if (p.editor === "number") properties[p.name] = 0;
    else properties[p.name] = p.options?.[0] ?? "";
  }
  return {
    id: newId("node"),
    type: def.type,
    name: def.label,
    properties,
    layout: { desktop: { ...(def.defaultLayout ?? {}) } },
    style: {},
    bindings: {},
    events: [],
    visibility: {},
    children: [],
    ...overrides,
  };
}

/** Resolved layout for a breakpoint: mobile falls back to tablet, tablet to desktop. */
export function resolveLayout(node: UiNode, breakpoint: Breakpoint): LayoutConfig {
  const desktop = node.layout.desktop ?? {};
  const tablet = { ...desktop, ...(node.layout.tablet ?? {}) };
  if (breakpoint === "desktop") return desktop;
  if (breakpoint === "tablet") return tablet;
  return { ...tablet, ...(node.layout.mobile ?? {}) };
}

export function findNode(root: UiNode, id: string): UiNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return null;
}

export function findParent(root: UiNode, id: string): UiNode | null {
  for (const child of root.children) {
    if (child.id === id) return root;
    const hit = findParent(child, id);
    if (hit) return hit;
  }
  return null;
}

export function mapNode(root: UiNode, id: string, fn: (node: UiNode) => UiNode): UiNode {
  if (root.id === id) return fn(root);
  return { ...root, children: root.children.map((c) => mapNode(c, id, fn)) };
}

export function removeNode(root: UiNode, id: string): UiNode {
  return {
    ...root,
    children: root.children.filter((c) => c.id !== id).map((c) => removeNode(c, id)),
  };
}

export function insertNode(root: UiNode, parentId: string, node: UiNode, index: number): UiNode {
  if (root.id === parentId) {
    const children = [...root.children];
    children.splice(Math.max(0, Math.min(index, children.length)), 0, node);
    return { ...root, children };
  }
  return { ...root, children: root.children.map((c) => insertNode(c, parentId, node, index)) };
}

export function cloneSubtree(node: UiNode): UiNode {
  return {
    ...structuredClone(node),
    id: newId("node"),
    children: node.children.map(cloneSubtree),
  };
}

export function isDescendant(root: UiNode, ancestorId: string, candidateId: string): boolean {
  const ancestor = findNode(root, ancestorId);
  if (!ancestor) return false;
  return !!findNode({ ...ancestor, id: "__scan__" }, candidateId);
}

export function countNodes(node: UiNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}
