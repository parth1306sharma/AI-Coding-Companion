import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { chatWithAI } from "../services/ai";
import { runCode, runLeetCodeCode } from "../services/runCode";

// ======================================
// Regular code block — copy / insert into editor
// ======================================

function CodeBlock({ language, value, setCode, editorRef }) {
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error(err);
    }
  };

  const insertCode = () => {
    if (!editorRef?.current) return;

    editorRef.current.focus();

    if (setCode) {
      setCode(value);
    }
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700">
      <div className="flex justify-between items-center bg-[#2d2d2d] px-4 py-2">
        <span className="text-gray-400 text-sm">{language || "code"}</span>

        <div className="flex gap-2">
          <button
            onClick={copyCode}
            className="text-xs px-3 py-1 rounded bg-gray-600 hover:bg-gray-500"
          >
            Copy
          </button>

          <button
            onClick={insertCode}
            className="text-xs px-3 py-1 rounded bg-blue-600 hover:bg-blue-500"
          >
            Insert
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, background: "#1e1e1e", fontSize: "14px" }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

// ======================================
// Test case block — AI-generated test cases the user can
// actually run their current code against, right inline.
//
// LeetCode problems are a bare `class Solution { ... }` with no
// main() - they need the harness-building /execute/leetcode route
// (via runLeetCodeCode) instead of the plain stdin-based runCode
// Codeforces/CodeChef use.
// ======================================

