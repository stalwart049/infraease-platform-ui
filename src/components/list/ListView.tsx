import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useList } from "@/hooks/useList";
import { listService } from "@/services/listService";
import { ListHeader } from "./ListHeader";
import { FilterBar } from "./FilterBar";
import { FilterBuilder } from "./FilterBuilder";
import { ColumnPicker } from "./ColumnPicker";
import { ListTable } from "./ListTable";
import { Pagination } from "./Pagination";
import { BulkActionBar } from "./BulkActionBar";
import { ActionButton } from "@/components/common/ActionButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StateBlock } from "@/components/form/FormView";
import type { ActionMeta, RecordValue } from "@/services/types";

export function ListView({ tableName }: { tableName: string }) {
  const navigate = useNavigate();
  const list = useList(tableName);
  const label = list.meta?.table.plural_label ?? tableName.replace(/_/g, " ");

  const [filterOpen, setFilterOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  function handleAction(action: ActionMeta) {
    switch (action.id) {
      case "new":
        void navigate({ to: "/form/$tableName/$recordId", params: { tableName, recordId: "new" } });
        break;
      case "refresh":
        list.refresh();
        break;
      case "configure":
      case "personalize":
        setColumnsOpen(true);
        break;
      default:
        toast.info(`${action.label} is provided by the InfraEase backend.`);
    }
  }

  const selectedIds = Array.from(list.selected);

  async function bulkDelete() {
    setConfirmDelete(false);
    setBulkBusy(true);
    try {
      const removed = await listService.deleteRecords(tableName, selectedIds);
      list.clearSelection();
      list.refresh();
      toast.success(`${removed} ${removed === 1 ? "record" : "records"} deleted`);
    } catch {
      toast.error("Unable to delete the selected records.");
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkUpdate(field: string, value: RecordValue) {
    setBulkBusy(true);
    try {
      const updated = await listService.updateRecords(tableName, selectedIds, { [field]: value });
      list.clearSelection();
      list.refresh();
      toast.success(`${updated} ${updated === 1 ? "record" : "records"} updated`);
    } catch {
      toast.error("Unable to update the selected records.");
    } finally {
      setBulkBusy(false);
    }
  }

  const hasQuery = list.debouncedQuery.trim().length > 0 || list.activeFilters.length > 0;

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
            activeFilters={list.activeFilters}
            columns={list.allColumns}
            onOpenFilters={() => setFilterOpen(true)}
            onRemoveFilter={(id) => list.applyFilters(list.filters.filter((f) => f.id !== id))}
            onOpenColumns={() => setColumnsOpen(true)}
            personalized={list.personalized}
          />

          {list.selected.size > 0 && (
            <BulkActionBar
              count={list.selected.size}
              columns={list.columns}
              busy={bulkBusy}
              onUpdate={(field, value) => void bulkUpdate(field, value)}
              onDelete={() => setConfirmDelete(true)}
              onClear={list.clearSelection}
            />
          )}

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
                  <ActionButton
                    icon="x"
                    onClick={() => {
                      list.setQuery("");
                      list.applyFilters([]);
                    }}
                  >
                    Clear search and filters
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

      <FilterBuilder
        open={filterOpen}
        columns={list.allColumns}
        value={list.filters}
        onApply={(conditions) => {
          list.applyFilters(conditions);
          setFilterOpen(false);
        }}
        onClose={() => setFilterOpen(false)}
      />

      <ColumnPicker
        open={columnsOpen}
        allColumns={list.allColumns}
        selected={list.columns.map((c) => c.name)}
        onApply={(names) => {
          list.setVisibleColumns(names);
          setColumnsOpen(false);
        }}
        onReset={() => {
          list.resetColumns();
          setColumnsOpen(false);
        }}
        onClose={() => setColumnsOpen(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete selected records?"
        body={`${selectedIds.length} ${selectedIds.length === 1 ? "record" : "records"} will be permanently deleted.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => void bulkDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
