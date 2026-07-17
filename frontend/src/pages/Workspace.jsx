import { useState, useRef } from "react";
import Explorer from "../components/Explorer";
import CodeEditor from "../components/CodeEditor";
import AIChat from "../components/AIChat";

function Workspace() {
  const [files, setFiles] = useState({
    "App.jsx": `function App() {
  return (
    <h1>Hello World</h1>
  );
}

export default App;`,

    "Home.jsx": `function Home() {
  return (
    <h1>Home Page</h1>
  );
}

export default Home;`,

    "Workspace.jsx": `function Workspace() {
  return <h1>Workspace</h1>;
}

export default Workspace;`,

    "index.css": `body {
  margin: 0;
  padding: 0;
  background: #1e1e1e;
}`,
  });

  const [selectedFile, setSelectedFile] = useState("App.jsx");

  const editorRef = useRef(null);

  // ==========================
  // Create New File
  // ==========================
  const createNewFile = () => {
    const fileName = prompt("Enter file name (example: About.jsx)");

    if (!fileName) return;

    if (files[fileName]) {
      alert("File already exists.");
      return;
    }

    setFiles((prev) => ({
      ...prev,
      [fileName]: "",
    }));

    setSelectedFile(fileName);
  };

  // ==========================
  // Delete File
  // ==========================
  const deleteFile = (fileName) => {
    if (Object.keys(files).length === 1) {
      alert("At least one file is required.");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete "${fileName}"?`
    );

    if (!confirmDelete) return;

    const updatedFiles = { ...files };
    delete updatedFiles[fileName];

    setFiles(updatedFiles);

    if (selectedFile === fileName) {
      setSelectedFile(Object.keys(updatedFiles)[0]);
    }
  };

  // ==========================
  // Insert AI code
  // ==========================
  const insertAtCursor = (text) => {
    const editor = editorRef.current;

    if (!editor) return;

    editor.executeEdits("ai", [
      {
        range: editor.getSelection(),
        text,
        forceMoveMarkers: true,
      },
    ]);

    editor.focus();

    const updatedCode = editor.getModel().getValue();

    setFiles((prev) => ({
      ...prev,
      [selectedFile]: updatedCode,
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white">

      {/* Navbar */}
      <div className="h-14 border-b border-gray-700 bg-[#252526] flex justify-between items-center px-6">

        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>

          <div>
            <h1 className="text-xl font-bold text-white">
              AI Coding Companion
            </h1>

            <p className="text-xs text-gray-400">
              Powered by Gemini
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          {selectedFile}
        </div>

      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Explorer */}
        <Explorer
          files={Object.keys(files)}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          createNewFile={createNewFile}
          deleteFile={deleteFile}
        />

        {/* Editor */}
        <div className="flex-1">
          <CodeEditor
            code={files[selectedFile]}
            selectedFile={selectedFile}
            setFiles={setFiles}
            editorRef={editorRef}
          />
        </div>

        {/* AI Chat */}
        <AIChat
          code={files[selectedFile]}
          editorRef={editorRef}
          setCode={insertAtCursor}
        />

      </div>

    </div>
  );
}

export default Workspace;