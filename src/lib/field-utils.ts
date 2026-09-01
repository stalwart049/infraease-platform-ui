import type { FieldMeta, RecordValue } from "@/services/types";

export function displayValue(value: RecordValue, field?: FieldMeta): string {
  if (value == null || value === "") return "";
  if (typeof value === "object") return value.display_value ?? "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (field?.type === "select") {
    const opt = field.choices?.find((c) => c.value === value);
    return opt ? opt.label : String(value);
  }
  if (field?.type === "datetime" && typeof value === "string") return value.replace("T", " ");
  return String(value);
}

/** Metadata-driven validation. Returns an error message or null. */
export function validateField(field: FieldMeta, value: RecordValue): string | null {
  const empty =
    value == null ||
    value === "" ||
    (typeof value === "object" && !value.sys_id) ||
    (field.type === "boolean" ? false : false);

  if (field.mandatory && empty && field.type !== "boolean") {
    return `${field.label} is required.`;
  }
  if (empty) return null;

  const text = typeof value === "object" ? value.display_value : String(value);

  if (field.min_length && text.length < field.min_length) {
    return `${field.label} must be at least ${field.min_length} characters.`;
  }
  if (field.max_length && text.length > field.max_length) {
    return `${field.label} must be ${field.max_length} characters or fewer.`;
  }
  if (field.type === "email" && !/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(text)) {
    return "Please enter a valid email address.";
  }
  if (field.type === "url" && !/^https?:\/\/\S+\.\S+/.test(text)) {
    return "Please enter a valid URL starting with http:// or https://.";
  }
  if (field.type === "phone" && !/^[+\d][\d\s().-]{5,}$/.test(text)) {
    return "Please enter a valid phone number.";
  }
  if (field.type === "number") {
    const num = Number(text);
    if (Number.isNaN(num)) return `${field.label} must be a number.`;
    if (field.min != null && num < field.min) return `${field.label} must be at least ${field.min}.`;
    if (field.max != null && num > field.max) return `${field.label} must be at most ${field.max}.`;
  }
  if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return "Please enter a valid date.";
  }
  if (field.pattern) {
    try {
      if (!new RegExp(field.pattern).test(text)) {
        return field.pattern_message ?? `${field.label} has an invalid format.`;
      }
    } catch {
      /* ignore malformed server pattern */
    }
  }
  return null;
}

export function validateAll(fields: FieldMeta[], data: Record<string, RecordValue>) {
  const errors: Record<string, string> = {};
  fields.forEach((f) => {
    if (f.visible === false || f.readonly) return;
    const err = validateField(f, data[f.name]);
    if (err) errors[f.name] = err;
  });
  return errors;
}

export function emptyValueFor(field: FieldMeta): RecordValue {
  if (field.type === "boolean") return false;
  if (field.type === "reference") return null;
  return "";
}
