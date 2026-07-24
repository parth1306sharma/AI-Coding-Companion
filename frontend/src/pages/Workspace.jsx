import { useState, useRef } from "react";

import Navbar from "../components/Navbar";
import ProblemPanel from "../components/problem/ProblemPanel";
import CodeEditor from "../components/CodeEditor";
import AIChat from "../components/AIChat";

import { LANGUAGES } from "../utils/languages";

function Workspace() {
  // ==========================
  // Language & Code
  // ==========================

  const [language, setLanguage] = useState("cpp");

  const [code, setCode] = useState(
    LANGUAGES.cpp.template
  );

  // ==========================
  // Problem
  // ==========================

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

  // ==========================
  // Console
  // ==========================

  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const editorRef = useRef(null);

  return (
    <div className="h-screen bg-[#1e1e1e] text-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        {/* Left Panel */}
        <ProblemPanel
          problem={problem}
          setProblem={setProblem}
        />

        {/* Center Panel */}
        <div className="flex-1">
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            editorRef={editorRef}
            output={output}
            setOutput={setOutput}
            running={running}
            setRunning={setRunning}
            sampleInput={problem.examples?.[0]?.input || ""}
            sampleOutput={problem.examples?.[0]?.output || ""}
          />
        </div>

        {/* Right Panel */}
        <AIChat
          code={code}
          setCode={setCode}
          language={language}
          problem={problem}
          editorRef={editorRef}
        />

      </div>
    </div>
  );
}

export default Workspace;