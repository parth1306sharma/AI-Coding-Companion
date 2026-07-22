import { useState } from "react";

function ProblemImporter({ setProblem }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) {
      alert("Please enter a problem URL.");
      return;
    }

    setLoading(true);

    try {
      // -----------------------------------------
      // Clean URL
      // -----------------------------------------
      const cleanUrl = url
        .replace(/^\[.*\]\((.*)\)$/, "$1")
        .trim();

      console.log("Sending URL:", cleanUrl);

      // -----------------------------------------
      // Send request to backend
      // -----------------------------------------
      const response = await fetch(
        "http://localhost:8000/api/v1/problem/import",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            url: cleanUrl,
          }),
        }
      );

      // -----------------------------------------
      // Get response
      // -----------------------------------------
      const data = await response.json();

      console.log("Backend response:", data);
      console.log("Problem object:", data.problem);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to import problem."
        );
      }

      // -----------------------------------------
      // Save problem in Workspace state
      // -----------------------------------------
      setProblem(data.problem);
      console.log("setProblem called");
      alert("Problem imported successfully!");

    } catch (error) {
      console.error("Import error:", error);

      alert(
        error.message || "Failed to import problem."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#252526] border border-[#323232] rounded-xl p-4">

      {/* Header */}
      <div className="mb-3">

        <h3 className="text-lg font-semibold text-white">
          🔗 Import Problem
        </h3>

        <p className="text-sm text-gray-400 mt-1">
          Paste a Codeforces problem URL.
        </p>

      </div>

      {/* URL Input */}
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleImport();
          }
        }}
        placeholder="https://codeforces.com/problemset/problem/4/A"
        className="w-full bg-[#1e1e1e] border border-[#3b3b3b] rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
      />

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={loading}
        className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg py-2 font-semibold text-white transition"
      >
        {loading
          ? "⏳ Importing..."
          : "📥 Import Problem"}
      </button>

    </div>
  );
}

export default ProblemImporter;