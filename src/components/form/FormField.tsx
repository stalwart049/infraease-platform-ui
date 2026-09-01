import { useId } from "react";
import { Icon } from "@/components/common/Icon";
import { ReferenceField } from "./ReferenceField";
import type { FieldMeta, RecordValue, ReferenceValue } from "@/services/types";
import { cn } from "@/lib/utils";

interface Props {
  field: FieldMeta;
  value: RecordValue;
  error?: string | undefined;
  onChange: (value: RecordValue) => void;
  onBlur?: () => void;
}

const inputBase =
  "h-9 w-full rounded-[3px] border bg-background px-2.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";

export function FormField({ field, value, error, onChange, onBlur }: Props) {
  const id = useId();
  const fieldId = `field-${field.name}-${id}`;
  const errorId = `${fieldId}-error`;
  const invalid = !!error;
  const border = invalid ? "border-destructive" : "border-input focus:border-ring";
  const readOnly = !!field.readonly;

  const common = {
    id: fieldId,
    disabled: readOnly,
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? errorId : undefined,
    onBlur,
  };

  const isWide = field.type === "textarea";

  return (
    <div className={cn("min-w-0", isWide && "md:col-span-2")}>
      <label
        htmlFor={fieldId}
        className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground"
      >
        <Icon name={field.icon} className="size-3.5" />
        <span className="truncate">{field.label}</span>
        {field.mandatory && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {field.mandatory && <span className="sr-only">(required)</span>}
        {readOnly && <Icon name="lock" className="size-3 text-muted-foreground/70" />}
      </label>

      {renderControl()}

      {error && (
        <p id={errorId} role="alert" className="mt-1 flex items-center gap-1 text-[12px] text-destructive">
          <Icon name="circle-alert" className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
      {!error && field.hint && <p className="mt-1 text-[12px] text-muted-foreground">{field.hint}</p>}
    </div>
  );

  function renderControl() {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...common}
            rows={4}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputBase, border, "h-auto min-h-24 resize-y py-2 leading-relaxed")}
          />
        );
      case "boolean":
        return (
          <label className="flex h-9 items-center gap-2 text-[13px] text-foreground">
            <input
              {...common}
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="size-4 rounded-[3px] border-input accent-primary"
            />
            <span className="text-muted-foreground">{value ? "Yes" : "No"}</span>
          </label>
        );
      case "select":
        return (
          <select
            {...common}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputBase, border, "appearance-none bg-[length:14px] pr-8")}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            <option value="">None</option>
            {field.choices?.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        );
      case "reference":
        return (
          <ReferenceField
            value={(value as ReferenceValue) ?? null}
            onChange={(v) => onChange(v)}
            referenceTable={field.reference_table ?? "sys_user"}
            displayField={field.display_field ?? "name"}
            disabled={readOnly}
            invalid={invalid}
            inputId={fieldId}
            {...(invalid ? { describedBy: errorId } : {})}
          />
        );
      case "date":
      case "datetime":
        return (
          <input
            {...common}
            type={field.type === "date" ? "date" : "datetime-local"}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputBase, border)}
          />
        );
      case "number":
        return (
          <input
            {...common}
            type="number"
            value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            className={cn(inputBase, border)}
          />
        );
      default:
        return (
          <input
            {...common}
            type={field.type === "password" ? "password" : field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "phone" ? "tel" : "text"}
            value={(value as string) ?? ""}
            maxLength={field.max_length ?? undefined}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputBase, border)}
          />
        );
    }
  }
}
