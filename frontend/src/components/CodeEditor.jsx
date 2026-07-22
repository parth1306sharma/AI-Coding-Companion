import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { runCode } from "../services/runCode";

function CodeEditor({
  code,
  selectedFile,
  setFiles,
  editorRef,
  setCursorPosition,
  output,
  setOutput,
  running,
  setRunning,
  sampleInput,
  sampleOutput,
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

  // ===============================
  // Normal Run
  // ===============================
  const handleRun = async () => {
    try {
      setRunning(true);
      setOutput("Running...");

      const result = await runCode(
        "javascript",
        code
      );

      if (result.compile?.stderr) {
        setOutput(result.compile.stderr);
      } else if (result.run?.stderr) {
        setOutput(result.run.stderr);
      } else {
        setOutput(result.run?.stdout || "Program finished.");
      }
    } catch (err) {
      console.error(err);
      setOutput("Execution failed.");
    }

    setRunning(false);
  };

  // ===============================
  // Run Sample Test
  // ===============================
  const handleRunSample = async () => {
    if (!sampleInput) {
      alert("No sample test available.");
      return;
    }

    try {
      setRunning(true);
      setOutput("Running sample test...");

      const result = await runCode(
        "javascript",
        code,
        sampleInput
      );

      const actual = (result.run?.stdout || "").trim();
      const expected = (sampleOutput || "").trim();

      const passed = actual === expected;

      setOutput(`
Expected Output
-------------------------
${expected}

Your Output
-------------------------
${actual}

=========================

${passed ? "✅ PASSED" : "❌ FAILED"}
      `);
    } catch (err) {
      console.error(err);
      setOutput("Execution failed.");
    }

    setRunning(false);
  };

  return (
    <div className="h-full flex flex-col">

      {/* Top Bar */}
      <div className="h-12 bg-[#252526] border-b border-gray-700 flex justify-between items-center px-4">

        <span className="text-gray-300">
          {selectedFile}
        </span>

        <div className="flex gap-2">

          <button
            onClick={handleRun}
            disabled={running}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-4 py-1 rounded text-white transition"
          >
            {running ? "Running..." : "▶ Run"}
          </button>

          <button
            onClick={handleRunSample}
            disabled={running}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-4 py-1 rounded text-white transition"
          >
            🧪 Run Sample
          </button>

        </div>

      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
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
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Console */}
      <div className="h-48 bg-black border-t border-gray-700 overflow-auto p-4">

        <h3 className="text-green-400 font-semibold mb-3">
          Console
        </h3>

        <pre className="text-gray-200 whitespace-pre-wrap">
          {output}
        </pre>

      </div>

    </div>
  );
}

export default CodeEditor;