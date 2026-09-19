import { useEffect, useRef, useState, type ComponentType } from "react";
import { Icon } from "@/components/common/Icon";
import type { MonacoHostProps } from "./MonacoHost";

interface EditorHandle {
  format: () => void;
  find: () => void;
}

export function CodeEditor({
  value,
  language,
  onChange,
  handleRef,
}: {
  value: string;
  language: string;
  onChange: (value: string) => void;
  handleRef?: { current: EditorHandle | null };
}) {
  const [Host, setHost] = useState<ComponentType<MonacoHostProps> | null>(null);
  const [failed, setFailed] = useState(false);
  const local = useRef<EditorHandle | null>(null);

  useEffect(() => {
    let alive = true;
    import("./MonacoHost")
      .then((m) => alive && setHost(() => m.MonacoHost))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="h-full w-full resize-none bg-background p-3 font-mono text-[12.5px] leading-5 text-foreground outline-none"
      />
    );
  }

  if (!Host) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-[12.5px] text-muted-foreground">
        <Icon name="loader-circle" className="size-4 animate-spin" />
        Loading editor…
      </div>
    );
  }

  return (
    <Host
      value={value}
      language={language}
      onChange={onChange}
      onMount={(editor) => {
        local.current = {
          format: () => void editor.getAction("editor.action.formatDocument")?.run(),
          find: () => void editor.getAction("actions.find")?.run(),
        };
        if (handleRef) handleRef.current = local.current;
      }}
    />
  );
}

export type { EditorHandle };
