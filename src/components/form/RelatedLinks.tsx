import { toast } from "sonner";
import { Icon } from "@/components/common/Icon";
import type { RelatedLink } from "@/services/types";

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  if (!links.length) return null;
  return (
    <section className="border-t border-border px-4 py-4 sm:px-6">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">Related Links</h2>
      <ul className="mt-2.5 flex flex-wrap gap-x-6 gap-y-2">
        {links.map((link) => (
          <li key={link.id}>
            <button
              type="button"
              onClick={() => toast.info(`${link.label} is provided by the InfraEase backend.`)}
              className="inline-flex items-center gap-1.5 text-[13px] text-primary transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <Icon name={link.icon} className="size-3.5" />
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
