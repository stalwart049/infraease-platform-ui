import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";
import { ActionButton } from "@/components/common/ActionButton";
import { cn } from "@/lib/utils";
import { newId } from "../models/node-utils";
import { WIDGET_FILES, type WidgetBinding, type WidgetEvent, type WidgetFileId, type WidgetProperty } from "../models/widget";
import { useWidgetBuilder } from "../state/useWidgetBuilder";
import { CodeEditor, type EditorHandle } from "./editors/CodeEditor";
import { WidgetPreview } from "./preview/WidgetPreview";
import { Field, SelectInput, TextInput, Toggle } from "../builder/properties/controls";

type SidePanel = "information" | "properties" | "bindings" | "events";

const PANELS: { id: SidePanel; label: string; icon: string }[] = [
  { id: "information", label: "Info", icon: "info" },
  { id: "properties", label: "Properties", icon: "sliders-horizontal" },
  { id: "bindings", label: "Bindings", icon: "database" },
  { id: "events", label: "Events", icon: "zap" },
];

export function WidgetBuilder({ widgetId }: { widgetId: string }) {
  const state = useWidgetBuilder(widgetId);
  const [panel, setPanel] = useState<SidePanel>("information");
  const [previewActive, setPreviewActive] = useState(false);
  const editorRef = useRef<EditorHandle | null>(null);
  const widget = state.widget;

  if (state.loadError) {
    return <div className="m-4 rounded-[4px] border border-destructive/40 bg-surface p-4 text-[13px] text-destructive">{state.loadError}</div>;
  }
  if (!widget) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Icon name="loader-circle" className="size-5 animate-spin text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground">Loading widget…</p>
      </div>
    );
  }

  const activeMeta = WIDGET_FILES.find((f) => f.id === state.activeFile) ?? WIDGET_FILES[0]!;

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-0 flex-col">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-surface px-2">
        <span className="flex items-center gap-1.5 pr-1 text-[13px] font-semibold text-foreground">
          <Icon name="puzzle" className="size-4 text-primary" />
          InfraEase
          <span className="font-normal text-muted-foreground">Widget Builder</span>
        </span>
        <span className="h-5 w-px bg-border" />
        <input
          value={widget.label}
          onChange={(e) => state.commit((w) => ({ ...w, label: e.target.value }))}
          aria-label="Widget name"
          className="h-7 w-56 rounded-[3px] border border-transparent bg-transparent px-1.5 text-[13px] font-medium text-foreground outline-none hover:border-border focus:border-ring"
        />
        <span
          className={cn(
            "rounded-[2px] border px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.06em]",
            widget.status === "saved" && !state.dirty ? "border-success/40 text-success" : "border-warning/40 text-warning",
          )}
        >
          {widget.status === "saved" && !state.dirty ? "Saved" : "Draft"}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <ActionButton icon="undo-2" aria-label="Undo" onClick={state.undo} disabled={!state.canUndo} />
          <ActionButton icon="redo-2" aria-label="Redo" onClick={state.redo} disabled={!state.canRedo} />
          <ActionButton icon="wand-sparkles" onClick={() => editorRef.current?.format()} disabled={previewActive}>
            Format
          </ActionButton>
          <ActionButton icon="search" aria-label="Find in file" onClick={() => editorRef.current?.find()} disabled={previewActive} />
          <span className="mx-1 h-5 w-px bg-border" />
          <ActionButton icon="save" variant="primary" loading={state.saving} onClick={() => void state.save()}>
            Save
          </ActionButton>
          <Link
            to="/widget-builder"
            className="inline-flex h-8 items-center gap-1.5 rounded-[3px] border border-border bg-surface px-2.5 text-[13px] text-foreground hover:bg-muted"
          >
            <Icon name="list" className="size-3.5" />
            All widgets
          </Link>
        </div>
      </header>

      {state.saveError && (
        <p className="border-b border-destructive/40 bg-destructive/5 px-3 py-1.5 text-[12px] text-destructive">{state.saveError}</p>
      )}

      <div className="flex min-h-0 flex-1">
        {/* file explorer */}
        <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-surface">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Widget</p>
          <ul className="px-1">
            {WIDGET_FILES.map((file) => (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewActive(false);
                    state.openFile(file.id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-left text-[12.5px]",
                    !previewActive && state.activeFile === file.id ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon name={file.icon} className="size-3.5 text-muted-foreground" />
                  <span className="truncate">{file.label}</span>
                  {state.dirtyFiles.includes(file.id) && <span className="ml-auto size-1.5 rounded-full bg-warning" />}
                </button>
              </li>
            ))}
            <li className="mt-1 border-t border-border pt-1">
              <button
                type="button"
                onClick={() => setPreviewActive(true)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-left text-[12.5px]",
                  previewActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted",
                )}
              >
                <Icon name="eye" className="size-3.5 text-muted-foreground" />
                <span>Preview</span>
              </button>
            </li>
          </ul>
          <div className="mt-auto border-t border-border p-2 text-[11px] leading-4 text-muted-foreground">
            React component ← client.js ← server.js ← InfraEase data
          </div>
        </aside>

        {/* editor */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-8 shrink-0 items-stretch gap-px border-b border-border bg-surface-sunken">
            {state.openFiles.map((fileId) => {
              const meta = WIDGET_FILES.find((f) => f.id === fileId)!;
              const active = state.activeFile === fileId;
              return (
                <div
                  key={fileId}
                  className={cn(
                    "group flex items-center gap-1.5 border-r border-border px-2.5 text-[12px]",
                    active ? "bg-background font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewActive(false);
                      state.openFile(fileId);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Icon name={meta.icon} className="size-3.5" />
                    {meta.fileName}
                    {state.dirtyFiles.includes(fileId) && <span className="size-1.5 rounded-full bg-warning" />}
                  </button>
                  <button
                    type="button"
                    aria-label={`Close ${meta.fileName}`}
                    onClick={() => state.closeFile(fileId)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Icon name="x" className="size-3" />
                  </button>
                </div>
              );
            })}
            {previewActive && (
              <div className="group flex items-center gap-1.5 border-r border-border bg-background px-2.5 text-[12px] font-medium text-foreground">
                <button type="button" onClick={() => setPreviewActive(true)} className="flex items-center gap-1.5">
                  <Icon name="eye" className="size-3.5" />
                  Preview
                </button>
                <button type="button" aria-label="Close preview" onClick={() => setPreviewActive(false)}>
                  <Icon name="x" className="size-3" />
                </button>
              </div>
            )}
            {!previewActive && (
              <span className="ml-auto flex items-center gap-2 px-3 text-[11.5px] text-muted-foreground">
                {activeMeta.language.toUpperCase()} · {widget.files[state.activeFile].split("\n").length} lines
              </span>
            )}
          </div>

          <div className="min-h-0 flex-1 bg-background">
            {previewActive ? (
              <WidgetPreview widget={widget} embedded />
            ) : (
              <CodeEditor
                key={state.activeFile}
                value={widget.files[state.activeFile]}
                language={activeMeta.language}
                onChange={(content) => state.setFile(state.activeFile, content)}
                handleRef={editorRef}
              />
            )}
          </div>
        </div>

        {/* configuration */}
        <aside className="flex w-[320px] shrink-0 flex-col border-l border-border bg-surface">
          <div className="flex gap-0.5 border-b border-border p-1">
            {PANELS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPanel(p.id)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1 rounded-[3px] px-1.5 py-1 text-[11.5px]",
                  panel === p.id ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon name={p.icon} className="size-3" />
                {p.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {panel === "information" && (
              <>
                <Field label="Name"><TextInput value={widget.name} onChange={(name) => state.commit((w) => ({ ...w, name }))} /></Field>
                <Field label="Label"><TextInput value={widget.label} onChange={(label) => state.commit((w) => ({ ...w, label }))} /></Field>
                <Field label="Description">
                  <textarea
                    value={widget.description}
                    onChange={(e) => state.commit((w) => ({ ...w, description: e.target.value }))}
                    rows={3}
                    className="w-full rounded-[3px] border border-input bg-background p-2 text-[12.5px] outline-none focus:border-ring"
                  />
                </Field>
                <Field label="Category"><TextInput value={widget.category} onChange={(category) => state.commit((w) => ({ ...w, category }))} /></Field>
                <Field label="Icon" hint="Any InfraEase icon name."><TextInput value={widget.icon} onChange={(icon) => state.commit((w) => ({ ...w, icon }))} /></Field>
                <Toggle label="Active" checked={widget.active} onChange={(active) => state.commit((w) => ({ ...w, active }))} />
              </>
            )}

            {panel === "properties" && (
              <PropertyList
                properties={widget.properties}
                onChange={(properties) => state.commit((w) => ({ ...w, properties }))}
              />
            )}

            {panel === "bindings" && (
              <BindingList bindings={widget.bindings} onChange={(bindings) => state.commit((w) => ({ ...w, bindings }))} />
            )}

            {panel === "events" && (
              <EventList events={widget.events} onChange={(events) => state.commit((w) => ({ ...w, events }))} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function PropertyList({ properties, onChange }: { properties: WidgetProperty[]; onChange: (p: WidgetProperty[]) => void }) {
  const patch = (id: string, next: Partial<WidgetProperty>) => onChange(properties.map((p) => (p.id === id ? { ...p, ...next } : p)));
  return (
    <div className="space-y-2">
      <p className="text-[11.5px] text-muted-foreground">Public inputs available when the widget is placed in the UI Builder.</p>
      {properties.map((property) => (
        <div key={property.id} className="space-y-1.5 rounded-[3px] border border-border bg-surface-sunken p-2">
          <div className="flex items-center gap-1.5">
            <TextInput value={property.name} onChange={(name) => patch(property.id, { name })} placeholder="propertyName" />
            <button
              type="button"
              aria-label="Remove property"
              onClick={() => onChange(properties.filter((p) => p.id !== property.id))}
              className="grid size-7 shrink-0 place-items-center rounded-[3px] border border-border text-muted-foreground hover:text-destructive"
            >
              <Icon name="trash-2" className="size-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <SelectInput
              value={property.type}
              onChange={(type) => patch(property.id, { type: type as WidgetProperty["type"] })}
              options={["String", "Number", "Boolean", "Reference", "Object"].map((t) => ({ value: t, label: t }))}
            />
            <TextInput value={property.default} onChange={(value) => patch(property.id, { default: value })} placeholder="default" />
          </div>
          <Toggle label="Required" checked={property.required} onChange={(required) => patch(property.id, { required })} />
        </div>
      ))}
      <AddButton
        label="Add property"
        onClick={() => onChange([...properties, { id: newId("p"), name: "", type: "String", default: "", required: false }])}
      />
    </div>
  );
}

function BindingList({ bindings, onChange }: { bindings: WidgetBinding[]; onChange: (b: WidgetBinding[]) => void }) {
  const patch = (id: string, next: Partial<WidgetBinding>) => onChange(bindings.map((b) => (b.id === id ? { ...b, ...next } : b)));
  return (
    <div className="space-y-2">
      <p className="text-[11.5px] text-muted-foreground">Data supplied to the component by the server script.</p>
      {bindings.map((binding) => (
        <div key={binding.id} className="space-y-1.5 rounded-[3px] border border-border bg-surface-sunken p-2">
          <div className="flex items-center gap-1.5">
            <TextInput value={binding.name} onChange={(name) => patch(binding.id, { name })} placeholder="bindingName" />
            <button
              type="button"
              aria-label="Remove binding"
              onClick={() => onChange(bindings.filter((b) => b.id !== binding.id))}
              className="grid size-7 shrink-0 place-items-center rounded-[3px] border border-border text-muted-foreground hover:text-destructive"
            >
              <Icon name="trash-2" className="size-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <SelectInput
              value={binding.dataType}
              onChange={(dataType) => patch(binding.id, { dataType: dataType as WidgetBinding["dataType"] })}
              options={["Record", "RecordList", "Aggregate", "Value"].map((t) => ({ value: t, label: t }))}
            />
            <TextInput value={binding.source} onChange={(source) => patch(binding.id, { source })} placeholder="server.data" />
          </div>
        </div>
      ))}
      <AddButton
        label="Add binding"
        onClick={() => onChange([...bindings, { id: newId("b"), name: "", dataType: "Record", source: "" }])}
      />
    </div>
  );
}

function EventList({ events, onChange }: { events: WidgetEvent[]; onChange: (e: WidgetEvent[]) => void }) {
  const patch = (id: string, next: Partial<WidgetEvent>) => onChange(events.map((e) => (e.id === id ? { ...e, ...next } : e)));
  return (
    <div className="space-y-2">
      <p className="text-[11.5px] text-muted-foreground">Events the UI Builder can react to.</p>
      {events.map((event) => (
        <div key={event.id} className="space-y-1.5 rounded-[3px] border border-border bg-surface-sunken p-2">
          <div className="flex items-center gap-1.5">
            <TextInput value={event.name} onChange={(name) => patch(event.id, { name })} placeholder="onSomething" />
            <button
              type="button"
              aria-label="Remove event"
              onClick={() => onChange(events.filter((e) => e.id !== event.id))}
              className="grid size-7 shrink-0 place-items-center rounded-[3px] border border-border text-muted-foreground hover:text-destructive"
            >
              <Icon name="trash-2" className="size-3.5" />
            </button>
          </div>
          <TextInput value={event.description} onChange={(description) => patch(event.id, { description })} placeholder="Description" />
        </div>
      ))}
      <AddButton label="Add event" onClick={() => onChange([...events, { id: newId("e"), name: "", description: "" }])} />
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-background px-2 py-1 text-[12px] text-foreground hover:bg-muted"
    >
      <Icon name="plus" className="size-3.5" />
      {label}
    </button>
  );
}
