function SampleTests({ examples }) {
  if (!examples || examples.length === 0) return null;

  return (
    <div className="bg-[#252526] rounded-xl border border-[#323232] p-5">
      <h2 className="text-lg font-bold text-cyan-400 mb-4">
        🧪 Sample Test Cases
      </h2>

      <div className="space-y-5">
        {examples.map((example, index) => (
          <div
            key={index}
            className="border border-[#3a3a3a] rounded-lg overflow-hidden"
          >
            <div className="bg-[#2d2d2d] px-4 py-2 font-semibold">
              Sample #{index + 1}
            </div>

            <div className="p-4 space-y-4">

              <div>
                <h3 className="text-green-400 font-semibold mb-2">
                  Input
                </h3>

                <pre className="bg-[#1e1e1e] p-3 rounded text-gray-300 whitespace-pre-wrap">
                  {example.input}
                </pre>
              </div>

              <div>
                <h3 className="text-blue-400 font-semibold mb-2">
                  Output
                </h3>

                <pre className="bg-[#1e1e1e] p-3 rounded text-gray-300 whitespace-pre-wrap">
                  {example.output}
                </pre>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SampleTests;