import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { ActionButton } from "@/components/common/ActionButton";
import { isBefore, peekDrag, readDrag, startDrag, endDrag, type DragPayload } from "@/lib/builder-dnd";
import { itemLabel } from "@/lib/form-builder-utils";
import type { FormViewConfig, FormViewItem, FormViewSection } from "@/services/types";

interface CanvasProps {
  config: FormViewConfig;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDrop: (payload: DragPayload, sectionId: string, index: number) => void;
  onRemove: (itemId: string) => void;
  onRename: (sectionId: string, name: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, toIndex: number) => void;
  onAddSection: () => void;
}

export function BuilderCanvas(props: CanvasProps) {
  const { config, onAddSection } = props;
  const [sectionDropIndex, setSectionDropIndex] = useState<number | null>(null);

  function sectionDragOver(e: React.DragEvent, index: number, el: HTMLElement) {
    const drag = peekDrag();
    if (drag?.kind !== "section") return;
    e.preventDefault();
    setSectionDropIndex(isBefore(e, el) ? index : index + 1);
  }

  function sectionDrop(e: React.DragEvent) {
    const drag = readDrag(e);
    if (drag?.kind !== "section" || sectionDropIndex === null) return;
    e.preventDefault();
    props.onMoveSection(drag.sectionId, sectionDropIndex);
    setSectionDropIndex(null);
    endDrag();
  }

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

      <div className="space-y-3" onDragLeave={() => setSectionDropIndex(null)}>
        {config.sections.map((section, index) => (
          <div key={section.sys_id}>
            {sectionDropIndex === index && <DropLine />}
            <SectionCard
              {...props}
              section={section}
              index={index}
              onSectionDragOver={(e, el) => sectionDragOver(e, index, el)}
              onSectionDrop={sectionDrop}
            />
            {sectionDropIndex === index + 1 && index === config.sections.length - 1 && <DropLine />}
          </div>
        ))}

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
    </div>
  );
}

function DropLine() {
  return <div className="my-1 h-0.5 rounded bg-primary" />;
}

function SectionCard({
  config,
  section,
  index,
  selectedId,
  onSelect,
  onDrop,
  onRemove,
  onRename,
  onDeleteSection,
  onSectionDragOver,
  onSectionDrop,
}: CanvasProps & {
  section: FormViewSection;
  index: number;
  onSectionDragOver: (e: React.DragEvent, el: HTMLElement) => void;
  onSectionDrop: (e: React.DragEvent) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(section.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const [itemDropIndex, setItemDropIndex] = useState<number | null>(null);

  function commitRename() {
    setRenaming(false);
    const next = name.trim();
    if (next && next !== section.name) onRename(section.sys_id, next);
    else setName(section.name);
  }

  function itemDragOver(e: React.DragEvent, i: number, el: HTMLElement) {
    const drag = peekDrag();
    if (!drag || drag.kind === "section") return;
    e.preventDefault();
    e.stopPropagation();
    setItemDropIndex(isBefore(e, el) ? i : i + 1);
  }

  function bodyDragOver(e: React.DragEvent) {
    const drag = peekDrag();
    if (!drag || drag.kind === "section") return;
    e.preventDefault();
    if (itemDropIndex === null) setItemDropIndex(section.fields.length);
  }

  function bodyDrop(e: React.DragEvent) {
    const drag = readDrag(e);
    if (!drag || drag.kind === "section") return;
    e.preventDefault();
    e.stopPropagation();
    onDrop(drag, section.sys_id, itemDropIndex ?? section.fields.length);
    setItemDropIndex(null);
    endDrag();
  }

  return (
    <section
      className="overflow-hidden rounded-[4px] border border-border bg-surface"
      onDragOver={(e) => onSectionDragOver(e, e.currentTarget)}
      onDrop={onSectionDrop}
    >
      <header className="flex items-center gap-2 border-b border-border bg-surface-sunken px-3 py-2">
        <span
          draggable
          onDragStart={(e) => startDrag(e, { kind: "section", sectionId: section.sys_id })}
          onDragEnd={endDrag}
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
        className="min-h-16 p-2"
        onDragOver={bodyDragOver}
        onDragLeave={() => setItemDropIndex(null)}
        onDrop={bodyDrop}
      >
        {section.fields.map((item, i) => (
          <div key={item.sys_id} onDragOver={(e) => itemDragOver(e, i, e.currentTarget)}>
            {itemDropIndex === i && <DropLine />}
            <CanvasItem
              item={item}
              selected={selectedId === item.sys_id}
              onSelect={() => onSelect(item.sys_id)}
              onRemove={() => onRemove(item.sys_id)}
            />
            {itemDropIndex === i + 1 && i === section.fields.length - 1 && <DropLine />}
          </div>
        ))}

        {!section.fields.length && (
          <div
            className={cn(
              "rounded-[3px] border border-dashed px-4 py-6 text-center text-[12px]",
              itemDropIndex !== null ? "border-primary text-primary" : "border-border text-muted-foreground",
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
  selected,
  onSelect,
  onRemove,
}: {
  item: FormViewItem;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const journal = item.type === "journal";
  return (
    <div
      draggable
      onDragStart={(e) => startDrag(e, { kind: "item", itemId: item.sys_id })}
      onDragEnd={endDrag}
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
        "group mb-1 flex cursor-grab items-center gap-2 rounded-[3px] border px-2.5 py-2 text-[13px] transition-colors active:cursor-grabbing",
        journal ? "border-dashed bg-surface-sunken" : "bg-surface",
        selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40",
      )}
    >
      <Icon name="grip-vertical" className="size-3.5 text-muted-foreground" />
      <span className="flex-1 truncate text-foreground">{itemLabel(item)}</span>
      {journal && (
        <span className="rounded-[2px] border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          Journal
        </span>
      )}
      {item.properties.visible === false && (
        <Icon name="eye-off" className="size-3.5 text-muted-foreground" />
      )}
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
  );
}
