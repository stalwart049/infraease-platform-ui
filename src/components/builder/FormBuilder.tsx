import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { FieldPalette } from "./FieldPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { FieldProperties } from "./FieldProperties";
import { ActionButton } from "@/components/common/ActionButton";
import { StateBlock } from "@/components/form/FormView";
import { scriptsForItem } from "@/lib/form-builder-utils";
import type { DragPayload } from "@/lib/builder-dnd";

export function FormBuilder({ tableName, viewId }: { tableName: string; viewId?: string }) {
  const navigate = useNavigate();
  const b = useFormBuilder(tableName, viewId);

  // warn before losing an unsaved layout
  useEffect(() => {
    if (!b.dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [b.dirty]);

  function handleDrop(payload: DragPayload, sectionId: string, index: number) {
    if (payload.kind === "field") b.addField(payload.name, sectionId, index);
    else if (payload.kind === "journal") b.addJournal(payload.journalType, sectionId, index);
    else if (payload.kind === "item") b.moveItem(payload.itemId, sectionId, index);
  }

  if (b.error) {
    return (
      <StateBlock
        icon="triangle-alert"
        title="Unable to load the form view."
        body="The form view configuration could not be retrieved."
        action={<ActionButton icon="refresh-cw" onClick={() => b.reload()}>Retry</ActionButton>}
      />
    );
  }

  const tableLabel = b.config?.table.display_value ?? tableName.replace(/_/g, " ");

  return (
    <div className="min-h-full bg-canvas pb-10">
      <header className="sticky top-12 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold text-foreground">Form Builder</h1>
            <p className="truncate text-[12px] text-muted-foreground">
              Table: {tableLabel} · View: {b.config?.name ?? "Default"}
              {b.dirty && <span className="ml-2 text-[11px] text-muted-foreground">Unsaved changes</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              icon="x"
              onClick={() => navigate({ to: "/list/$tableName", params: { tableName } })}
            >
              Cancel
            </ActionButton>
            <ActionButton icon="save" variant="primary" loading={b.saving} onClick={() => void b.save()}>
              Save
            </ActionButton>
          </div>
        </div>
      </header>

      {b.loading || !b.config || !b.data ? (
        <BuilderSkeleton />
      ) : (
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-0 py-4 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          <div className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)]">
            <FieldPalette
              tableLabel={tableLabel}
              tableName={b.config.table.name}
              fields={b.availableFields}
              journals={b.availableJournals}
            />
          </div>

          <div className="px-4 sm:px-0">
            <BuilderCanvas
              config={b.config}
              selectedId={b.selectedId}
              onSelect={b.setSelectedId}
              onDrop={handleDrop}
              onRemove={b.removeItem}
              onRename={b.renameSection}
              onDeleteSection={b.deleteSection}
              onMoveSection={b.moveSection}
              onAddSection={b.addSection}
            />
          </div>

          <div className="px-4 sm:px-0 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)]">
            <FieldProperties
              item={b.selected}
              section={b.selectedSection}
              scripts={scriptsForItem(b.selected, b.data.clientScripts)}
              onProperty={(patch) => b.selectedId && b.setItemProperty(b.selectedId, patch)}
              onOrder={(order) => b.selectedId && b.setItemOrder(b.selectedId, order)}
              onRemove={() => b.selectedId && b.removeItem(b.selectedId)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BuilderSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-80 animate-pulse rounded-[4px] bg-muted" />
      ))}
    </div>
  );
}
