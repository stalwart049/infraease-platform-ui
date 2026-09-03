import { useState } from "react";
import { ActionButton } from "@/components/common/ActionButton";
import { Icon } from "@/components/common/Icon";
import type { FieldMeta, RecordValue } from "@/services/types";

const control =
  "h-8 rounded-[3px] border border-input bg-background px-2 text-[13px] text-foreground outline-none focus:border-ring";

/** Actions that apply to every currently selected record. */
export function BulkActionBar({
  count,
  columns,
  busy,
  onUpdate,
  onDelete,
  onClear,
}: {
  count: number;
  columns: FieldMeta[];
  busy: boolean;
  onUpdate: (field: string, value: RecordValue) => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  const editable = columns.filter((c) => !c.readonly && c.type !== "reference");
  const [field, setField] = useState(editable[0]?.name ?? "");
  const [value, setValue] = useState("");

  const selectedField = editable.find((c) => c.name === field);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-accent/40 px-3 py-2">
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
        <Icon name="check-check" className="size-3.5 text-primary" />
        {count} selected
      </span>

      {editable.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-muted-foreground">Update</span>
          <select
            aria-label="Field to update"
            className={control}
            value={field}
            onChange={(e) => {
              setField(e.target.value);
              setValue("");
            }}
          >
            {editable.map((c) => (
              <option key={c.name} value={c.name}>
                {c.label}
              </option>
            ))}
          </select>
          {selectedField?.type === "select" && selectedField.choices ? (
            <select
              aria-label="New value"
              className={control}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="">Select a value...</option>
              {selectedField.choices.map((c) => (
                <option key={c.value} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : selectedField?.type === "boolean" ? (
            <select
              aria-label="New value"
              className={control}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="">Select a value...</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          ) : (
            <input
              aria-label="New value"
              className={control}
              value={value}
              placeholder="New value"
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <ActionButton
            icon="save"
            loading={busy}
            disabled={!field || value.trim() === ""}
            onClick={() =>
              onUpdate(
                field,
                selectedField?.type === "boolean"
                  ? value === "true"
                  : selectedField?.type === "number"
                    ? Number(value)
                    : value,
              )
            }
          >
            Apply
          </ActionButton>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <ActionButton icon="trash-2" variant="danger" disabled={busy} onClick={onDelete}>
          Delete
        </ActionButton>
        <ActionButton icon="x" variant="ghost" onClick={onClear}>
          Clear
        </ActionButton>
      </div>
    </div>
  );
}
