import { Suspense, lazy, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";

const WidgetBuilder = lazy(() =>
  import("@/features/ui-builder/widget-builder/WidgetBuilder").then((m) => ({ default: m.WidgetBuilder })),
);

const TITLE = "Widget Development — InfraEase Widget Builder";
const DESCRIPTION = "Edit the React component, styles, server script and client script of an InfraEase widget.";

export const Route = createFileRoute("/widget-builder/$widgetId")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WidgetBuilderPage,
});

function WidgetBuilderPage() {
  const { widgetId } = Route.useParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return mounted ? (
    <Suspense fallback={<Loading />}>
      <WidgetBuilder widgetId={widgetId} />
    </Suspense>
  ) : (
    <Loading />
  );
}

function Loading() {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-2">
      <Icon name="loader-circle" className="size-5 animate-spin text-muted-foreground" />
      <p className="text-[13px] text-muted-foreground">Preparing the widget editor…</p>
    </div>
  );
}
