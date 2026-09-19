import { useEffect, useState } from "react";
import { Icon } from "@/components/common/Icon";
import type { Binding } from "../../models/ui";
import { BINDING_SOURCES, dataBindingService } from "../../services/dataBindingService";
import { Field, SelectInput, TextInput } from "../properties/controls";

/** Configures one property binding: Bind / Unbind / Expression. */
export function BindingEditor({
  label,
  binding,
  onChange,
}: {
  label: string;
  binding: Binding | undefined;
  onChange: (binding: Binding | undefined) => void;
}) {
  const current: Binding = binding ?? { kind: "none" };
  const [tables, setTables] = useState<{ name: string; label: string }[]>([]);
  const [fields, setFields] = useState<{ name: string; label: string }[]>([]);

  useEffect(() => {
    let alive = true;
    dataBindingService.listTables().then((t) => alive && setTables(t));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (current.kind === "table" && current.table) {
      dataBindingService.listFields(current.table).then((f) => alive && setFields(f));
    } else {
      setFields([]);
    }
    return () => {
      alive = false;
    };
  }, [current.kind, current.table]);

  const patch = (next: Partial<Binding>) => onChange({ ...current, ...next });

  return (
    <div className="space-y-2 rounded-[3px] border border-border bg-surface-sunken p-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-1">
          {current.kind === "none" ? (
            <button
              type="button"
              onClick={() => patch({ kind: "table", source: "InfraEase Table" })}
              className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-background px-1.5 py-0.5 text-[11px] text-foreground hover:bg-muted"
            >
              <Icon name="link" className="size-3" />
              Bind
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-destructive"
            >
              <Icon name="unlink" className="size-3" />
              Unbind
            </button>
          )}
          <button
            type="button"
            onClick={() => patch({ kind: current.kind === "expression" ? "table" : "expression" })}
            className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-background px-1.5 py-0.5 text-[11px] text-foreground hover:bg-muted"
          >
            <Icon name="braces" className="size-3" />
            Expression
          </button>
        </div>
      </div>

      {current.kind === "table" && (
        <div className="space-y-2">
          <Field label="Data source">
            <SelectInput
              value={current.source ?? "InfraEase Table"}
              onChange={(source) => patch({ source })}
              options={BINDING_SOURCES.map((s) => ({ value: s.id, label: s.label }))}
            />
          </Field>
          <Field label="Table">
            <SelectInput
              value={current.table ?? ""}
              onChange={(table) => patch({ table, field: "" })}
              options={tables.map((t) => ({ value: t.name, label: t.label }))}
              placeholder="Select a table"
            />
          </Field>
          <Field label="Field">
            <SelectInput
              value={current.field ?? ""}
              onChange={(field) => patch({ field })}
              options={fields.map((f) => ({ value: f.name, label: `${f.label} (${f.name})` }))}
              placeholder={current.table ? "Select a field" : "Select a table first"}
            />
          </Field>
        </div>
      )}

      {current.kind === "expression" && (
        <Field label="Expression" hint="Evaluated by the InfraEase runtime.">
          <TextInput
            value={current.expression ?? ""}
            onChange={(expression) => patch({ expression })}
            placeholder='incident.state == "closed"'
          />
        </Field>
      )}

      {current.kind === "none" && <p className="text-[11.5px] text-muted-foreground">Static value — not bound to data.</p>}
    </div>
  );
}
