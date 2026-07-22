import { useState, useRef } from "react";

import Navbar from "../components/Navbar";
import ProblemPanel from "../components/problem/ProblemPanel";
import CodeEditor from "../components/CodeEditor";
import AIChat from "../components/AIChat";

function Workspace() {
  const [code, setCode] = useState(`function solve() {

}`);

  const [problem, setProblem] = useState({
    platform: "",
    url: "",
    title: "",
    timeLimit: "",
    memoryLimit: "",
    statement: "",
    input: "",
    output: "",
    constraints: "",
    examples: [],
    note: "",
  });

  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const editorRef = useRef(null);

  return (
    <div className="h-screen bg-[#1e1e1e] text-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        {/* Left */}
       <ProblemPanel
  problem={problem}
  setProblem={setProblem}
/>

        {/* Center */}
        <div className="flex-1">
          <CodeEditor
            code={code}
            selectedFile="solution.js"
            setFiles={(updater) => {
              const files = {
                "solution.js": code,
              };

              const updated = updater(files);

              setCode(updated["solution.js"]);
            }}
            editorRef={editorRef}
            output={output}
            setOutput={setOutput}
            running={running}
            setRunning={setRunning}

            // Add these two lines
            sampleInput={problem.examples?.[0]?.input || ""}
            sampleOutput={problem.examples?.[0]?.output || ""}
          />
        </div>

        {/* Right */}
        <AIChat
          code={code}
          setCode={setCode}
          editorRef={editorRef}
        />
      </div>
    </div>
  );
}

export default Workspace;