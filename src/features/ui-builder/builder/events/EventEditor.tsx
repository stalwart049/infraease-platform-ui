import { Icon } from "@/components/common/Icon";
import type { ActionConfig, ActionType, EventConfig, UiNode } from "../../models/ui";
import { newId } from "../../models/node-utils";
import { Field, SelectInput, TextInput } from "../properties/controls";

const ACTIONS: { value: ActionType; label: string; params: { name: string; label: string }[] }[] = [
  { value: "navigate", label: "Navigate", params: [{ name: "target", label: "Target" }] },
  { value: "create_record", label: "Create Record", params: [{ name: "table", label: "Table" }, { name: "values", label: "Values" }] },
  { value: "update_record", label: "Update Record", params: [{ name: "table", label: "Table" }, { name: "record", label: "Record" }, { name: "values", label: "Values" }] },
  { value: "delete_record", label: "Delete Record", params: [{ name: "table", label: "Table" }, { name: "record", label: "Record" }] },
  { value: "refresh_data", label: "Refresh Data", params: [{ name: "target", label: "Component" }] },
  { value: "open_modal", label: "Open Modal", params: [{ name: "modal", label: "Modal" }] },
  { value: "close_modal", label: "Close Modal", params: [{ name: "modal", label: "Modal" }] },
  { value: "run_workflow", label: "Run Workflow", params: [{ name: "workflow", label: "Workflow" }] },
  { value: "call_server_script", label: "Call Server Script", params: [{ name: "script", label: "Script" }, { name: "payload", label: "Payload" }] },
];

export function EventEditor({
  node,
  availableEvents,
  onChange,
}: {
  node: UiNode;
  availableEvents: string[];
  onChange: (events: EventConfig[]) => void;
}) {
  const events = node.events;

  const addEvent = () =>
    onChange([...events, { id: newId("ev"), event: availableEvents[0] ?? "onClick", actions: [] }]);

  const patchEvent = (id: string, patch: Partial<EventConfig>) =>
    onChange(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const patchAction = (eventId: string, actionId: string, patch: Partial<ActionConfig>) =>
    onChange(
      events.map((e) =>
        e.id === eventId ? { ...e, actions: e.actions.map((a) => (a.id === actionId ? { ...a, ...patch } : a)) } : e,
      ),
    );

  return (
    <div className="space-y-3">
      {events.length === 0 && (
        <p className="text-[12px] text-muted-foreground">No events configured on this component.</p>
      )}

      {events.map((event) => (
        <div key={event.id} className="space-y-2 rounded-[3px] border border-border bg-surface-sunken p-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="Event">
                <SelectInput
                  value={event.event}
                  onChange={(value) => patchEvent(event.id, { event: value })}
                  options={(availableEvents.length ? availableEvents : ["onClick"]).map((e) => ({ value: e, label: e }))}
                />
              </Field>
            </div>
            <button
              type="button"
              aria-label="Remove event"
              onClick={() => onChange(events.filter((e) => e.id !== event.id))}
              className="mb-0.5 grid size-7 place-items-center rounded-[3px] border border-border text-muted-foreground hover:text-destructive"
            >
              <Icon name="trash-2" className="size-3.5" />
            </button>
          </div>

          <div className="space-y-2 border-l border-border pl-2">
            {event.actions.map((action) => {
              const meta = ACTIONS.find((a) => a.value === action.type) ?? ACTIONS[0]!;
              return (
                <div key={action.id} className="space-y-1.5 rounded-[3px] border border-border bg-background p-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Field label="Action">
                        <SelectInput
                          value={action.type}
                          onChange={(value) => patchAction(event.id, action.id, { type: value as ActionType, params: {} })}
                          options={ACTIONS.map((a) => ({ value: a.value, label: a.label }))}
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove action"
                      onClick={() =>
                        patchEvent(event.id, { actions: event.actions.filter((a) => a.id !== action.id) })
                      }
                      className="mb-0.5 grid size-7 place-items-center rounded-[3px] border border-border text-muted-foreground hover:text-destructive"
                    >
                      <Icon name="x" className="size-3.5" />
                    </button>
                  </div>
                  {meta.params.map((param) => (
                    <Field key={param.name} label={param.label}>
                      <TextInput
                        value={action.params[param.name] ?? ""}
                        onChange={(value) =>
                          patchAction(event.id, action.id, { params: { ...action.params, [param.name]: value } })
                        }
                      />
                    </Field>
                  ))}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() =>
                patchEvent(event.id, {
                  actions: [...event.actions, { id: newId("ac"), type: "navigate", params: {} }],
                })
              }
              className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-background px-2 py-1 text-[11.5px] text-foreground hover:bg-muted"
            >
              <Icon name="plus" className="size-3" />
              Add action
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEvent}
        className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-background px-2 py-1 text-[12px] text-foreground hover:bg-muted"
      >
        <Icon name="zap" className="size-3.5" />
        Add event
      </button>
    </div>
  );
}
