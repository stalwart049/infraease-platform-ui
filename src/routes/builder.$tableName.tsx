import { createFileRoute } from "@tanstack/react-router";
import { FormBuilder } from "@/components/builder/FormBuilder";

export const Route = createFileRoute("/builder/$tableName")({
  validateSearch: (search: Record<string, unknown>) => ({
    view: typeof search["view"] === "string" ? search["view"] : "",
  }),
  head: ({ params }) => {
    const label = params.tableName.replace(/_/g, " ");
    const title = `Form Builder · ${label} · InfraEase`;
    const description = `Design the ${label} form view in InfraEase: drag fields into sections, reorder them and configure presentation properties.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: BuilderRoute,
});

function BuilderRoute() {
  const { tableName } = Route.useParams();
  const { view } = Route.useSearch();
  return <FormBuilder key={`${tableName}/${view}`} tableName={tableName} {...(view ? { viewId: view } : {})} />;
}
