import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formService } from "@/services/formService";
import { emptyValueFor, validateAll, validateField } from "@/lib/field-utils";
import type { DataRecord, FormMetadata, RecordValue } from "@/services/types";

export function useFormRecord(tableName: string, recordId: string) {
  const isNew = recordId === "new";

  const metaQuery = useQuery<FormMetadata>({
    queryKey: ["form-meta", tableName],
    queryFn: () => formService.getFormMetadata(tableName),
  });

  const recordQuery = useQuery<DataRecord>({
    queryKey: ["record", tableName, recordId],
    queryFn: () => formService.getRecord(tableName, recordId),
    enabled: !isNew,
  });

  const [formData, setFormData] = useState<Record<string, RecordValue>>({});
  const [originalData, setOriginalData] = useState<Record<string, RecordValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const meta = metaQuery.data;

  // seed the form once metadata (and record) arrive
  useEffect(() => {
    if (!meta) return;
    if (!isNew && !recordQuery.data) return;
    const base: Record<string, RecordValue> = {};
    meta.fields.forEach((f) => {
      base[f.name] = isNew ? emptyValueFor(f) : ((recordQuery.data as DataRecord)[f.name] ?? emptyValueFor(f));
    });
    setFormData(base);
    setOriginalData(base);
    setErrors({});
    setActiveSection((prev) => prev || (meta.sections[0]?.id ?? ""));
  }, [meta, recordQuery.data, isNew]);

  const dirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(originalData),
    [formData, originalData],
  );

  const setValue = useCallback((name: string, value: RecordValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validateOne = useCallback(
    (name: string) => {
      const field = meta?.fields.find((f) => f.name === name);
      if (!field) return;
      const error = validateField(field, formData[name]);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) next[name] = error;
        else delete next[name];
        return next;
      });
    },
    [meta, formData],
  );

  const validate = useCallback(() => {
    if (!meta) return {};
    const found = validateAll(meta.fields, formData);
    setErrors(found);
    return found;
  }, [meta, formData]);

  const markSaved = useCallback((data: Record<string, RecordValue>) => {
    setFormData(data);
    setOriginalData(data);
  }, []);

  const reset = useCallback(() => {
    setFormData(originalData);
    setErrors({});
  }, [originalData]);

  return {
    isNew,
    meta,
    record: recordQuery.data ?? null,
    loading: metaQuery.isLoading || (!isNew && recordQuery.isLoading),
    error: (metaQuery.error ?? recordQuery.error) as Error | null,
    refetch: () => {
      void metaQuery.refetch();
      if (!isNew) void recordQuery.refetch();
    },
    formData,
    setFormData,
    setValue,
    errors,
    setErrors,
    validate,
    validateOne,
    dirty,
    saving,
    setSaving,
    markSaved,
    reset,
    activeSection,
    setActiveSection,
  };
}
