import { useEffect, useState, type ComponentType } from "react";
import { Icon } from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import type { ScriptFieldEditorProps } from "./ScriptFieldEditor";

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

/** Script field control: Monaco Editor (lazy, client-only) with a fullscreen toggle. */
export function ScriptField({ id, value, onChange, disabled, invalid }: Props) {
  const [MonacoEditor, setMonacoEditor] = useState<ComponentType<ScriptFieldEditorProps> | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let alive = true;
    import("./ScriptFieldEditor")
      .then((m) => alive && setMonacoEditor(() => m.ScriptFieldEditor))
      .catch(() => alive && setLoadFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const body = (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-[3px] border bg-background",
        invalid ? "border-destructive" : "border-input focus-within:border-ring",
        fullscreen && "h-full",
      )}
    >
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-surface-sunken px-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Icon name="file-code" className="size-3.5" />
          JavaScript
        </span>
        <button
          type="button"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? "Exit fullscreen" : "Open editor in fullscreen"}
          title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          className="flex items-center gap-1 rounded-[3px] px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon name={fullscreen ? "minimize-2" : "maximize-2"} className="size-3.5" />
          {fullscreen ? "Exit" : "Fullscreen"}
        </button>
      </div>

      <div className={cn("min-h-0", fullscreen && "flex-1")} id={id}>
        {loadFailed ? (
          <textarea
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            rows={14}
            className="h-full min-h-56 w-full resize-y bg-background p-2.5 font-mono text-[12.5px] leading-5 text-foreground outline-none"
          />
        ) : MonacoEditor ? (
          <MonacoEditor value={value} onChange={onChange} disabled={disabled} height={fullscreen ? "100%" : 400} />
        ) : (
          <div className="flex h-[400px] items-center justify-center gap-2 text-[12px] text-muted-foreground">
            <Icon name="loader-circle" className="size-4 animate-spin" />
            Loading editor...
          </div>
        )}
      </div>
    </div>
  );

  if (!fullscreen) return body;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Script editor fullscreen">
      {body}
    </div>
  );
}
