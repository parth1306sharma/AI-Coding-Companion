import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { analyzeProblem } from "../../services/gemini";

import ProblemImporter from "./ProblemImporter";
import ProblemViewer from "./ProblemViewer";
import SampleTests from "./SampleTests";

function ProblemPanel({ problem, setProblem }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!problem?.title) {
      alert("Please import a problem first.");
      return;
    }

    setLoading(true);

    try {
      const prompt = `
You are a Competitive Programming Expert.

Analyze this problem.

Return ONLY markdown.

# 📝 Summary

(2-3 sentences)

# 🔥 Difficulty

Easy / Medium / Hard

# ⚙️ Algorithms

- Algorithm
- Data Structure

# 💡 Hints

1.
2.
3.

# ⏱ Complexity

Time:

Space:

# ❌ Common Mistakes

- Mistake 1
- Mistake 2

Problem:

${JSON.stringify(problem, null, 2)}
`;

      const result = await analyzeProblem(prompt);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setAnalysis("❌ Failed to analyze problem.");
    }

    setLoading(false);
  };

  return (
    <div className="w-[35%] bg-[#1b1b1b] border-r border-[#2d2d2d] flex flex-col overflow-y-auto">

      {/* Header */}
      <div className="p-4 border-b border-[#2d2d2d]">
        <h2 className="text-xl font-bold">
          📄 Problem
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Import a problem or paste one manually.
        </p>
      </div>

      <div className="p-4 space-y-5">

        {/* Import Problem */}
        <ProblemImporter
          setProblem={setProblem}
        />

        {/* Problem Viewer */}
        <ProblemViewer
          problem={problem}
        />

        {/* Sample Tests */}
        <SampleTests
          examples={problem?.examples || []}
        />

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg py-3 font-semibold transition"
        >
          {loading ? "⏳ Analyzing..." : "🤖 Analyze Problem"}
        </button>

        {/* AI Analysis */}
        {analysis && (
          <div className="bg-[#252526] rounded-xl border border-[#323232] p-5">

            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-cyan-400 mt-6 mb-3 border-b border-[#3b3b3b] pb-2">
                    {children}
                  </h1>
                ),

                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-cyan-300 mt-5 mb-2">
                    {children}
                  </h2>
                ),

                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-cyan-200 mt-4 mb-2">
                    {children}
                  </h3>
                ),

                p: ({ children }) => (
                  <p className="text-gray-300 leading-7 mb-3">
                    {children}
                  </p>
                ),

                ul: ({ children }) => (
                  <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 text-gray-300 space-y-2 mb-4">
                    {children}
                  </ol>
                ),

                li: ({ children }) => (
                  <li>{children}</li>
                ),

                strong: ({ children }) => (
                  <strong className="text-white">
                    {children}
                  </strong>
                ),

                code: ({ children }) => (
                  <code className="bg-[#2d2d2d] text-green-400 px-2 py-1 rounded">
                    {children}
                  </code>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>

          </div>
        )}

      </div>

    </div>
  );
}

export default ProblemPanel;