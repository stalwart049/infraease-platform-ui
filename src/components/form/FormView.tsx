import { useEffect, useMemo, useState } from "react";
import { useNavigate, useBlocker } from "@tanstack/react-router";
import { toast } from "sonner";
import { useFormRecord } from "@/hooks/useFormRecord";
import { FormHeader } from "./FormHeader";
import { FormSectionTabs } from "./FormSectionTabs";
import { FormField } from "./FormField";
import { RelatedLinks } from "./RelatedLinks";
import { ActionButton } from "@/components/common/ActionButton";
import { Icon } from "@/components/common/Icon";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { formService } from "@/services/formService";
import type { ActionMeta, RecordValue } from "@/services/types";

export function FormView({ tableName, recordId }: { tableName: string; recordId: string }) {
  const navigate = useNavigate();
  const form = useFormRecord(tableName, recordId);
  const [confirm, setConfirm] = useState<{ title: string; body: string; onConfirm: () => void } | null>(null);

  const { meta, formData, errors, dirty, saving } = form;

  // Warn before leaving with unsaved changes (in-app navigation).
  const blocker = useBlocker({ shouldBlockFn: () => dirty && !saving, withResolver: true });

  // ...and browser tab close / reload.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const sectionFields = useMemo(() => {
    if (!meta) return [];
    const section = meta.sections.find((s) => s.id === form.activeSection) ?? meta.sections[0];
    if (!section) return meta.fields;
    return section.fields
      .map((name) => meta.fields.find((f) => f.name === name))
      .filter((f) => f && f.visible !== false);
  }, [meta, form.activeSection]);

  const errorSections = useMemo(() => {
    const set = new Set<string>();
    if (!meta) return set;
    meta.sections.forEach((s) => {
      if (s.fields.some((f) => errors[f])) set.add(s.id);
    });
    return set;
  }, [meta, errors]);

  const recordLabel = form.isNew
    ? "New Record"
    : String(form.record?.[meta?.table.display_field ?? "number"] ?? recordId);

  async function save(thenNew: boolean) {
    if (!meta) return;
    const found = form.validate();
    if (Object.keys(found).length) {
      const firstSection = meta.sections.find((s) => s.fields.some((f) => found[f]));
      if (firstSection) form.setActiveSection(firstSection.id);
      toast.error("Unable to save record.", { description: "Please correct the highlighted fields." });
      return;
    }
    if (form.saving) return; // prevents duplicate submissions
    form.setSaving(true);
    try {
      const payload: Record<string, RecordValue> = { ...formData };
      const saved = form.isNew
        ? await formService.createRecord(tableName, payload)
        : await formService.updateRecord(tableName, form.record?.sys_id ?? recordId, payload);
      form.markSaved({ ...payload });
      toast.success("Record saved successfully");
      if (thenNew) {
        void navigate({ to: "/form/$tableName/$recordId", params: { tableName, recordId: "new" } });
      } else if (form.isNew) {
        void navigate({ to: "/form/$tableName/$recordId", params: { tableName, recordId: saved.sys_id } });
      }
    } catch (e) {
      toast.error("Unable to save record.", {
        description: e instanceof Error ? e.message : "Please try again in a moment.",
      });
    } finally {
      form.setSaving(false);
    }
  }

  function handleAction(action: ActionMeta) {
    switch (action.id) {
      case "save":
        void save(false);
        break;
      case "save_new":
        void save(true);
        break;
      case "new":
        void navigate({ to: "/form/$tableName/$recordId", params: { tableName, recordId: "new" } });
        break;
      case "refresh":
        form.reset();
        form.refetch();
        break;
      case "cancel":
        void navigate({ to: "/list/$tableName", params: { tableName } });
        break;
      case "delete":
        setConfirm({
          title: "Delete record",
          body: action.confirm ?? "Delete this record?",
          onConfirm: async () => {
            await formService.deleteRecord(tableName, form.record?.sys_id ?? recordId);
            toast.success("Record deleted");
            void navigate({ to: "/list/$tableName", params: { tableName } });
          },
        });
        break;
      default:
        toast.info(`${action.label} is provided by the InfraEase backend.`);
    }
  }

  if (form.error) {
    return (
      <StateBlock
        icon="triangle-alert"
        title="Unable to load record."
        body="The record or its metadata could not be retrieved."
        action={<ActionButton icon="refresh-cw" onClick={() => form.refetch()}>Retry</ActionButton>}
      />
    );
  }

  return (
    <div className="min-h-full bg-canvas pb-10">
      <FormHeader
        tableLabel={meta?.table.label ?? tableName.replace(/_/g, " ")}
        recordLabel={recordLabel}
        actions={meta?.actions ?? []}
        onAction={handleAction}
        saving={saving}
        dirty={dirty}
      />

      {form.loading || !meta ? (
        <FormSkeleton />
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-0 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="border border-border bg-surface sm:rounded-[4px]">
            <FormSectionTabs
              sections={meta.sections}
              activeId={form.activeSection}
              onSelect={form.setActiveSection}
              errorSections={errorSections}
            />
            <div
              role="tabpanel"
              id={`panel-${form.activeSection}`}
              aria-labelledby={`tab-${form.activeSection}`}
              className="grid grid-cols-1 gap-x-8 gap-y-4 px-4 py-5 sm:px-6 md:grid-cols-2"
            >
              {sectionFields.map((field) => (
                <FormField
                  key={field!.name}
                  field={field!}
                  value={formData[field!.name]}
                  error={errors[field!.name]}
                  onChange={(v) => form.setValue(field!.name, v)}
                  onBlur={() => form.validateOne(field!.name)}
                />
              ))}
            </div>
            <RelatedLinks links={meta.related_links} />
          </div>

          <div className="px-4 sm:px-0 lg:sticky lg:top-16 lg:self-start">
            <ActivityStream tableName={tableName} recordId={recordId} />
          </div>
        </div>
      )}


      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ""}
        body={confirm?.body ?? ""}
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const fn = confirm?.onConfirm;
          setConfirm(null);
          void fn?.();
        }}
      />

      <ConfirmDialog
        open={blocker.status === "blocked"}
        title="Unsaved Changes"
        body="You have unsaved changes. Are you sure you want to leave?"
        cancelLabel="Stay"
        confirmLabel="Discard Changes"
        destructive
        onCancel={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
      />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-2.5 w-28 animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded-[3px] bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StateBlock({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Icon name={icon} className="size-6 text-muted-foreground" />
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      <p className="max-w-sm text-[13px] text-muted-foreground">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
