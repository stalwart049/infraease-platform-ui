import { useEffect } from "react";
import { Icon } from "@/components/common/Icon";
import { useUiBuilder } from "../state/useUiBuilder";
import { BuilderCanvas } from "./canvas/BuilderCanvas";
import { BuilderToolbar } from "./BuilderToolbar";
import { LayersPanel } from "./layers/LayersPanel";
import { ComponentLibrary } from "./panels/ComponentLibrary";
import { PropertyInspector } from "./properties/PropertyInspector";

export function UiBuilder({ pageId }: { pageId: string }) {
  const builder = useUiBuilder(pageId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) builder.redo();
        else builder.undo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && builder.selectedId) {
        e.preventDefault();
        builder.deleteNode(builder.selectedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [builder]);

  if (builder.loadError) {
    return (
      <div className="m-4 rounded-[4px] border border-destructive/40 bg-surface p-4 text-[13px] text-destructive">
        {builder.loadError}
      </div>
    );
  }

  if (!builder.page) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Icon name="loader-circle" className="size-5 animate-spin text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground">Loading page metadata…</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-0 flex-col">
      <BuilderToolbar builder={builder} />
      {builder.saveError && (
        <p className="border-b border-destructive/40 bg-destructive/5 px-3 py-1.5 text-[12px] text-destructive">
          {builder.saveError}
        </p>
      )}

      <div className="flex min-h-0 flex-1">
        {!builder.previewMode && (
          <div className="flex min-h-0 flex-col">
            <ComponentLibrary categories={builder.categories} />
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          <BuilderCanvas builder={builder} />
        </div>

        {!builder.previewMode && (
          <div className="flex min-h-0 w-[300px] shrink-0 flex-col">
            <div className="flex min-h-0 flex-1">
              <PropertyInspector builder={builder} />
            </div>
            <div className="h-56 shrink-0 overflow-hidden bg-surface">
              <LayersPanel builder={builder} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
