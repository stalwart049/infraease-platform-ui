import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { ActionButton } from "@/components/common/ActionButton";
import { sectionBodyId, sectionId as sectionDndId } from "@/lib/builder-dnd";
import { itemLabel } from "@/lib/form-builder-utils";
import type { FormViewConfig, FormViewItem, FormViewSection } from "@/services/types";

interface CanvasProps {
  config: FormViewConfig;
  selectedId: string | null;
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (itemId: string) => void;
  onRename: (sectionId: string, name: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddSection: () => void;
}

export function BuilderCanvas(props: CanvasProps) {
  const { config, onAddSection } = props;

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-foreground">
          Form View: <span className="font-normal text-muted-foreground">{config.name}</span>
        </p>
        <ActionButton icon="plus" onClick={onAddSection}>
          Add Section
        </ActionButton>
      </div>

      <SortableContext
        items={config.sections.map((s) => sectionDndId(s.sys_id))}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {config.sections.map((section, index) => (
            <SectionCard key={section.sys_id} {...props} section={section} index={index} />
          ))}
        </div>
      </SortableContext>

      {!config.sections.length && (
        <div className="rounded-[4px] border border-dashed border-border px-6 py-14 text-center">
          <p className="text-[13px] text-muted-foreground">This form view has no sections yet.</p>
          <div className="mt-3 flex justify-center">
            <ActionButton icon="plus" variant="primary" onClick={onAddSection}>
              Add Section
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({
  config,
  section,
  index,
  selectedId,
  activeId,
  onSelect,
  onRemove,
  onRename,
  onDeleteSection,
}: CanvasProps & { section: FormViewSection; index: number }) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(section.name);
  const [menuOpen, setMenuOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sectionDndId(section.sys_id),
    data: { kind: "section", sectionId: section.sys_id, index, label: section.name },
  });

  const body = useDroppable({
    id: sectionBodyId(section.sys_id),
    data: { kind: "section-body", sectionId: section.sys_id, count: section.fields.length },
  });

  function commitRename() {
    setRenaming(false);
    const next = name.trim();
    if (next && next !== section.name) onRename(section.sys_id, next);
    else setName(section.name);
  }

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "overflow-hidden rounded-[4px] border border-border bg-surface",
        isDragging && "opacity-50",
      )}
    >
      <header className="flex items-center gap-2 border-b border-border bg-surface-sunken px-3 py-2">
        <span
          {...attributes}
          {...listeners}
          title="Drag to reorder section"
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <Icon name="grip-vertical" className="size-4" />
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground">{index + 1}</span>
        {renaming ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setName(section.name);
                setRenaming(false);
              }
            }}
            aria-label="Section name"
            className="h-7 flex-1 rounded-[3px] border border-primary bg-surface px-2 text-[13px] outline-none"
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => setRenaming(true)}
            className="flex-1 text-left text-[13px] font-semibold text-foreground"
          >
            {section.name}
          </button>
        )}
        <span className="text-[11px] text-muted-foreground">{section.fields.length} items</span>
        <div className="relative">
          <ActionButton
            icon="ellipsis-vertical"
            variant="ghost"
            aria-label={`Section actions for ${section.name}`}
            onClick={() => setMenuOpen((o) => !o)}
          />
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-[3px] border border-border bg-surface py-1 shadow-lg">
                <MenuItem
                  icon="pencil"
                  label="Rename section"
                  onClick={() => {
                    setMenuOpen(false);
                    setRenaming(true);
                  }}
                />
                <MenuItem
                  icon="trash-2"
                  label="Delete section"
                  destructive
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteSection(section.sys_id);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </header>

      <div
        ref={body.setNodeRef}
        className={cn(
          "min-h-20 p-3 transition-colors",
          body.isOver && activeId && "bg-primary/5",
        )}
      >
        <SortableContext items={section.fields.map((f) => f.sys_id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            {section.fields.map((item, i) => (
              <CanvasItem
                key={item.sys_id}
                item={item}
                sectionId={section.sys_id}
                index={i}
                selected={selectedId === item.sys_id}
                onSelect={() => onSelect(item.sys_id)}
                onRemove={() => onRemove(item.sys_id)}
              />
            ))}
          </div>
        </SortableContext>

        {!section.fields.length && (
          <div
            className={cn(
              "rounded-[3px] border border-dashed px-4 py-6 text-center text-[12px]",
              body.isOver && activeId ? "border-primary text-primary" : "border-border text-muted-foreground",
            )}
          >
            Drag fields or journal components here
          </div>
        )}
      </div>
      <p className="sr-only">Section {section.order} of the form view {config.name}</p>
    </section>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-muted",
        destructive ? "text-destructive" : "text-foreground",
      )}
    >
      <Icon name={icon} className="size-3.5" />
      {label}
    </button>
  );
}

function CanvasItem({
  item,
  sectionId,
  index,
  selected,
  onSelect,
  onRemove,
}: {
  item: FormViewItem;
  sectionId: string;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const journal = item.type === "journal";
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.sys_id,
    data: { kind: "item", itemId: item.sys_id, sectionId, index, label: itemLabel(item) },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative rounded-[3px] border px-2.5 py-2 transition-colors",
        journal ? "border-dashed bg-surface-sunken sm:col-span-2" : "bg-surface",
        selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          title="Drag to reposition"
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <Icon name="grip-vertical" className="size-3.5" />
        </span>
        <span className="flex-1 truncate text-[12px] font-medium text-foreground">{itemLabel(item)}</span>
        {journal && (
          <span className="rounded-[2px] border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Journal
          </span>
        )}
        {item.properties.visible === false && <Icon name="eye-off" className="size-3.5 text-muted-foreground" />}
        {selected && (
          <button
            type="button"
            aria-label={`Remove ${itemLabel(item)}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-[2px] p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Icon name="x" className="size-3.5" />
          </button>
        )}
      </div>
      {!journal && (
        <div className="mt-1 h-7 rounded-[3px] border border-border bg-canvas" aria-hidden="true" />
      )}
    </div>
  );
}
