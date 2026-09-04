import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/common/Icon";
import { ReferenceField } from "@/components/form/ReferenceField";
import type { FieldMeta, RecordValue, ReferenceValue } from "@/services/types";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-[3px] border border-ring bg-background px-1.5 text-[13px] text-foreground outline-none";

/** Single reusable inline editor covering every supported field type. */
export function InlineFieldEditor({
  field,
  value,
  saving,
  onCommit,
  onCancel,
}: {
  field: FieldMeta;
  value: RecordValue;
  saving: boolean;
  onCommit: (value: RecordValue) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<RecordValue>(value ?? (field.type === "boolean" ? false : ""));
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const keyHandler = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !(field.type === "textarea" && e.shiftKey)) {
      e.preventDefault();
      onCommit(draft);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <Icon name="loader-circle" className="size-3.5 animate-spin" /> Saving...
      </span>
    );
  }

  switch (field.type) {
    case "reference":
      return (
        <ReferenceField
          compact
          autoFocus
          value={(draft as ReferenceValue) ?? null}
          onChange={(v) => onCommit(v)}
          referenceTable={field.reference_table ?? "sys_user"}
          displayField={field.display_field ?? "name"}
          onCancel={onCancel}
        />
      );
    case "boolean":
      return (
        <input
          type="checkbox"
          autoFocus
          aria-label={field.label}
          checked={!!draft}
          onChange={(e) => onCommit(e.target.checked)}
          onKeyDown={keyHandler}
          className="size-4 accent-primary"
        />
      );
    case "select":
      return (
        <select
          ref={ref as React.RefObject<HTMLSelectElement>}
          aria-label={field.label}
          value={(draft as string) ?? ""}
          onChange={(e) => onCommit(e.target.value)}
          onKeyDown={keyHandler}
          onBlur={onCancel}
          className={cn(base, "h-7")}
        >
          <option value="">None</option>
          {field.choices?.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      );
    case "textarea":
    case "script":
      return (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          aria-label={field.label}
          rows={3}
          value={(draft as string) ?? ""}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={keyHandler}
          className={cn(base, "absolute z-30 min-w-64 resize-y py-1 shadow-md")}
        />
      );
    default: {
      const type =
        field.type === "number"
          ? "number"
          : field.type === "date"
            ? "date"
            : field.type === "datetime"
              ? "datetime-local"
              : field.type === "email"
                ? "email"
                : field.type === "phone"
                  ? "tel"
                  : field.type === "url"
                    ? "url"
                    : "text";
      return (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type={type}
          aria-label={field.label}
          value={draft == null ? "" : String(draft)}
          onChange={(e) => setDraft(field.type === "number" ? Number(e.target.value) : e.target.value)}
          onKeyDown={keyHandler}
          onBlur={() => onCommit(draft)}
          className={cn(base, "h-7")}
        />
      );
    }
  }
}
