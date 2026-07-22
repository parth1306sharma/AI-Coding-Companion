import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

function HtmlSection({ html }) {
  return (
    <div
      className="
        problem-html
        text-gray-300
        leading-7

        [&_p]:mb-4

        [&_ul]:list-disc
        [&_ul]:pl-6
        [&_ul]:mb-4

        [&_ol]:list-decimal
        [&_ol]:pl-6
        [&_ol]:mb-4

        [&_li]:mb-2

        [&_pre]:bg-[#1e1e1e]
        [&_pre]:border
        [&_pre]:border-[#3b3b3b]
        [&_pre]:rounded-lg
        [&_pre]:p-4
        [&_pre]:overflow-x-auto
        [&_pre]:font-mono
        [&_pre]:text-gray-200

        [&_code]:bg-[#333]
        [&_code]:px-1
        [&_code]:rounded

        [&_strong]:text-white
        [&_b]:text-white

        [&_table]:border-collapse
        [&_table]:border
        [&_table]:border-gray-700
        [&_table]:my-4

        [&_td]:border
        [&_td]:border-gray-700
        [&_td]:p-2

        [&_th]:border
        [&_th]:border-gray-700
        [&_th]:p-2
        [&_th]:bg-[#2f2f2f]

        [&_img]:max-w-full
      "
      dangerouslySetInnerHTML={{
        __html: html || "",
      }}
    />
  );
}

function ProblemViewer({ problem }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    renderMathInElement(containerRef.current, {
  delimiters: [
    {
      left: "\\(",
      right: "\\)",
      display: false,
    },
    {
      left: "\\[",
      right: "\\]",
      display: true,
    },
    {
      left: "$$",
      right: "$$",
      display: true,
    },
    {
      left: "$",
      right: "$",
      display: false,
    },
  ],
  throwOnError: false,
});
  }, [problem]);

  if (!problem?.title) {
    return (
      <div className="text-gray-500 text-center py-10">
        No problem imported.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#252526] rounded-xl border border-[#323232] p-5"
    >
      {/* Title */}
      <h1 className="text-2xl font-bold text-white mb-2">
        {problem.title}
      </h1>

      {/* Limits */}
      <div className="flex gap-6 text-sm text-gray-400 mb-6">
        <span>⏱ {problem.timeLimit}</span>
        <span>💾 {problem.memoryLimit}</span>
      </div>

      {/* Statement */}
      <section className="mb-8">
        <h2 className="text-cyan-400 font-semibold text-lg mb-3">
          Statement
        </h2>

        <HtmlSection html={problem.statement} />
      </section>

      {/* Input */}
      <section className="mb-8">
        <h2 className="text-cyan-400 font-semibold text-lg mb-3">
          Input
        </h2>

        <HtmlSection html={problem.input} />
      </section>

      {/* Output */}
      <section className="mb-8">
        <h2 className="text-cyan-400 font-semibold text-lg mb-3">
          Output
        </h2>

        <HtmlSection html={problem.output} />
      </section>

      {/* Note */}
      {problem.note && (
        <section className="mb-8">
          <h2 className="text-cyan-400 font-semibold text-lg mb-3">
            Note
          </h2>

          <HtmlSection html={problem.note} />
        </section>
      )}
    </div>
  );
}

export default ProblemViewer;