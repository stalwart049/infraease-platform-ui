import { useState } from "react";
import { Icon } from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import type { Breakpoint, LayoutConfig, StyleConfig, UiNode } from "../../models/ui";
import { BREAKPOINTS } from "../../models/ui";
import type { UiBuilderState } from "../../state/useUiBuilder";
import { BindingEditor } from "../bindings/BindingEditor";
import { EventEditor } from "../events/EventEditor";
import { Field, PanelSection, SelectInput, Segmented, TextInput, Toggle } from "./controls";

type Tab = "properties" | "layout" | "style" | "data" | "events" | "visibility";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "properties", label: "Properties", icon: "sliders-horizontal" },
  { id: "layout", label: "Layout", icon: "layout-grid" },
  { id: "style", label: "Style", icon: "palette" },
  { id: "data", label: "Data", icon: "database" },
  { id: "events", label: "Events", icon: "zap" },
  { id: "visibility", label: "Visibility", icon: "eye" },
];

export function PropertyInspector({ builder }: { builder: UiBuilderState }) {
  const [tab, setTab] = useState<Tab>("properties");
  const node = builder.selected;
  const definition = node ? builder.definitions[node.type] : undefined;

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-surface">
      {!node ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <Icon name="mouse-pointer-square-dashed" className="size-5 text-muted-foreground" />
          <p className="text-[12.5px] text-muted-foreground">Select a component on the canvas to configure it.</p>
        </div>
      ) : (
        <>
          <div className="border-b border-border px-3 py-2">
            <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground">
              <Icon name={definition?.icon ?? "box"} className="size-3.5 text-muted-foreground" />
              {node.name ?? definition?.label ?? node.type}
            </p>
            <p className="text-[11px] text-muted-foreground">{node.type}</p>
          </div>

          <div className="flex flex-wrap gap-0.5 border-b border-border p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-[3px] px-1.5 py-1 text-[11.5px]",
                  tab === t.id ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon name={t.icon} className="size-3" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "properties" && <PropertiesTab builder={builder} node={node} />}
            {tab === "layout" && <LayoutTab builder={builder} node={node} />}
            {tab === "style" && <StyleTab builder={builder} node={node} />}
            {tab === "data" && <DataTab builder={builder} node={node} />}
            {tab === "events" && (
              <PanelSection title="Events & actions">
                <EventEditor
                  node={node}
                  availableEvents={definition?.events ?? ["onClick"]}
                  onChange={(events) => builder.updateNode(node.id, (n) => ({ ...n, events }))}
                />
              </PanelSection>
            )}
            {tab === "visibility" && (
              <PanelSection title="Visibility">
                <Field label="Visible when" hint="Runtime expression, e.g. currentUser.canEdit == true">
                  <TextInput
                    value={node.visibility.when ?? ""}
                    onChange={(when) => builder.updateNode(node.id, (n) => ({ ...n, visibility: { when } }))}
                    placeholder="currentUser.canEdit == true"
                  />
                </Field>
                <BreakpointHidden builder={builder} node={node} />
              </PanelSection>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

function PropertiesTab({ builder, node }: { builder: UiBuilderState; node: UiNode }) {
  const definition = builder.definitions[node.type];
  const setProperty = (name: string, value: string | number | boolean) =>
    builder.updateNode(node.id, (n) => ({ ...n, properties: { ...n.properties, [name]: value } }));

  return (
    <>
      <PanelSection title="Component">
        <Field label="Name">
          <TextInput value={node.name ?? ""} onChange={(name) => builder.updateNode(node.id, (n) => ({ ...n, name }))} />
        </Field>
      </PanelSection>

      <PanelSection title="Properties">
        {(definition?.properties ?? []).length === 0 && (
          <p className="text-[12px] text-muted-foreground">This component has no configurable properties.</p>
        )}
        {(definition?.properties ?? []).map((property) => {
          const value = node.properties[property.name];
          if (property.editor === "boolean") {
            return (
              <Toggle
                key={property.name}
                label={property.label}
                checked={value === true}
                onChange={(v) => setProperty(property.name, v)}
              />
            );
          }
          if (property.editor === "select") {
            return (
              <Field key={property.name} label={property.label}>
                <SelectInput
                  value={String(value ?? "")}
                  onChange={(v) => setProperty(property.name, v)}
                  options={(property.options ?? []).map((o) => ({ value: o, label: o }))}
                />
              </Field>
            );
          }
          if (property.editor === "textarea") {
            return (
              <Field key={property.name} label={property.label}>
                <textarea
                  value={String(value ?? "")}
                  onChange={(e) => setProperty(property.name, e.target.value)}
                  rows={3}
                  className="w-full rounded-[3px] border border-input bg-background p-2 text-[12.5px] outline-none focus:border-ring"
                />
              </Field>
            );
          }
          return (
            <Field key={property.name} label={property.label}>
              <TextInput
                type={property.editor === "number" ? "number" : "text"}
                value={String(value ?? "")}
                onChange={(v) => setProperty(property.name, property.editor === "number" ? Number(v) : v)}
                placeholder={property.placeholder ?? ""}
              />
            </Field>
          );
        })}
      </PanelSection>
    </>
  );
}

function LayoutTab({ builder, node }: { builder: UiBuilderState; node: UiNode }) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(builder.breakpoint);
  const layout: LayoutConfig = node.layout[breakpoint] ?? {};
  const definition = builder.definitions[node.type];

  const patch = (next: Partial<LayoutConfig>) =>
    builder.updateNode(node.id, (n) => ({ ...n, layout: { ...n.layout, [breakpoint]: { ...(n.layout[breakpoint] ?? {}), ...next } } }));

  return (
    <>
      <PanelSection title="Breakpoint">
        <Segmented
          value={breakpoint}
          onChange={setBreakpoint}
          options={BREAKPOINTS.map((b) => ({ value: b, label: b[0]!.toUpperCase() + b.slice(1) }))}
        />
        <p className="text-[11px] text-muted-foreground">
          Values left empty inherit from the wider breakpoint.
        </p>
      </PanelSection>

      <PanelSection title="Layout">
        {definition?.container && (
          <>
            <Field label="Columns">
              <TextInput type="number" value={String(layout.columns ?? "")} onChange={(v) => patch({ columns: Number(v) || 0 })} />
            </Field>
            <Field label="Direction">
              <SelectInput
                value={layout.direction ?? ""}
                onChange={(v) => patch({ direction: v === "row" ? "row" : "column" })}
                options={[
                  { value: "column", label: "Column" },
                  { value: "row", label: "Row" },
                ]}
                placeholder="Inherit"
              />
            </Field>
            <Field label="Gap">
              <TextInput value={layout.gap ?? ""} onChange={(gap) => patch({ gap })} placeholder="12" />
            </Field>
            <Field label="Padding">
              <TextInput value={layout.padding ?? ""} onChange={(padding) => patch({ padding })} placeholder="16" />
            </Field>
          </>
        )}
        <Field label="Column span (of 12)">
          <TextInput type="number" value={String(layout.span ?? "")} onChange={(v) => patch({ span: Number(v) || 0 })} />
        </Field>
        <Field label="Width">
          <TextInput value={layout.width ?? ""} onChange={(width) => patch({ width })} placeholder="auto" />
        </Field>
        <Field label="Height">
          <TextInput value={layout.height ?? ""} onChange={(height) => patch({ height })} placeholder="auto" />
        </Field>
        <Field label="Margin">
          <TextInput value={layout.margin ?? ""} onChange={(margin) => patch({ margin })} placeholder="0" />
        </Field>
        <Field label="Alignment">
          <SelectInput
            value={layout.align ?? ""}
            onChange={(v) => patch({ align: v as LayoutConfig["align"] })}
            options={[
              { value: "start", label: "Start" },
              { value: "center", label: "Center" },
              { value: "end", label: "End" },
              { value: "stretch", label: "Stretch" },
            ]}
            placeholder="Inherit"
          />
        </Field>
        <Toggle label={`Hidden on ${breakpoint}`} checked={layout.hidden === true} onChange={(hidden) => patch({ hidden })} />
      </PanelSection>
    </>
  );
}

function StyleTab({ builder, node }: { builder: UiBuilderState; node: UiNode }) {
  const style = node.style;
  const patch = (next: Partial<StyleConfig>) => builder.updateNode(node.id, (n) => ({ ...n, style: { ...n.style, ...next } }));

  return (
    <>
      <PanelSection title="Typography">
        <Field label="Font size">
          <TextInput value={style.fontSize ?? ""} onChange={(fontSize) => patch({ fontSize })} placeholder="13" />
        </Field>
        <Field label="Font weight">
          <SelectInput
            value={style.fontWeight ?? ""}
            onChange={(fontWeight) => patch({ fontWeight })}
            options={["400", "500", "600", "700"].map((w) => ({ value: w, label: w }))}
            placeholder="Inherit"
          />
        </Field>
        <Field label="Color">
          <TextInput value={style.color ?? ""} onChange={(color) => patch({ color })} placeholder="var(--color-foreground)" />
        </Field>
      </PanelSection>
      <PanelSection title="Surface">
        <Field label="Background">
          <TextInput value={style.background ?? ""} onChange={(background) => patch({ background })} placeholder="var(--color-surface)" />
        </Field>
        <Field label="Border">
          <TextInput value={style.border ?? ""} onChange={(border) => patch({ border })} placeholder="1px solid var(--color-border)" />
        </Field>
        <Field label="Radius">
          <TextInput value={style.radius ?? ""} onChange={(radius) => patch({ radius })} placeholder="3" />
        </Field>
        <Field label="Shadow">
          <SelectInput
            value={style.shadow ?? ""}
            onChange={(shadow) => patch({ shadow })}
            options={[
              { value: "none", label: "None" },
              { value: "0 1px 2px rgba(15,23,42,.08)", label: "Subtle" },
              { value: "0 4px 12px rgba(15,23,42,.10)", label: "Raised" },
            ]}
            placeholder="Inherit"
          />
        </Field>
      </PanelSection>
    </>
  );
}

function DataTab({ builder, node }: { builder: UiBuilderState; node: UiNode }) {
  const definition = builder.definitions[node.type];
  const bindable = (definition?.properties ?? []).filter((p) => p.bindable);
  const widgetSlots = definition?.dataAware ? ["rows", "record", "series", "records", "events", "query", "data"] : [];
  const slots = Array.from(new Set([...widgetSlots.filter((s) => definition?.dataAware), ...bindable.map((p) => p.name)]));

  const setBinding = (name: string, binding: ReturnType<typeof Object> | undefined) =>
    builder.updateNode(node.id, (n) => {
      const bindings = { ...n.bindings };
      if (binding === undefined) delete bindings[name];
      else bindings[name] = binding as never;
      return { ...n, bindings };
    });

  return (
    <PanelSection title="Data binding">
      {slots.length === 0 && <p className="text-[12px] text-muted-foreground">This component does not consume data.</p>}
      <div className="space-y-2">
        {slots.map((slot) => (
          <BindingEditor
            key={slot}
            label={slot}
            binding={node.bindings[slot]}
            onChange={(binding) => setBinding(slot, binding)}
          />
        ))}
      </div>
    </PanelSection>
  );
}

function BreakpointHidden({ builder, node }: { builder: UiBuilderState; node: UiNode }) {
  return (
    <div className="space-y-1 pt-1">
      {BREAKPOINTS.map((b) => (
        <Toggle
          key={b}
          label={`Hidden on ${b}`}
          checked={(node.layout[b] ?? {}).hidden === true}
          onChange={(hidden) =>
            builder.updateNode(node.id, (n) => ({ ...n, layout: { ...n.layout, [b]: { ...(n.layout[b] ?? {}), hidden } } }))
          }
        />
      ))}
    </div>
  );
}
