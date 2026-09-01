import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useList } from "@/hooks/useList";
import { ListHeader } from "./ListHeader";
import { FilterBar } from "./FilterBar";
import { ListTable } from "./ListTable";
import { Pagination } from "./Pagination";
import { ActionButton } from "@/components/common/ActionButton";
import { StateBlock } from "@/components/form/FormView";
import type { ActionMeta } from "@/services/types";

export function ListView({ tableName }: { tableName: string }) {
  const navigate = useNavigate();
  const list = useList(tableName);
  const label = list.meta?.table.plural_label ?? tableName.replace(/_/g, " ");

  function handleAction(action: ActionMeta) {
    switch (action.id) {
      case "new":
        void navigate({ to: "/form/$tableName/$recordId", params: { tableName, recordId: "new" } });
        break;
      case "refresh":
        list.refresh();
        break;
      default:
        toast.info(`${action.label} is provided by the InfraEase backend.`);
    }
  }

  const hasQuery = list.debouncedQuery.trim().length > 0;

  return (
    <div className="min-h-full bg-canvas pb-10">
      <ListHeader
        tableLabel={list.meta?.table.label ?? tableName.replace(/_/g, " ")}
        subtitle={`${list.pageInfo.total} ${label.toLowerCase()}`}
        actions={list.meta?.actions ?? []}
        onAction={handleAction}
        refreshing={list.fetching}
      />

      <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4">
        <div className="border border-border bg-surface sm:rounded-[4px]">
          <FilterBar
            value={list.query}
            onChange={list.setQuery}
            selectedCount={list.selected.size}
            onClearSelection={list.clearSelection}
            tableLabel={label}
          />

          {list.error ? (
            <StateBlock
              icon="triangle-alert"
              title="Unable to load records."
              body="The request to the InfraEase service did not complete."
              action={
                <ActionButton icon="refresh-cw" onClick={() => list.refresh()}>
                  Retry
                </ActionButton>
              }
            />
          ) : !list.loading && list.records.length === 0 ? (
            hasQuery ? (
              <StateBlock
                icon="search-x"
                title="No records found"
                body="Try changing your search or filter."
                action={
                  <ActionButton icon="x" onClick={() => list.setQuery("")}>
                    Clear search
                  </ActionButton>
                }
              />
            ) : (
              <StateBlock
                icon="inbox"
                title="No records available"
                body={`This table does not contain any ${label.toLowerCase()} yet.`}
                action={
                  <ActionButton
                    icon="plus"
                    variant="primary"
                    onClick={() =>
                      void navigate({
                        to: "/form/$tableName/$recordId",
                        params: { tableName, recordId: "new" },
                      })
                    }
                  >
                    New Record
                  </ActionButton>
                }
              />
            )
          ) : (
            <>
              <ListTable
                tableName={tableName}
                columns={list.columns}
                records={list.records}
                loading={list.loading}
                sortBy={list.sortBy}
                sortOrder={list.sortOrder}
                onSort={list.toggleSort}
                selected={list.selected}
                onToggleRow={list.toggleRow}
                onToggleAll={list.toggleAll}
                displayField={list.meta?.table.display_field ?? "sys_id"}
                onRecordUpdated={() => list.refresh()}
              />
              <Pagination
                page={list.page}
                totalPages={list.pageInfo.totalPages}
                from={list.pageInfo.from}
                to={list.pageInfo.to}
                total={list.pageInfo.total}
                pageSize={list.pageSize}
                pageSizes={list.meta?.page_sizes ?? [10, 20, 50, 100]}
                onPage={list.setPage}
                onPageSize={list.setPageSize}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
