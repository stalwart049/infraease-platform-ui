// Browser-only module: loaded lazily by ScriptField so Monaco never touches SSR.
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "javascript" || label === "typescript") return new TsWorker();
    return new EditorWorker();
  },
};
loader.config({ monaco });

export interface ScriptFieldEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean | undefined;
  height?: number | string;
}

export function ScriptFieldEditor({ value, onChange, disabled, height = 400 }: ScriptFieldEditorProps) {
  return (
    <Editor
      height={height}
      language="javascript"
      theme="vs"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{
        readOnly: disabled,
        lineNumbers: "on",
        folding: true,
        matchBrackets: "always",
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        automaticLayout: true,
        autoIndent: "full",
        tabSize: 4,
        insertSpaces: true,
        detectIndentation: false,
        minimap: { enabled: false },
        fontSize: 13,
        lineHeight: 20,
        padding: { top: 8, bottom: 8 },
        scrollBeyondLastLine: false,
        renderLineHighlight: "all",
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
        fixedOverflowWidgets: true,
      }}
    />
  );
}
