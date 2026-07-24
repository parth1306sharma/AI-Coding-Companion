import { useState } from "react";
import ReactMarkdown from "react-markdown";

function ProblemAnalysis({ analysis }) {
  const [showHints, setShowHints] = useState(false);

  return (
    <div className="bg-[#252526] rounded-xl border border-[#323232] p-5">
      <button
        onClick={() => setShowHints(!showHints)}
        className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        {showHints ? "Hide Hints" : "Show Hints"}
      </button>

      <ReactMarkdown>{analysis}</ReactMarkdown>
    </div>
  );
}

export default ProblemAnalysis;