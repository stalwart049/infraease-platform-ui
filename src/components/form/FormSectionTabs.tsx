import type { SectionMeta } from "@/services/types";
import { cn } from "@/lib/utils";

export function FormSectionTabs({
  sections,
  activeId,
  onSelect,
  errorSections,
}: {
  sections: SectionMeta[];
  activeId: string;
  onSelect: (id: string) => void;
  errorSections: Set<string>;
}) {
  return (
    <div role="tablist" aria-label="Form sections" className="flex gap-0.5 overflow-x-auto border-b border-border">
      {sections.map((section) => {
        const active = section.id === activeId;
        return (
          <button
            key={section.id}
            role="tab"
            type="button"
            id={`tab-${section.id}`}
            aria-selected={active}
            aria-controls={`panel-${section.id}`}
            onClick={() => onSelect(section.id)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {section.label}
            {errorSections.has(section.id) && (
              <span className="ml-1.5 inline-block size-1.5 rounded-full bg-destructive align-middle" aria-label="has errors" />
            )}
          </button>
        );
      })}
    </div>
  );
}
