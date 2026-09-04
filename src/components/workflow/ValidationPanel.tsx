import { Icon } from "@/components/common/Icon";
import type { WorkflowIssue } from "@/lib/workflow-validate";

interface Props {
  issues: WorkflowIssue[];
  onClose: () => void;
  onSelect: (nodeId: string) => void;
}

export function ValidationPanel({ issues, onClose, onSelect }: Props) {
  return (
    <div className="max-h-52 shrink-0 overflow-y-auto border-t border-border bg-surface">
      <div className="sticky top-0 flex items-center gap-2 border-b border-border bg-surface-sunken px-3 py-1.5">
        <Icon
          name={issues.length ? "triangle-alert" : "check"}
          className={issues.length ? "size-4 text-destructive" : "size-4 text-success"}
        />
        <p className="flex-1 text-[13.5px] font-semibold text-foreground">
          {issues.length
            ? `${issues.length} validation issue${issues.length === 1 ? "" : "s"}`
            : "No validation issues — this workflow is ready to save."}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close validation results"
          className="rounded-[3px] p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Icon name="x" className="size-3.5" />
        </button>
      </div>
      <ul className="divide-y divide-border">
        {issues.map((issue) => (
          <li key={issue.id}>
            <button
              type="button"
              disabled={!issue.nodeId}
              onClick={() => issue.nodeId && onSelect(issue.nodeId)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-[13.5px] text-foreground hover:bg-muted disabled:hover:bg-transparent"
            >
              <Icon name="dot" className="mt-0.5 size-3.5 shrink-0 text-destructive" />
              <span className="flex-1">{issue.message}</span>
              {issue.nodeId && <Icon name="arrow-right" className="mt-0.5 size-3.5 text-muted-foreground" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
