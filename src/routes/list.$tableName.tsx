import { createFileRoute } from "@tanstack/react-router";
import { ListView } from "@/components/list/ListView";

export const Route = createFileRoute("/list/$tableName")({
  head: ({ params }) => {
    const label = params.tableName.replace(/_/g, " ");
    const title = `${label} list · InfraEase`;
    const description = `Browse, sort, filter and inline-edit ${label} records in the InfraEase service management platform.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ListRoute,
});

function ListRoute() {
  const { tableName } = Route.useParams();
  return <ListView key={tableName} tableName={tableName} />;
}
