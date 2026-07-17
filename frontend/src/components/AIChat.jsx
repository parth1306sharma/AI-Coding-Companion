import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { chatWithAI } from "../services/ai";

function CodeBlock({
  language,
  value,
  setCode,
  editorRef,
}) {
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error(err);
    }
  };

  const insertCode = () => {
    console.log("Insert clicked");

    if (!editorRef) return;

    const editor = editorRef.current;

    if (!editor) return;

    editor.executeEdits("ai", [
      {
        range: editor.getSelection(),
        text: value,
        forceMoveMarkers: true,
      },
    ]);

    editor.focus();
  };
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700">
      <div className="flex justify-between items-center bg-[#2d2d2d] px-4 py-2">
        <span className="text-gray-400 text-sm">
          {language || "code"}
        </span>

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
        customStyle={{
          margin: 0,
          background: "#1e1e1e",
          fontSize: "14px",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

function AIChat({
  code,
  setCode,
  editorRef,
}) {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const bottomRef = useRef(null);
  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages, loading]);
  const suggestions = [

    "Explain this component",
    "Find bugs",
    "Optimize performance",
    "Convert to TypeScript",
    "Add comments",
  ];
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);
  const sendMessage = async (customPrompt = "") => {
    const text = customPrompt || prompt;

    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
      },
    ]);

    setPrompt("");
    setLoading(true);

    try {
      const res = await chatWithAI(code, text);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.reply,
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "❌ Something went wrong.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="w-[430px] flex flex-col bg-[#1e1e1e] border-l border-gray-700">

      {/* Header */}

      <div className="p-4 border-b border-gray-700">
        <h2 className="text-3xl font-bold text-white">
          🤖 AI Assistant
        </h2>
      </div>

      {/* Chat */}

      <div className="flex-1 overflow-y-auto p-4">

        {messages.length === 0 && (
          <>
            <h3 className="text-2xl font-semibold text-white mb-3">
              Welcome 👋
            </h3>

            <p className="text-gray-400 mb-5">
              Ask anything about your code.
            </p>

            <div className="space-y-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  disabled={loading}
                  onClick={() => sendMessage(item)}
                  className="w-full text-left bg-[#2d2d2d] hover:bg-[#3a3a3a] rounded-lg px-4 py-3 text-white transition"
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`my-5 ${msg.role === "user"
              ? "text-right"
              : "text-left"
              }`}
          >
            <div
              className={`inline-block rounded-xl px-4 py-3 max-w-full ${msg.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-[#2d2d2d] text-white"
                }`}
            >
              <div className="font-semibold mb-2">
                {msg.role === "user"
                  ? "🧑 You"
                  : "🤖 AI"}
              </div>

              {msg.role === "assistant" ? (
                <div className="prose prose-invert max-w-none">

                  <ReactMarkdown
                    components={{
                      code({
                        inline,
                        className,
                        children,
                        ...props
                      }) {
                        const match =
                          /language-(\w+)/.exec(
                            className || ""
                          );

                        if (!inline && match) {
                          return (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, "")}
                              setCode={setCode}
                              editorRef={editorRef}
                            />
                          );
                        }

                        return (
                          <code
                            className={className}
                            {...props}
                          >
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
                <p>{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-400">
            🤖 AI is thinking...
          </div>
        )}

       <div ref={messagesEndRef}></div>
<div ref={bottomRef}></div>
   
      </div>

      {/* Input */}

      <div className="border-t border-gray-700 p-4">

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
          className="w-full bg-[#252526] text-white rounded-lg p-3 resize-none outline-none"
        />

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            Press Ctrl + Enter to send
          </span>

          <button
            disabled={loading}
            onClick={() => sendMessage()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 px-8 py-2 rounded-lg text-white font-semibold"
          >
            {loading ? "Thinking..." : "🚀 Send"}
          </button>
        </div>

      </div>

    </div>
  );
}

export default AIChat;