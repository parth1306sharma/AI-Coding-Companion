import { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

import { runCode, runLeetCodeCode } from "../services/runCode";
import { LANGUAGES } from "../utils/languages";

// ======================================
// Console helpers
// ======================================

const STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  PASSED: "passed",
  FAILED: "failed",
  ERROR: "error",
};

const STATUS_STYLES = {
  [STATUS.IDLE]: { dot: "bg-gray-500", label: "text-gray-400", text: "Idle" },
  [STATUS.RUNNING]: { dot: "bg-amber-400 animate-pulse", label: "text-amber-400", text: "Running" },
  [STATUS.PASSED]: { dot: "bg-emerald-400", label: "text-emerald-400", text: "Passed" },
  [STATUS.FAILED]: { dot: "bg-rose-400", label: "text-rose-400", text: "Failed" },
  [STATUS.ERROR]: { dot: "bg-rose-400", label: "text-rose-400", text: "Error" },
};

function getStatus(output, running) {
  if (running) return STATUS.RUNNING;
  if (!output) return STATUS.IDLE;
  if (output.includes("✅ PASSED")) return STATUS.PASSED;
  if (output.includes("❌ FAILED")) return STATUS.FAILED;
  if (
    /error|exception|traceback|segmentation fault/i.test(output) &&
    !output.includes("SAMPLE TEST")
  )
    return STATUS.ERROR;
  return STATUS.IDLE;
}

// Renders console output with light structure/coloring instead of one flat
// block of green text — section headers, dividers, and the final verdict
// each get their own treatment.
function ConsoleOutput({ output, status }) {
  if (!output) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-600 select-none">
        <span className="text-2xl font-mono">›_</span>
        <p className="text-xs">Run your code to see output here</p>
      </div>
    );
  }

  const lines = output.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (/^=+$/.test(trimmed)) {
          return <div key={i} className="my-1 border-t border-[#2a2a2a]" />;
        }

        if (/^-+$/.test(trimmed)) {
          return (
            <div key={i} className="my-1 border-t border-dashed border-[#2a2a2a]" />
          );
        }

        if (/^(sample test)$/i.test(trimmed.replace(/=/g, "").trim())) {
          return (
            <div key={i} className="text-cyan-400 font-semibold tracking-wide">
              {trimmed.replace(/=/g, "").trim()}
            </div>
          );
        }

        if (/^(input|expected output|your output):?$/i.test(trimmed)) {
          return (
            <div key={i} className="text-sky-400 font-semibold mt-1">
              {line}
            </div>
          );
        }

        if (trimmed === "✅ PASSED") {
          return (
            <div
              key={i}
              className="mt-2 inline-flex items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-semibold w-fit"
            >
              ✅ PASSED
            </div>
          );
        }

        if (trimmed === "❌ FAILED") {
          return (
            <div
              key={i}
              className="mt-2 inline-flex items-center gap-1.5 rounded bg-rose-500/10 px-2 py-0.5 text-rose-400 font-semibold w-fit"
            >
              ❌ FAILED
            </div>
          );
        }

        if (status === STATUS.ERROR) {
          return (
            <div key={i} className="text-rose-300/90">
              {line || "\u00A0"}
            </div>
          );
        }

        return (
          <div key={i} className="text-gray-300">
            {line || "\u00A0"}
          </div>
        );
      })}
    </>
  );
}

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

  problem,
}) {
  const monacoRef = useRef(null);
  const consoleBodyRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const status = getStatus(output, running);
  const statusStyle = STATUS_STYLES[status];

  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [output]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = () => setOutput("");

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
  //
  // LeetCode problems are a bare `class Solution { ... }` with no
  // main() - they need the harness-building /execute/leetcode route
  // instead of the plain stdin-based one Codeforces/CodeChef use.
  // ======================================

  const handleRun = async () => {
    if (!sampleInput) {
      setOutput("No sample test available.");
      return;
    }

    const isLeetCode = problem?.platform === "LeetCode";

    if (isLeetCode && !problem?.functionMeta) {
      setOutput(
        "This LeetCode problem is missing function signature data needed to run it. Try re-importing it."
      );
      return;
    }

    try {
      setRunning(true);
      setOutput("Running...");

      const result = isLeetCode
        ? await runLeetCodeCode(language, code, problem.functionMeta, sampleInput)
        : await runCode(language, code, sampleInput);

      if (result.success === false) {
        setOutput(result.message || "Failed to run this test case.");
        return;
      }

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

      <div className="h-56 bg-[#111111] border-t border-[#333333] flex flex-col">

        {/* Console Header */}
        <div className="h-10 px-3 flex items-center justify-between border-b border-[#2a2a2a] bg-[#161616]">

          <div className="flex items-center gap-3">
            {/* Traffic-light dots */}
            <div className="flex items-center gap-1.5 pl-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>

            <div className="w-px h-4 bg-[#2a2a2a]" />

            <span className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              Console
            </span>

            {/* Status pill */}
            <div className="flex items-center gap-1.5 pl-2">
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
              <span className={`text-[11px] font-medium ${statusStyle.label}`}>
                {statusStyle.text}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              disabled={!output}
              title="Copy output"
              className="text-[11px] text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded hover:bg-white/5 transition"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleClear}
              disabled={!output}
              title="Clear console"
              className="text-[11px] text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded hover:bg-white/5 transition"
            >
              Clear
            </button>
          </div>

        </div>

        {/* Console Body */}
        <div
          ref={consoleBodyRef}
          className="flex-1 overflow-auto px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap font-mono"
        >
          <ConsoleOutput output={output} status={status} />
        </div>

      </div>

    </div>
  );
}

export default CodeEditor;