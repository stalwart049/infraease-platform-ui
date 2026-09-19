import { Suspense, lazy, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";

const UiBuilder = lazy(() =>
  import("@/features/ui-builder/builder/UiBuilder").then((m) => ({ default: m.UiBuilder })),
);

const TITLE = "Page Designer — InfraEase UI Builder";
const DESCRIPTION = "Drag layout components and widgets onto the canvas and configure their properties, data and events.";

export const Route = createFileRoute("/ui-builder/$pageId")({
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
  component: UiBuilderPage,
});

function UiBuilderPage() {
  const { pageId } = Route.useParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return mounted ? (
    <Suspense fallback={<Loading />}>
      <UiBuilder pageId={pageId} />
    </Suspense>
  ) : (
    <Loading />
  );
}

function Loading() {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-2">
      <Icon name="loader-circle" className="size-5 animate-spin text-muted-foreground" />
      <p className="text-[13px] text-muted-foreground">Preparing the builder canvas…</p>
    </div>
  );
}