function TestCaseBlock({ value, code, language, problem }) {
  const [cases] = useState(() => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  });

  const [results, setResults] = useState({});

  const isLeetCode = problem?.platform === "LeetCode";

  const runOne = async (index) => {
    const tc = cases[index];

    if (isLeetCode && !problem?.functionMeta) {
      setResults((prev) => ({
        ...prev,
        [index]: {
          status: "done",
          actual: "",
          stderr:
            "This LeetCode problem is missing function signature data. Try re-importing it.",
          pass: false,
        },
      }));
      return;
    }

    setResults((prev) => ({ ...prev, [index]: { status: "running" } }));

    try {
      const data = isLeetCode
        ? await runLeetCodeCode(language, code, problem.functionMeta, tc.input || "")
        : await runCode(language, code, tc.input || "");

      if (data.success === false) {
        setResults((prev) => ({
          ...prev,
          [index]: {
            status: "done",
            actual: "",
            stderr: data.message || "Couldn't run this test case.",
            pass: false,
          },
        }));
        return;
      }

      const stderr = data?.compile?.stderr || data?.run?.stderr || "";
      const actual = (data?.run?.stdout || "").trim();
      const expected = (tc.output || "").trim();
      const pass = !stderr && expected !== "" && actual === expected;

      setResults((prev) => ({
        ...prev,
        [index]: { status: "done", actual, stderr, pass },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [index]: {
          status: "done",
          actual: "",
          stderr: "Couldn't run this test case.",
          pass: false,
        },
      }));
    }
  };

  const runAll = () => {
    cases.forEach((_, i) => runOne(i));
  };

  if (!cases || cases.length === 0) {
    return (
      <div className="my-4 p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 text-rose-300 text-xs">
        Couldn't parse the generated test cases.
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700">
      <div className="flex justify-between items-center bg-[#2d2d2d] px-4 py-2">
        <span className="text-gray-300 text-sm font-semibold">
          🧪 {cases.length} test case{cases.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={runAll}
          className="text-xs px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 font-medium"
        >
          ▶ Run All
        </button>
      </div>

      <div className="divide-y divide-gray-700 bg-[#1a1a1a]">
        {cases.map((tc, i) => {
          const r = results[i];

          return (
            <div key={i} className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {tc.explanation && (
                    <p className="text-xs text-gray-400 mb-2">{tc.explanation}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                        Input
                      </div>
                      <pre className="bg-[#111] rounded p-2 text-[12px] font-mono text-gray-200 overflow-x-auto whitespace-pre-wrap">
                        {tc.input || "\u00A0"}
                      </pre>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                        Expected
                      </div>
                      <pre className="bg-[#111] rounded p-2 text-[12px] font-mono text-gray-200 overflow-x-auto whitespace-pre-wrap">
                        {tc.output || "\u00A0"}
                      </pre>
                    </div>
                  </div>

                  {r?.status === "done" && (
                    <div className="mt-2">
                      <div
                        className={`text-xs font-semibold mb-1 ${
                          r.pass ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {r.pass ? "✅ Matches expected output" : "❌ Doesn't match"}
                      </div>

                      <pre className="bg-[#111] rounded p-2 text-[12px] font-mono text-rose-300/90 overflow-x-auto whitespace-pre-wrap">
                        {r.stderr || r.actual || "(no output)"}
                      </pre>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => runOne(i)}
                  disabled={r?.status === "running"}
                  className="shrink-0 text-xs px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
                >
                  {r?.status === "running" ? "Running…" : "▶ Run"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ======================================
// Quick actions
// ======================================

const QUICK_ACTIONS = [
  {
    icon: "💡",
    title: "Explain Code",
    prompt: "Explain this code",
  },
  {
    icon: "🧪",
    title: "Generate Test Cases",
    prompt: "Generate more test cases for this problem",
  },
  {
    icon: "⚠️",
    title: "Edge Cases",
    prompt: "Give me edge cases to test this code against",
  },
  {
    icon: "🐞",
    title: "Find Bugs",
    prompt: "Find bugs in this code",
  },
  {
    icon: "⚡",
    title: "Optimize Code",
    prompt: "Optimize this code",
  },
];

function AIChat({ code, setCode, language, problem, editorRef }) {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (customPrompt = "") => {
    const text = customPrompt || prompt;

    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await chatWithAI(code, text, problem);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.reply },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "❌ Something went wrong." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="w-[430px] flex flex-col bg-[#1e1e1e] border-l border-gray-700">

      {/* Header */}
      <div className="h-16 shrink-0 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-5">
        <div>
          <h2 className="text-white text-lg font-bold">🤖 AI Assistant</h2>
          <p className="text-xs text-gray-500">Your coding co-pilot</p>
        </div>
      </div>

      {/* Quick actions — one persistent, always-visible toolbar */}
      <div className="shrink-0 flex flex-wrap gap-1.5 px-3 py-2.5 border-b border-[#2d2d2d] bg-[#191919]">
        {QUICK_ACTIONS.map((item) => (
          <button
            key={item.title}
            onClick={() => sendMessage(item.prompt)}
            disabled={loading}
            title={item.title}
            className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-[#252526] border border-[#323232] text-gray-300 hover:border-blue-500 hover:text-white hover:bg-[#2d2d30] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{item.icon}</span>
            {item.title}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4">

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-5">🤖</div>

            <h2 className="text-2xl font-bold text-white">AI Assistant</h2>

            <p className="text-gray-400 mt-2 max-w-[280px]">
              Ask anything about your code, or use a shortcut above to get started.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`my-5 ${msg.role === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block rounded-2xl px-5 py-4 shadow-lg max-w-full ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                  : "bg-[#252526] border border-[#323232] text-white"
              }`}
            >
              <div className="font-semibold mb-2 text-sm">
                {msg.role === "user" ? "🧑 You" : "🤖 AI"}
              </div>

              {msg.role === "assistant" ? (
                <div className="prose prose-invert max-w-none text-sm">
                  <ReactMarkdown
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const value = String(children).replace(/\n$/, "");

                        if (!inline && match?.[1] === "testcases") {
                          return (
                            <TestCaseBlock
                              value={value}
                              code={code}
                              language={language}
                              problem={problem}
                            />
                          );
                        }

                        if (!inline && match) {
                          return (
                            <CodeBlock
                              language={match[1]}
                              value={value}
                              setCode={setCode}
                              editorRef={editorRef}
                            />
                          );
                        }

                        return (
                          <code className="bg-gray-800 px-1 py-0.5 rounded" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 my-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              🤖
            </div>

            <div className="bg-[#252526] rounded-xl px-5 py-4 border border-[#323232]">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-700 p-4">
        <textarea
          rows={4}
          value={prompt}
          placeholder="Ask anything about your code..."
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="w-full bg-[#252526] text-white rounded-lg p-3 resize-none outline-none border border-transparent focus:border-blue-500 transition"
        />

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500"></span>

          <button
            disabled={loading}
            onClick={() => sendMessage()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 px-8 py-2 rounded-lg text-white font-semibold transition"
          >
            {loading ? "Thinking..." : "🚀 Send"}
          </button>
        </div>
      </div>

    </div>
  );
}

export default AIChat;