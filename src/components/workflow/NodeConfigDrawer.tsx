import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { ActionButton } from "@/components/common/ActionButton";
import { newId } from "@/lib/workflow-model";
import { workflowService } from "@/services/workflowService";
import type {
  FieldMeta,
  WorkflowCatalog,
  WorkflowComponentMeta,
  WorkflowConfiguration,
  WorkflowNode,
  WorkflowSummary,
} from "@/services/types";

interface Props {
  node: WorkflowNode;
  meta: WorkflowComponentMeta | undefined;
  catalog: WorkflowCatalog | null;
  workflows: WorkflowSummary[];
  onClose: () => void;
  onApply: (patch: Partial<WorkflowNode>) => void;
}

export function NodeConfigDrawer({ node, meta, catalog, workflows, onClose, onApply }: Props) {
  const [label, setLabel] = useState(node.label);
  const [description, setDescription] = useState(node.description ?? "");
  const [config, setConfig] = useState<WorkflowConfiguration>(structuredClone(node.configuration));
  const [fields, setFields] = useState<FieldMeta[]>([]);

  useEffect(() => {
    setLabel(node.label);
    setDescription(node.description ?? "");
    setConfig(structuredClone(node.configuration));
  }, [node]);

  useEffect(() => {
    let cancelled = false;
    const table = config.table;
    if (!table) {
      setFields([]);
      return;
    }
    workflowService
      .getTableFields(table)
      .then((f) => !cancelled && setFields(f))
      .catch(() => !cancelled && setFields([]));
    return () => {
      cancelled = true;
    };
  }, [config.table]);

  const set = <K extends keyof WorkflowConfiguration>(key: K, value: WorkflowConfiguration[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const has = (key: keyof WorkflowConfiguration) => key in config || (meta?.required ?? []).includes(key);
  const subtype = node.subtype;
  const needsTable = has("table") || meta?.type === "trigger" || /record|task/.test(subtype);

  function save() {
    onApply({
      label: label.trim() || node.label,
      ...(description.trim() ? { description: description.trim() } : { description: "" }),
      configuration: config,
    });
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-label={`Configure ${node.label}`}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-xl"
      >
        <header className="flex items-center gap-2 border-b border-border bg-surface-sunken px-4 py-2.5">
          <Icon name={meta?.icon ?? "circle"} className="size-4 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">{meta?.label ?? node.subtype}</p>
            <p className="truncate text-[11px] text-muted-foreground">{meta?.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close configuration"
            className="rounded-[3px] p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon name="x" className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <Field label="Name">
            <input {...inputProps} value={label} onChange={(e) => setLabel(e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea
              {...inputProps}
              rows={2}
              className={cn(inputProps.className, "h-auto py-1.5")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          {needsTable && (
            <Field label="Table" required={meta?.required?.includes("table")}>
              <select
                {...inputProps}
                value={config.table ?? ""}
                onChange={(e) => set("table", e.target.value)}
              >
                <option value="">Select a table…</option>
                {(catalog?.tables ?? []).map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {has("event") && (
            <Field label="Event" required={meta?.required?.includes("event")}>
              <select {...inputProps} value={config.event ?? ""} onChange={(e) => set("event", e.target.value)}>
                <option value="">Select an event…</option>
                {(catalog?.events ?? []).map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {has("schedule") && (
            <Field label="Schedule" required={meta?.required?.includes("schedule")}>
              <select
                {...inputProps}
                value={config.schedule ?? ""}
                onChange={(e) => set("schedule", e.target.value)}
              >
                <option value="">Select a schedule…</option>
                {(catalog?.schedules ?? []).map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/record|task/.test(subtype) && subtype !== "create_record" && subtype !== "create_task" && (
            <Field label="Record">
              <input
                {...inputProps}
                placeholder="current"
                value={config.record ?? ""}
                onChange={(e) => set("record", e.target.value)}
              />
            </Field>
          )}

          {config.conditions && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="flex-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Conditions
                </p>
                <select
                  value={config.logic ?? "AND"}
                  onChange={(e) => set("logic", e.target.value as "AND" | "OR")}
                  aria-label="Condition logic"
                  className="h-7 rounded-[3px] border border-border bg-surface px-1.5 text-[12px] outline-none focus:border-primary"
                >
                  <option value="AND">Match all (AND)</option>
                  <option value="OR">Match any (OR)</option>
                </select>
              </div>
              {config.conditions.map((row) => (
                <div key={row.id} className="flex items-center gap-1.5">
                  <select
                    {...inputProps}
                    className={cn(inputProps.className, "flex-1")}
                    value={row.field}
                    aria-label="Condition field"
                    onChange={(e) =>
                      set(
                        "conditions",
                        config.conditions!.map((r) => (r.id === row.id ? { ...r, field: e.target.value } : r)),
                      )
                    }
                  >
                    <option value="">Field…</option>
                    {fields.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <select
                    {...inputProps}
                    className={cn(inputProps.className, "w-28")}
                    value={row.operator}
                    aria-label="Condition operator"
                    onChange={(e) =>
                      set(
                        "conditions",
                        config.conditions!.map((r) =>
                          r.id === row.id ? { ...r, operator: e.target.value as typeof r.operator } : r,
                        ),
                      )
                    }
                  >
                    {(catalog?.operators ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <input
                    {...inputProps}
                    className={cn(inputProps.className, "flex-1")}
                    value={row.value}
                    aria-label="Condition value"
                    onChange={(e) =>
                      set(
                        "conditions",
                        config.conditions!.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)),
                      )
                    }
                  />
                  <RowRemove
                    onClick={() =>
                      set(
                        "conditions",
                        config.conditions!.filter((r) => r.id !== row.id),
                      )
                    }
                  />
                </div>
              ))}
              <ActionButton
                icon="plus"
                onClick={() =>
                  set("conditions", [
                    ...(config.conditions ?? []),
                    { id: newId("cond"), field: "", operator: "is", value: "" },
                  ])
                }
              >
                Add condition
              </ActionButton>
            </section>
          )}

          {config.fields && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Field values
              </p>
              {config.fields.map((row) => (
                <div key={row.id} className="flex items-center gap-1.5">
                  <select
                    {...inputProps}
                    className={cn(inputProps.className, "flex-1")}
                    value={row.field}
                    aria-label="Field"
                    onChange={(e) =>
                      set(
                        "fields",
                        config.fields!.map((r) => (r.id === row.id ? { ...r, field: e.target.value } : r)),
                      )
                    }
                  >
                    <option value="">Field…</option>
                    {fields.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[12px] text-muted-foreground">=</span>
                  <input
                    {...inputProps}
                    className={cn(inputProps.className, "flex-1")}
                    value={row.value}
                    aria-label="Value"
                    onChange={(e) =>
                      set(
                        "fields",
                        config.fields!.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)),
                      )
                    }
                  />
                  <RowRemove
                    onClick={() =>
                      set(
                        "fields",
                        config.fields!.filter((r) => r.id !== row.id),
                      )
                    }
                  />
                </div>
              ))}
              <ActionButton
                icon="plus"
                onClick={() => set("fields", [...(config.fields ?? []), { id: newId("fld"), field: "", value: "" }])}
              >
                Add another field
              </ActionButton>
            </section>
          )}

          {config.cases && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Cases
              </p>
              <Field label="Field">
                <select {...inputProps} value={config.field ?? ""} onChange={(e) => set("field", e.target.value)}>
                  <option value="">Field…</option>
                  {fields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
              {config.cases.map((row) => (
                <div key={row.id} className="flex items-center gap-1.5">
                  <input
                    {...inputProps}
                    className={cn(inputProps.className, "flex-1")}
                    aria-label="Case label"
                    value={row.label}
                    onChange={(e) =>
                      set(
                        "cases",
                        config.cases!.map((r) => (r.id === row.id ? { ...r, label: e.target.value } : r)),
                      )
                    }
                  />
                  <input
                    {...inputProps}
                    className={cn(inputProps.className, "flex-1")}
                    aria-label="Case value"
                    value={row.value}
                    onChange={(e) =>
                      set(
                        "cases",
                        config.cases!.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)),
                      )
                    }
                  />
                  <RowRemove
                    onClick={() =>
                      set(
                        "cases",
                        config.cases!.filter((r) => r.id !== row.id),
                      )
                    }
                  />
                </div>
              ))}
              <ActionButton
                icon="plus"
                onClick={() =>
                  set("cases", [
                    ...(config.cases ?? []),
                    { id: newId("case"), label: `Case ${(config.cases?.length ?? 0) + 1}`, value: "" },
                  ])
                }
              >
                Add case
              </ActionButton>
            </section>
          )}

          {config.branches !== undefined && (
            <Field label="Parallel branches">
              <input
                {...inputProps}
                type="number"
                min={2}
                max={6}
                value={config.branches}
                onChange={(e) => set("branches", Math.max(2, Math.min(6, Number(e.target.value) || 2)))}
              />
            </Field>
          )}

          {config.join_mode !== undefined && (
            <Field label="Join behaviour">
              <select
                {...inputProps}
                value={config.join_mode}
                onChange={(e) => set("join_mode", e.target.value as "all" | "any")}
              >
                <option value="all">Wait for all incoming branches</option>
                <option value="any">Continue on the first branch</option>
              </select>
            </Field>
          )}

          {(subtype === "approval" || subtype === "ask_approval") && (
            <>
              <Field label="Approver type">
                <select
                  {...inputProps}
                  value={config.approval_type ?? "manager"}
                  onChange={(e) => set("approval_type", e.target.value as "user" | "group" | "manager")}
                >
                  <option value="manager">Reporting manager</option>
                  <option value="user">Specific user</option>
                  <option value="group">Group</option>
                </select>
              </Field>
              <Field label="Approver">
                <input
                  {...inputProps}
                  value={config.approver ?? ""}
                  onChange={(e) => set("approver", e.target.value)}
                />
              </Field>
            </>
          )}

          {has("duration") && (
            <Field label="Duration" required={meta?.required?.includes("duration")}>
              <div className="flex gap-1.5">
                <input
                  {...inputProps}
                  className={cn(inputProps.className, "flex-1")}
                  type="number"
                  min={1}
                  value={config.duration ?? 1}
                  onChange={(e) => set("duration", Number(e.target.value) || 1)}
                />
                <select
                  {...inputProps}
                  className={cn(inputProps.className, "w-32")}
                  aria-label="Duration unit"
                  value={config.unit ?? "hours"}
                  onChange={(e) => set("unit", e.target.value as "minutes" | "hours" | "days")}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </Field>
          )}

          {has("recipient") && (
            <Field label="Recipient" required={meta?.required?.includes("recipient")}>
              <input
                {...inputProps}
                value={config.recipient ?? ""}
                onChange={(e) => set("recipient", e.target.value)}
              />
            </Field>
          )}
          {has("subject") && (
            <Field label="Subject" required={meta?.required?.includes("subject")}>
              <input
                {...inputProps}
                value={config.subject ?? ""}
                onChange={(e) => set("subject", e.target.value)}
              />
            </Field>
          )}
          {has("body") && (
            <Field label="Body">
              <textarea
                {...inputProps}
                rows={4}
                className={cn(inputProps.className, "h-auto py-1.5")}
                value={config.body ?? ""}
                onChange={(e) => set("body", e.target.value)}
              />
            </Field>
          )}
          {has("message") && (
            <Field label="Message" required={meta?.required?.includes("message")}>
              <textarea
                {...inputProps}
                rows={3}
                className={cn(inputProps.className, "h-auto py-1.5")}
                value={config.message ?? ""}
                onChange={(e) => set("message", e.target.value)}
              />
            </Field>
          )}

          {has("script") && (
            <Field label="Script" required={meta?.required?.includes("script")}>
              <textarea
                {...inputProps}
                rows={10}
                spellCheck={false}
                className={cn(inputProps.className, "h-auto py-1.5 font-mono text-[12px] leading-5")}
                value={config.script ?? ""}
                onChange={(e) => set("script", e.target.value)}
              />
            </Field>
          )}

          {has("endpoint") && (
            <>
              <Field label="Method">
                <select
                  {...inputProps}
                  value={config.method ?? "GET"}
                  onChange={(e) => set("method", e.target.value as NonNullable<WorkflowConfiguration["method"]>)}
                >
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Endpoint" required={meta?.required?.includes("endpoint")}>
                <input
                  {...inputProps}
                  placeholder="https://api.example.com/v1/tickets"
                  value={config.endpoint ?? ""}
                  onChange={(e) => set("endpoint", e.target.value)}
                />
              </Field>
              <Field label="Payload">
                <textarea
                  {...inputProps}
                  rows={5}
                  spellCheck={false}
                  className={cn(inputProps.className, "h-auto py-1.5 font-mono text-[12px]")}
                  value={config.payload ?? ""}
                  onChange={(e) => set("payload", e.target.value)}
                />
              </Field>
            </>
          )}

          {has("subflow") && (
            <Field label="Subflow" required={meta?.required?.includes("subflow")}>
              <select
                {...inputProps}
                value={config.subflow ?? ""}
                onChange={(e) => set("subflow", e.target.value)}
              >
                <option value="">Select a workflow…</option>
                {workflows.map((w) => (
                  <option key={w.sys_id} value={w.sys_id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {has("reason") && (
            <Field label="Reason">
              <input {...inputProps} value={config.reason ?? ""} onChange={(e) => set("reason", e.target.value)} />
            </Field>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border bg-surface-sunken px-4 py-2.5">
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton icon="check" variant="primary" onClick={save}>
            Apply
          </ActionButton>
        </footer>
      </aside>
    </>
  );
}

const inputProps = {
  className:
    "h-8 w-full rounded-[3px] border border-border bg-surface px-2 text-[12.5px] text-foreground outline-none focus:border-primary",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

function RowRemove({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove row"
      className="rounded-[3px] p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
    >
      <Icon name="x" className="size-3.5" />
    </button>
  );
}
