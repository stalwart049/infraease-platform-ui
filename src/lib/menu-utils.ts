import type { MenuNode } from "@/services/types";

/** Recursively filters a menu tree, keeping branches that contain a match. */
export function filterMenu(nodes: MenuNode[], term: string): MenuNode[] {
  const q = term.trim().toLowerCase();
  if (!q) return nodes;
  const walk = (list: MenuNode[]): MenuNode[] =>
    list.reduce<MenuNode[]>((acc, node) => {
      const children = node.children ? walk(node.children) : [];
      const self = node.label.toLowerCase().includes(q);
      if (self || children.length) {
        acc.push({ ...node, children: children.length ? children : node.children && self ? node.children : [] });
      }
      return acc;
    }, []);
  return walk(nodes);
}

export function countLeaves(nodes: MenuNode[] | undefined): number {
  if (!nodes?.length) return 0;
  return nodes.reduce((n, node) => n + (node.route ? 1 : 0) + countLeaves(node.children), 0);
}
