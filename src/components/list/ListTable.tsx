import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Icon } from "@/components/common/Icon";
import { InlineFieldEditor } from "./InlineFieldEditor";
import { listService } from "@/services/listService";
import { displayValue } from "@/lib/field-utils";
import type { DataRecord, FieldMeta, GroupBucket, RecordValue } from "@/services/types";
import { cn } from "@/lib/utils";

interface EditingCell {
  recordId: string;
  column: string;
}

export function ListTable({
  tableName,
  columns,
  records,
  groups,
  groupBy,
  loading,
  sortBy,
  sortOrder,
  onSort,
  selected,
  onToggleRow,
  onToggleAll,
  displayField,
  onRecordUpdated,
}: {
  tableName: string;
  columns: FieldMeta[];
  records: DataRecord[];
  groups?: GroupBucket[];
  groupBy?: string | null;
  loading: boolean;
  sortBy: string | null;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  selected: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  displayField: string;
  onRecordUpdated: (record: DataRecord) => void;
}) {
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const allSelected = records.length > 0 && records.every((r) => selected.has(r.sys_id));
  const grouped = Boolean(groupBy) && Boolean(groups?.length);

  function toggleGroup(value: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function commit(record: DataRecord, field: FieldMeta, value: RecordValue) {
    const key = `${record.sys_id}:${field.name}`;
    if (JSON.stringify(value ?? "") === JSON.stringify(record[field.name] ?? "")) {
      setEditing(null);
      return;
    }
    setSavingCell(key);
    try {
      const updated = await listService.patchRecord(tableName, record.sys_id, { [field.name]: value });
      onRecordUpdated(updated);
      toast.success("Record saved successfully");
    } catch {
      toast.error("Unable to save record.", { description: "Please try again in a moment." });
    } finally {
      setSavingCell(null);
      setEditing(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-px p-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 w-full animate-pulse rounded-[3px] bg-muted" />
        ))}
      </div>
    );
  }

  const renderRow = (record: DataRecord) => (
    <tr
      key={record.sys_id}
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/60",
        selected.has(record.sys_id) && "bg-accent/60",
      )}
    >
      <td className="px-3 py-1.5 align-middle">
        <input
          type="checkbox"
          aria-label={`Select record ${String(record[displayField] ?? record.sys_id)}`}
          checked={selected.has(record.sys_id)}
          onChange={() => onToggleRow(record.sys_id)}
          className="size-3.5 accent-primary"
        />
      </td>
      {columns.map((col) => {
        const isEditing = editing?.recordId === record.sys_id && editing.column === col.name;
        const key = `${record.sys_id}:${col.name}`;
        return (
          <td
            key={col.name}
            tabIndex={0}
            onDoubleClick={() => !col.readonly && setEditing({ recordId: record.sys_id, column: col.name })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isEditing && !col.readonly) {
                e.preventDefault();
                setEditing({ recordId: record.sys_id, column: col.name });
              }
            }}
            title={col.readonly ? "Read-only field" : "Double-click to edit"}
            className={cn(
              "relative px-3 py-1.5 align-middle text-[13px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
              col.readonly ? "text-muted-foreground" : "cursor-cell",
            )}
          >
            {isEditing || savingCell === key ? (
              <InlineFieldEditor
                field={col}
                value={record[col.name]}
                saving={savingCell === key}
                onCommit={(v) => void commit(record, col, v)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <CellValue record={record} column={col} tableName={tableName} displayField={displayField} />
            )}
          </td>
        );
      })}
      <td className="px-2 py-1.5 text-right">
        <Link
          to="/form/$tableName/$recordId"
          params={{ tableName, recordId: record.sys_id }}
          aria-label={`Open record ${String(record[displayField] ?? record.sys_id)}`}
          title="Open record"
          className="grid size-7 place-items-center rounded-[3px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon name="square-arrow-out-up-right" className="size-3.5" />
        </Link>
      </td>
    </tr>
  );

  const span = columns.length + 2;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-surface-sunken">
            <th scope="col" className="w-9 px-3 py-2">
              <input
                type="checkbox"
                aria-label="Select all records on this page"
                checked={allSelected}
                onChange={onToggleAll}
                className="size-3.5 accent-primary"
              />
            </th>
            {columns.map((col) => {
              const active = sortBy === col.name;
              return (
                <th
                  key={col.name}
                  scope="col"
                  style={col.width ? { minWidth: col.width } : undefined}
                  className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                >
                  <button
                    type="button"
                    onClick={() => onSort(col.name)}
                    aria-label={`Sort by ${col.label}`}
                    className="inline-flex items-center gap-1 rounded-[3px] transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                  >
                    {col.label}
                    <Icon
                      name={active ? (sortOrder === "asc" ? "arrow-up" : "arrow-down") : "chevrons-up-down"}
                      className={cn("size-3", active ? "text-foreground" : "opacity-40")}
                    />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="w-10 px-2 py-2">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>

        {grouped ? (
          groups!.map((group) => {
            const isCollapsed = collapsed.has(group.value);
            return (
              <tbody key={group.value || "__empty__"}>
                <tr className="border-b border-border bg-surface-sunken">
                  <td colSpan={span} className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.value)}
                      aria-expanded={!isCollapsed}
                      className="inline-flex items-center gap-1.5 rounded-[3px] px-1 py-0.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                    >
                      <Icon name={isCollapsed ? "chevron-right" : "chevron-down"} className="size-3.5" />
                      <span>{group.label}</span>
                      <span className="font-normal text-muted-foreground">
                        {group.page_count < group.count
                          ? `(${group.page_count} of ${group.count})`
                          : `(${group.count})`}
                      </span>
                    </button>
                  </td>
                </tr>
                {!isCollapsed && group.records.map(renderRow)}
              </tbody>
            );
          })
        ) : (
          <tbody>{records.map(renderRow)}</tbody>
        )}
      </table>
    </div>
  );
}

function CellValue({
  record,
  column,
  tableName,
  displayField,
}: {
  record: DataRecord;
  column: FieldMeta;
  tableName: string;
  displayField: string;
}) {
  const value = record[column.name];

  if (column.type === "boolean") {
    return (
      <Icon
        name={value ? "check" : "minus"}
        className={cn("size-3.5", value ? "text-success" : "text-muted-foreground")}
      />
    );
  }
  if (column.type === "select" && value) {
    return (
      <span className="inline-flex items-center rounded-[3px] border border-border bg-surface-sunken px-1.5 py-0.5 text-[12px]">
        {displayValue(value, column)}
      </span>
    );
  }
  if (column.name === displayField) {
    return (
      <Link
        to="/form/$tableName/$recordId"
        params={{ tableName, recordId: record.sys_id }}
        className="font-medium text-primary hover:underline"
      >
        {displayValue(value, column)}
      </Link>
    );
  }
  const text = displayValue(value, column);
  return <span className="block max-w-[42ch] truncate">{text || "—"}</span>;
}
