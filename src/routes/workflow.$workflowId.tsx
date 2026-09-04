import { Suspense, lazy, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";

const WorkflowBuilder = lazy(() =>
  import("@/components/workflow/WorkflowBuilder").then((m) => ({ default: m.WorkflowBuilder })),
);

export const Route = createFileRoute("/workflow/$workflowId")({
  head: () => ({
    meta: [
      { title: "Workflow Builder — InfraEase" },
      {
        name: "description",
        content: "Design triggers, conditions and actions on a visual canvas in the InfraEase Workflow Builder.",
      },
      { property: "og:title", content: "Workflow Builder — InfraEase" },
      {
        property: "og:description",
        content: "Design triggers, conditions and actions on a visual canvas in the InfraEase Workflow Builder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkflowBuilderPage,
});

function WorkflowBuilderPage() {
  const { workflowId } = Route.useParams();
  // React Flow measures the DOM, so the canvas mounts only in the browser
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <div className="p-3">
        {mounted ? (
          <Suspense fallback={<Loading />}>
            <WorkflowBuilder workflowId={workflowId} />
          </Suspense>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

function Loading() {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-[4px] border border-border bg-surface">
      <Icon name="loader-circle" className="size-5 animate-spin text-muted-foreground" />
      <p className="text-[13px] text-muted-foreground">Preparing the workflow canvas…</p>
    </div>
  );
}
