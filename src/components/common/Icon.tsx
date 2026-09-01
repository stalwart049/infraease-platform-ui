import * as Lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Maps a metadata icon name ("alert-circle") to a lucide component. */
export function resolveIcon(name?: string): LucideIcon | null {
  if (!name) return null;
  const pascal = name
    .split(/[-_ ]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  const registry = Lucide as unknown as Record<string, LucideIcon>;
  return registry[pascal] ?? null;
}

export function Icon({
  name,
  className = "size-4",
  strokeWidth = 1.75,
}: {
  name?: string | undefined;
  className?: string | undefined;
  strokeWidth?: number | undefined;
}) {
  const Cmp = resolveIcon(name);
  if (!Cmp) return null;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
