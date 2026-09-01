import { ActionButton } from "@/components/common/ActionButton";
import { RecordContextMenu } from "@/components/common/ContextMenu";
import type { ActionMeta } from "@/services/types";

export function ListHeader({
  tableLabel,
  subtitle,
  actions,
  onAction,
  refreshing,
}: {
  tableLabel: string;
  subtitle: string;
  actions: ActionMeta[];
  onAction: (action: ActionMeta) => void;
  refreshing: boolean;
}) {
  return (
    <header className="sticky top-12 z-20 border-b border-border bg-surface-raised px-3 py-3 sm:px-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <RecordContextMenu actions={actions} onAction={onAction} label={tableLabel} />
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold uppercase tracking-[0.06em] text-foreground">
              {tableLabel}
            </h1>
            <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>
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
                loading={refreshing && action.id === "refresh"}
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
