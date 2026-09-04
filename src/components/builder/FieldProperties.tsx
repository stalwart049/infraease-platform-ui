import { Link } from "@tanstack/react-router";
import { menuLinkProps } from "@/components/layout/MenuTree";
import { Icon } from "@/components/common/Icon";
import { itemLabel } from "@/lib/form-builder-utils";
import type { ClientScriptRef, FormViewItem, FormViewSection } from "@/services/types";

export function FieldProperties({
  item,
  section,
  scripts,
  onProperty,
  onOrder,
  onRemove,
}: {
  item: FormViewItem | null;
  section: FormViewSection | null;
  scripts: ClientScriptRef[];
  onProperty: (patch: Partial<{ mandatory: boolean; readonly: boolean; visible: boolean }>) => void;
  onOrder: (order: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col border border-border bg-surface sm:rounded-[4px]">
      <div className="border-b border-border px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Selected Field
        </p>
        <p className="text-[14px] font-semibold text-foreground">{item ? itemLabel(item) : "Nothing selected"}</p>
      </div>

      {!item || !section ? (
        <p className="px-4 py-8 text-center text-[12px] text-muted-foreground">
          Select a field on the canvas to review and configure its properties.
        </p>
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
          <dl className="space-y-2">
            <Row label="Field" value={item.type === "field" ? item.field.name : item.journalType} />
            <Row label="Type" value={item.type === "field" ? item.field.type : "journal"} />
            <Row label="Section" value={section.name} />
          </dl>

          <div>
            <label htmlFor="prop-order" className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Order
            </label>
            <input
              id="prop-order"
              type="number"
              min={1}
              max={section.fields.length}
              value={item.order}
              onChange={(e) => onOrder(Number(e.target.value))}
              className="h-8 w-24 rounded-[3px] border border-border bg-canvas px-2 text-[13px] outline-none focus-visible:border-primary"
            />
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            {item.type === "field" && (
              <>
                <Toggle
                  id="prop-mandatory"
                  label="Mandatory"
                  checked={item.properties.mandatory}
                  onChange={(v) => onProperty({ mandatory: v })}
                />
                <Toggle
                  id="prop-readonly"
                  label="Read Only"
                  checked={item.properties.readonly}
                  onChange={(v) => onProperty({ readonly: v })}
                />
              </>
            )}
            <Toggle
              id="prop-visible"
              label="Visible"
              checked={item.properties.visible}
              onChange={(v) => onProperty({ visible: v })}
            />
          </div>

          <div className="border-t border-border pt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Client Scripts
            </p>
            {scripts.length ? (
              <ul className="space-y-1.5">
                {scripts.map((s) => (
                  <li
                    key={s.sys_id}
                    className="rounded-[3px] border border-border bg-surface-sunken px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] text-foreground">{s.name}</p>
                      {s.route && (
                        <Link
                          {...menuLinkProps(s.route)}
                          className="shrink-0 text-muted-foreground hover:text-primary"
                          aria-label={`Open client script ${s.name}`}
                        >
                          <Icon name="external-link" className="size-3.5" />
                        </Link>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Type: {s.type}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-muted-foreground">
                {item.type === "field"
                  ? "No client scripts are associated with this field."
                  : "Journal components do not carry client scripts."}
              </p>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Read-only. Client scripts are managed outside the form builder.
            </p>
          </div>

          <div className="border-t border-border pt-3">
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 text-[13px] text-destructive hover:underline"
            >
              <Icon name="x" className="size-3.5" />
              Remove from form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="truncate text-[13px] text-foreground">{value}</dd>
    </div>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-3 text-[13px] text-foreground">
      {label}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--primary)]"
      />
    </label>
  );
}
