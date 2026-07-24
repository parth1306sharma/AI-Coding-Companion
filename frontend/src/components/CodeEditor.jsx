import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

import { runCode } from "../services/runCode";
import { LANGUAGES } from "../utils/languages";

function CodeEditor({
  code,
  setCode,

  language,
  setLanguage,

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

    if (monacoRef.current.getValue() !== code) {
      monacoRef.current.setValue(code);
    }
  }, [code]);

  // ======================================
  // Run Sample Test
  // ======================================

  const handleRun = async () => {
    if (!sampleInput) {
      setOutput("No sample test available.");
      return;
    }

    try {
      setRunning(true);
      setOutput("Running...");

      const result = await runCode(
        language,
        code,
        sampleInput
      );

      if (result.compile?.stderr) {
        setOutput(result.compile.stderr);
        return;
      }

      if (result.run?.stderr) {
        setOutput(result.run.stderr);
        return;
      }

      const actual = (result.run?.stdout || "").trim();
      const expected = (sampleOutput || "").trim();

      const passed = actual === expected;

      setOutput(`========== SAMPLE TEST ==========

Input:
${sampleInput}

---------------------------------

Expected Output:
${expected}

---------------------------------

Your Output:
${actual}

=================================

${passed ? "✅ PASSED" : "❌ FAILED"}
`);
    } catch (err) {
      console.error(err);
      setOutput("Execution failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* Top Bar */}

      <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center justify-between px-4">

        <select
          value={language}
          onChange={(e) => {
            const lang = e.target.value;

            setLanguage(lang);
            setCode(LANGUAGES[lang].template);
          }}
          className="bg-[#1e1e1e] border border-[#444] rounded px-3 py-1 text-white"
        >
          {Object.entries(LANGUAGES).map(([key, value]) => (
            <option
              key={key}
              value={key}
            >
              {value.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleRun}
          disabled={running}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-5 py-1 rounded text-white font-semibold transition"
        >
          {running ? "Running..." : "▶ Run"}
        </button>

      </div>

      {/* Monaco Editor */}

      <div className="flex-1">

        <Editor
          height="100%"
          theme="vs-dark"
          language={language}
          value={code}
          onMount={handleMount}
          onChange={(value) => {
            setCode(value || "");
          }}
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

      <div className="h-52 bg-[#111111] border-t border-[#333333] flex flex-col">

        <div className="px-4 py-2 border-b border-[#333333] text-sm font-semibold text-gray-400">
          Console
        </div>

        <pre className="flex-1 overflow-auto p-4 text-green-400 text-sm whitespace-pre-wrap font-mono">
          {output}
        </pre>

      </div>

    </div>
  );
}

export default CodeEditor;