import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
function CodeEditor({
  code,
  selectedFile,
  setFiles,
  editorRef,
  setCursorPosition,
}) {
  const monacoRef = useRef(null);

  function handleMount(editor) {
  monacoRef.current = editor;

  if (editorRef) {
    editorRef.current = editor;
  }

  editor.onDidChangeCursorPosition((e) => {
    setCursorPosition?.(e.position);
  });
}

  useEffect(() => {
    if (!monacoRef.current) return;

    monacoRef.current.setValue(code);
  }, [code]);

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      language="javascript"
      value={code}
      onMount={handleMount}
      onChange={(value) =>
        setFiles((prev) => ({
          ...prev,
          [selectedFile]: value || "",
        }))
      }
      options={{
        fontSize: 15,
        minimap: {
          enabled: false,
        },
        automaticLayout: true,
      }}
    />
  );
}

export default CodeEditor;