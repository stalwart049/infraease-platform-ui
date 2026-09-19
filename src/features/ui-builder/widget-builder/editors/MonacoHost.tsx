// Browser-only module: loaded lazily by CodeEditor so Monaco never touches SSR.
// Uses the project's existing @monaco-editor/react + monaco-editor dependency.
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import CssWorker from "monaco-editor/language/css/css.worker?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "javascript" || label === "typescript") return new TsWorker();
    if (label === "css" || label === "scss" || label === "less") return new CssWorker();
    return new EditorWorker();
  },
};
loader.config({ monaco });

export interface MonacoHostProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

export function MonacoHost({ value, language, onChange, onMount }: MonacoHostProps) {
  return (
    <Editor
      height="100%"
      language={language}
      theme="vs"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={(editor) => onMount?.(editor)}
      options={{
        lineNumbers: "on",
        folding: true,
        matchBrackets: "always",
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        automaticLayout: true,
        autoIndent: "full",
        tabSize: 2,
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
