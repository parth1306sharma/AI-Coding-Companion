import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ==========================================================
// Math rendering — done as a plain string transform, not a
// post-mount DOM scan. katex/contrib/auto-render has to walk
// the live DOM after React commits and hope nothing about
// mount order/timing gets in its way; that proved unreliable
// in practice (some imports rendered fine, others silently
// left raw "\(...\)" text on screen with no error). Rendering
// straight into the HTML string before it's ever set is
// simpler and has no window where it can silently no-op.
// ==========================================================

function renderOne(tex, displayMode) {
  try {
    return katex.renderToString(tex, {
      throwOnError: false,
      displayMode,
      strict: false,
    });
  } catch {
    // Katex itself choked (shouldn't happen with throwOnError: false,
    // but just in case) — fall back to the untouched source rather
    // than crashing the whole page.
    return tex;
  }
}

function renderMathInHtml(html) {
  if (!html) return html;

  return html
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, tex) => renderOne(tex, true))
    .replace(/\$\$\$([\s\S]+?)\$\$\$/g, (_, tex) => renderOne(tex, false))
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => renderOne(tex, false));
}

function HtmlSection({ html }) {
  const rendered = useMemo(() => renderMathInHtml(html), [html]);

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
        __html: rendered || "",
      }}
    />
  );
}

function ProblemViewer({ problem }) {
  if (!problem?.title) {
    return (
      <div className="text-gray-500 text-center py-10">
        No problem imported.
      </div>
    );
  }

  return (
    <div
      className="bg-[#252526] rounded-xl border border-[#323232] p-5"
    >
      {/* Title */}
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <h1 className="text-2xl font-bold text-white">
          {problem.title}
        </h1>

        {problem.platform && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            {problem.platform}
          </span>
        )}

        {problem.difficulty && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {problem.difficulty}
          </span>
        )}
      </div>

      {/* Limits */}
      {(problem.timeLimit || problem.memoryLimit) && (
        <div className="flex gap-6 text-sm text-gray-400 mb-6">
          {problem.timeLimit && <span>⏱ {problem.timeLimit}</span>}
          {problem.memoryLimit && <span>💾 {problem.memoryLimit}</span>}
        </div>
      )}

      {/* Statement */}
      <section className="mb-8">
        <h2 className="text-cyan-400 font-semibold text-lg mb-3">
          Statement
        </h2>

        <HtmlSection html={problem.statement} />
      </section>

      {/* Input */}
      {problem.input && (
        <section className="mb-8">
          <h2 className="text-cyan-400 font-semibold text-lg mb-3">
            Input
          </h2>

          <HtmlSection html={problem.input} />
        </section>
      )}

      {/* Output */}
      {problem.output && (
        <section className="mb-8">
          <h2 className="text-cyan-400 font-semibold text-lg mb-3">
            Output
          </h2>

          <HtmlSection html={problem.output} />
        </section>
      )}

      {/* Constraints */}
      {problem.constraints && (
        <section className="mb-8">
          <h2 className="text-cyan-400 font-semibold text-lg mb-3">
            Constraints
          </h2>

          <HtmlSection html={problem.constraints} />
        </section>
      )}

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