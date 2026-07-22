import { useState, useRef, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
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
  if (!editorRef?.current) return;

  const editor = editorRef.current;

  // Replace entire editor content
  const model = editor.getModel();


  editor.focus();

  // Update React state
  if (setCode) {
    setCode(value);
  }
  alert("✅ Code inserted into editor");
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
<div className="h-16 bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between px-5">

  <div>

    <h2 className="text-white text-lg font-bold">
      🤖 AI Assistant
    </h2>

    <p className="text-xs text-gray-500">
      Powered by Gemini 2.5 Flash
    </p>

  </div>

  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

</div>
      {/* Chat */}

      <div className="flex-1 overflow-y-auto p-4">

       {messages.length === 0 && (
  <div className="h-full flex flex-col justify-center">

    <div className="text-center">

      <div className="text-6xl mb-5">
        🤖
      </div>

      <h2 className="text-3xl font-bold text-white">
        AI Assistant
      </h2>

      <p className="text-gray-400 mt-2 mb-8">
        Your personal coding companion powered by Gemini
      </p>

    </div>

    <div className="grid gap-3">

      {[
        {
          icon: "💡",
          title: "Explain Code",
          prompt: "Explain this code",
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
        {
          icon: "📝",
          title: "Generate Component",
          prompt: "Generate a React component",
        },
        {
          icon: "🔄",
          title: "Convert to TypeScript",
          prompt: "Convert this code to TypeScript",
        },
      ].map((item) => (
        <button
          key={item.title}
          onClick={() => sendMessage(item.prompt)}
          className="flex items-center gap-4 p-4 rounded-xl bg-[#252526] border border-[#323232] hover:border-blue-500 hover:bg-[#2d2d30] transition-all duration-300 hover:scale-[1.02]"
        >
          <span className="text-2xl">{item.icon}</span>

          <div className="text-left">
            <h3 className="text-white font-semibold">
              {item.title}
            </h3>

            <p className="text-xs text-gray-400">
              Click to ask AI
            </p>
          </div>
        </button>
      ))}

    </div>

  </div>
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
             className={`inline-block rounded-2xl px-5 py-4 shadow-lg max-w-full

${
msg.role === "user"
? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
: "bg-[#252526] border border-[#323232] text-white"
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
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

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
  <p className="whitespace-pre-wrap">{msg.text}</p>
)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-400">
            <div className="flex items-center gap-3 my-4">

  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
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