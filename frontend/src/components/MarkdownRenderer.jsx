import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{
                borderRadius: "10px",
                padding: "16px",
                marginTop: "10px",
                marginBottom: "10px",
                fontSize: "14px",
              }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className="bg-gray-800 px-1 py-0.5 rounded text-green-400"
              {...props}
            >
              {children}
            </code>
          );
        },

        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>
        ),

        h2: ({ children }) => (
          <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>
        ),

        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>
        ),

        p: ({ children }) => (
          <p className="mb-3 leading-7">{children}</p>
        ),

        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3">{children}</ul>
        ),

        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3">{children}</ol>
        ),

        li: ({ children }) => (
          <li className="mb-1">{children}</li>
        ),

        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3 text-gray-300">
            {children}
          </blockquote>
        ),

        table: ({ children }) => (
          <table className="table-auto border-collapse border border-gray-600 my-3 w-full">
            {children}
          </table>
        ),

        th: ({ children }) => (
          <th className="border border-gray-600 px-3 py-2 bg-gray-700">
            {children}
          </th>
        ),

        td: ({ children }) => (
          <td className="border border-gray-600 px-3 py-2">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;