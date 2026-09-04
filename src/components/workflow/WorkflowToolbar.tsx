import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";

interface Props {
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  snap: boolean;
  issueCount: number;
  dirty: boolean;
  saving: boolean;
  savedAt: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  
  onToggleSnap: () => void;
  onValidate: () => void;
}

export function WorkflowToolbar(p: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
      <ToolButton icon="undo-2" label="Undo" onClick={p.onUndo} disabled={!p.canUndo} />
      <ToolButton icon="redo-2" label="Redo" onClick={p.onRedo} disabled={!p.canRedo} />
      <Divider />
      <ToolButton icon="zoom-out" label="Zoom out" onClick={p.onZoomOut} />
      <span className="w-12 text-center text-[11.5px] tabular-nums text-muted-foreground">
        {Math.round(p.zoom * 100)}%
      </span>
      <ToolButton icon="zoom-in" label="Zoom in" onClick={p.onZoomIn} />
      <ToolButton icon="maximize" label="Fit to screen" onClick={p.onFit} />
      <Divider />
      
      <ToolButton icon="grid-3x3" label="Snap to grid" onClick={p.onToggleSnap} active={p.snap} />
      <Divider />
      <button
        type="button"
        onClick={p.onValidate}
        className="flex h-7 items-center gap-1.5 rounded-[3px] border border-border px-2 text-[12px] font-medium text-foreground hover:bg-muted"
      >
        <Icon name="shield-check" className="size-3.5" />
        Validate
      </button>

      <div className="ml-auto flex items-center gap-2 pr-1 text-[11.5px]">
        {p.issueCount > 0 && (
          <span className="flex items-center gap-1 text-destructive">
            <Icon name="triangle-alert" className="size-3.5" />
            {p.issueCount} issue{p.issueCount === 1 ? "" : "s"}
          </span>
        )}
        {p.saving ? (
          <span className="text-muted-foreground">Saving…</span>
        ) : p.dirty ? (
          <span className="text-warning">Unsaved changes</span>
        ) : (
          <span className="flex items-center gap-1 text-success">
            <Icon name="check" className="size-3.5" />
            Saved{p.savedAt ? ` ${p.savedAt}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />;
}

function ToolButton({
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "rounded-[3px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent",
        active && "bg-primary/10 text-primary",
      )}
    >
      <Icon name={icon} className="size-4" />
    </button>
  );
}
