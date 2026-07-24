import { useState } from "react";

import { analyzeProblem } from "../../services/problem";

import ProblemImporter from "./ProblemImporter";
import ProblemViewer from "./ProblemViewer";
import SampleTests from "./SampleTests";
import AnalysisPanel from "./AnalysisPanel";

function ProblemPanel({ problem, setProblem }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!problem?.title) {
      alert("Please import a problem first.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const result = await analyzeProblem(problem);

      if (!result) {
        alert("Failed to analyze problem. Please try again.");
      }

      setAnalysis(result);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze problem. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="w-[35%] bg-[#1b1b1b] border-r border-[#2d2d2d] flex flex-col overflow-y-auto">

      {/* Sticky header with Analyze button - always reachable, no scrolling needed */}
      <div className="sticky top-0 z-10 bg-[#1b1b1b] border-b border-[#2d2d2d] p-4 space-y-3">
        <div>
          <h2 className="text-xl font-bold">
            📄 Problem
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Import a problem or paste one manually.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg py-3 font-semibold transition"
        >
          {loading ? "⏳ Analyzing..." : "🤖 Analyze Problem"}
        </button>
      </div>

      <div className="p-4 space-y-5">

        {/* Import Problem */}
        <ProblemImporter
          setProblem={setProblem}
        />

        {/* AI Analysis - shown right after import/button, before the long problem statement */}
        {(analysis || loading) && (
          <AnalysisPanel
            analysis={analysis}
            loading={loading}
          />
        )}

        {/* Problem Viewer */}
        <ProblemViewer
          problem={problem}
        />

        {/* Sample Tests */}
        <SampleTests
          examples={problem?.examples || []}
        />

      </div>

    </div>
  );
}

export default ProblemPanel;