import { createFileRoute } from "@tanstack/react-router";
import { FormView } from "@/components/form/FormView";

export const Route = createFileRoute("/form/$tableName/$recordId")({
  head: ({ params }) => {
    const label = params.tableName.replace(/_/g, " ");
    const title = `${params.recordId === "new" ? "New" : params.recordId} · ${label} · InfraEase`;
    const description = `Open, edit and save ${label} records with metadata-driven forms in InfraEase.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: FormRoute,
});

function FormRoute() {
  const { tableName, recordId } = Route.useParams();
  return <FormView key={`${tableName}/${recordId}`} tableName={tableName} recordId={recordId} />;
}
