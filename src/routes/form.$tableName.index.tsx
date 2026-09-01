import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/form/$tableName/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/form/$tableName/$recordId",
      params: { tableName: params.tableName, recordId: "new" },
    });
  },
});
