import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";
import { workflowService } from "@/services/workflowService";
import type { WorkflowSummary } from "@/services/types";

export const Route = createFileRoute("/workflow/")({
  head: () => ({
    meta: [
      { title: "Workflows — InfraEase" },
      {
        name: "description",
        content: "Design and manage automated service workflows in the InfraEase Workflow Builder.",
      },
      { property: "og:title", content: "Workflows — InfraEase" },
      {
        property: "og:description",
        content: "Design and manage automated service workflows in the InfraEase Workflow Builder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkflowIndexPage,
});

function WorkflowIndexPage() {
  const [workflows, setWorkflows] = useState<WorkflowSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workflowService
      .listWorkflows()
      .then(setWorkflows)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load workflows."));
  }, []);

  return (
    <>
      <div className="mx-auto w-full max-w-4xl p-4">
        <h1 className="text-[18px] font-semibold text-foreground">Workflows</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Open a workflow to edit its triggers, conditions and actions in the Workflow Builder.
        </p>

        {error && <p className="mt-4 text-[13px] text-destructive">{error}</p>}
        {!workflows && !error && <p className="mt-4 text-[13px] text-muted-foreground">Loading…</p>}

        <ul className="mt-4 divide-y divide-border rounded-[4px] border border-border bg-surface">
          {(workflows ?? []).map((workflow) => (
            <li key={workflow.sys_id}>
              <Link
                to="/workflow/$workflowId"
                params={{ workflowId: workflow.sys_id }}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted"
              >
                <Icon name="workflow" className="size-4 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-foreground">
                    {workflow.name}
                  </span>
                  <span className="block truncate text-[11.5px] text-muted-foreground">
                    {workflow.node_count} nodes{workflow.table ? ` · ${workflow.table}` : ""} · updated{" "}
                    {workflow.updated_at}
                  </span>
                </span>
                <span
                  className={
                    workflow.active
                      ? "rounded-[2px] border border-success/40 px-1.5 py-0.5 text-[10px] uppercase text-success"
                      : "rounded-[2px] border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground"
                  }
                >
                  {workflow.active ? "Active" : "Inactive"}
                </span>
                <Icon name="chevron-right" className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
