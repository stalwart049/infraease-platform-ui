import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";
import { ActionButton } from "@/components/common/ActionButton";
import { cn } from "@/lib/utils";
import { BREAKPOINTS } from "../models/ui";
import type { UiBuilderState } from "../state/useUiBuilder";

const VIEWPORT_ICONS: Record<string, string> = { desktop: "monitor", tablet: "tablet", mobile: "smartphone" };

export function BuilderToolbar({ builder }: { builder: UiBuilderState }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = builder.page;

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-surface px-2">
      <span className="flex items-center gap-1.5 pr-1 text-[13px] font-semibold text-foreground">
        <Icon name="layout-dashboard" className="size-4 text-primary" />
        InfraEase
        <span className="font-normal text-muted-foreground">UI Builder</span>
      </span>

      <span className="h-5 w-px bg-border" />

      <input
        value={page?.name ?? ""}
        onChange={(e) => builder.renamePage(e.target.value)}
        aria-label="Page name"
        className="h-7 w-52 rounded-[3px] border border-transparent bg-transparent px-1.5 text-[13px] font-medium text-foreground outline-none hover:border-border focus:border-ring"
      />

      <span
        className={cn(
          "rounded-[2px] border px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.06em]",
          builder.dirty ? "border-warning/40 text-warning" : "border-success/40 text-success",
        )}
      >
        {builder.dirty ? "Unsaved changes" : builder.savedAt ? `Saved ${builder.savedAt}` : "Saved"}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <ActionButton icon="undo-2" onClick={builder.undo} disabled={!builder.canUndo} aria-label="Undo" />
        <ActionButton icon="redo-2" onClick={builder.redo} disabled={!builder.canRedo} aria-label="Redo" />

        <span className="mx-1 h-5 w-px bg-border" />

        <div className="inline-flex rounded-[3px] border border-border p-0.5">
          {BREAKPOINTS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => builder.setBreakpoint(b)}
              title={b}
              aria-label={`${b} viewport`}
              aria-pressed={builder.breakpoint === b}
              className={cn(
                "grid size-6 place-items-center rounded-[2px]",
                builder.breakpoint === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon name={VIEWPORT_ICONS[b] ?? "monitor"} className="size-3.5" />
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-0.5 rounded-[3px] border border-border px-0.5">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => builder.setZoom(Math.max(40, builder.zoom - 10))}
            className="grid size-6 place-items-center text-muted-foreground hover:text-foreground"
          >
            <Icon name="minus" className="size-3.5" />
          </button>
          <span className="w-10 text-center text-[11.5px] text-muted-foreground">{builder.zoom}%</span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => builder.setZoom(Math.min(150, builder.zoom + 10))}
            className="grid size-6 place-items-center text-muted-foreground hover:text-foreground"
          >
            <Icon name="plus" className="size-3.5" />
          </button>
        </div>

        <span className="mx-1 h-5 w-px bg-border" />

        <ActionButton
          icon={builder.previewMode ? "pencil" : "play"}
          onClick={() => builder.setPreviewMode(!builder.previewMode)}
        >
          {builder.previewMode ? "Edit" : "Preview"}
        </ActionButton>
        <ActionButton icon="save" variant="primary" loading={builder.saving} onClick={() => void builder.save()}>
          Save
        </ActionButton>

        <div className="relative">
          <ActionButton icon="ellipsis" aria-label="More options" onClick={() => setMenuOpen((o) => !o)} />
          {menuOpen && (
            <div
              className="absolute right-0 top-9 z-40 w-52 rounded-[3px] border border-border bg-surface py-1 shadow-md"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                to="/ui-builder"
                className="flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-foreground hover:bg-muted"
              >
                <Icon name="files" className="size-3.5" />
                All pages
              </Link>
              <Link
                to="/widget-builder"
                className="flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-foreground hover:bg-muted"
              >
                <Icon name="puzzle" className="size-3.5" />
                Widget Builder
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  builder.setZoom(100);
                }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12.5px] text-foreground hover:bg-muted"
              >
                <Icon name="maximize" className="size-3.5" />
                Reset zoom
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
