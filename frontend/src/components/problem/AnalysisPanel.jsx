import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiTag,
  FiZap,
  FiClock,
  FiDatabase,
  FiCopy,
  FiCheck,
} from "react-icons/fi";

const TABS = [
  { key: "explanation", label: "Explanation", icon: FiBookOpen },
  { key: "topics", label: "Topics", icon: FiTag },
  { key: "hints", label: "Hints", icon: FiZap },
  { key: "complexity", label: "Complexity", icon: FiClock },
];

function AnalysisPanel({ analysis, loading }) {
  const [activeTab, setActiveTab] = useState("explanation");
  const [revealedHints, setRevealedHints] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab("explanation");
    setRevealedHints(0);
    setCopied(false);
  }, [analysis]);

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] p-8 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
        </div>
        <p className="text-zinc-500 text-sm">Analyzing problem</p>
      </div>
    );
  }

  if (!analysis) return null;

  const hints = analysis.hints || [];
  const topics = analysis.topics || [];

  const revealNextHint = () => {
    setRevealedHints((prev) => Math.min(prev + 1, hints.length));
  };

  const copyComplexity = async () => {
    const text = `Time: ${analysis.timeComplexity || "N/A"}\nSpace: ${
      analysis.spaceComplexity || "N/A"
    }`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Segmented tab control */}
      <div className="p-3 pb-0">
        <div className="flex gap-1 bg-black/20 rounded-xl p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-zinc-800 text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon
                  className={isActive ? "text-indigo-400" : ""}
                  size={14}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 min-h-[150px]">
        {/* Explanation */}
        {activeTab === "explanation" && (
          <p className="text-zinc-300 text-[13.5px] leading-7">
            {analysis.explanation || "No explanation available."}
          </p>
        )}

        {/* Topics */}
        {activeTab === "topics" && (
          <div className="flex flex-wrap gap-2">
            {topics.length > 0 ? (
              topics.map((topic, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-zinc-800/60 border border-white/[0.06] text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {topic}
                </span>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No topics available.</p>
            )}
          </div>
        )}

        {/* Hints - revealed progressively */}
        {activeTab === "hints" && (
          <div className="space-y-2">
            {hints.slice(0, revealedHints).map((hint, i) => (
              <div
                key={i}
                className="flex gap-3 bg-zinc-800/40 border border-white/[0.06] rounded-xl p-3.5 animate-[fadeIn_0.25s_ease-out]"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-zinc-300 text-[13.5px] leading-6">
                  {hint}
                </p>
              </div>
            ))}

            {revealedHints < hints.length && (
              <button
                onClick={revealNextHint}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800/60 hover:bg-zinc-800 active:scale-[0.99] border border-white/[0.06] text-zinc-300 rounded-xl py-2.5 text-[13px] font-medium transition-all"
              >
                <FiZap size={13} className="text-indigo-400" />
                Reveal hint {revealedHints + 1} of {hints.length}
              </button>
            )}

            {hints.length === 0 && (
              <p className="text-zinc-500 text-sm">No hints available.</p>
            )}
          </div>
        )}

        {/* Complexity */}
        {activeTab === "complexity" && (
          <div className="space-y-2">
            <div className="flex items-start gap-3 bg-zinc-800/40 border border-white/[0.06] rounded-xl p-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <FiClock size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-0.5 tracking-wide uppercase">
                  Time
                </p>
                <p className="text-zinc-200 text-[13.5px] font-medium">
                  {analysis.timeComplexity || "Not available."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-zinc-800/40 border border-white/[0.06] rounded-xl p-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <FiDatabase size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-0.5 tracking-wide uppercase">
                  Space
                </p>
                <p className="text-zinc-200 text-[13.5px] font-medium">
                  {analysis.spaceComplexity || "Not available."}
                </p>
              </div>
            </div>

            <button
              onClick={copyComplexity}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800/60 hover:bg-zinc-800 active:scale-[0.99] border border-white/[0.06] text-zinc-400 rounded-xl py-2 text-xs font-medium transition-all"
            >
              {copied ? (
                <>
                  <FiCheck size={13} className="text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <FiCopy size={13} />
                  Copy complexity
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalysisPanel;