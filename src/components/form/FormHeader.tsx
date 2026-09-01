import { ActionButton } from "@/components/common/ActionButton";
import { RecordContextMenu } from "@/components/common/ContextMenu";
import type { ActionMeta } from "@/services/types";

export function FormHeader({
  tableLabel,
  recordLabel,
  actions,
  onAction,
  saving,
  dirty,
}: {
  tableLabel: string;
  recordLabel: string;
  actions: ActionMeta[];
  onAction: (action: ActionMeta) => void;
  saving: boolean;
  dirty: boolean;
}) {
  return (
    <header className="sticky top-12 z-20 border-b border-border bg-surface-raised px-4 py-3 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <RecordContextMenu actions={actions} onAction={onAction} label={tableLabel} />
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold uppercase tracking-[0.06em] text-foreground">
              {tableLabel}
            </h1>
            <p className="truncate text-[12px] text-muted-foreground">
              {recordLabel}
              {dirty && <span className="ml-2 text-warning">• Unsaved changes</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {actions
            .filter((a) => a.in_header)
            .map((action) => (
              <ActionButton
                key={action.id}
                icon={action.icon}
                variant={action.variant ?? "default"}
                loading={saving && action.id === "save"}
                disabled={saving}
                compactLabel
                onClick={() => onAction(action)}
              >
                {action.label}
              </ActionButton>
            ))}
        </div>
      </div>
    </header>
  );
}
