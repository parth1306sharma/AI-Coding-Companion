function Explorer({
  files,
  selectedFile,
  setSelectedFile,
  createNewFile,
  deleteFile,
}) {
  const getIcon = (file) => {
    if (file.endsWith(".jsx")) return "⚛️";
    if (file.endsWith(".js")) return "🟨";
    if (file.endsWith(".css")) return "🎨";
    if (file.endsWith(".html")) return "🌐";
    if (file.endsWith(".json")) return "📦";
    return "📄";
  };

  return (
    <div className="w-64 bg-[#252526] border-r border-gray-700 flex flex-col">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">

        <h2 className="text-white font-bold tracking-wide uppercase text-sm">
          Explorer
        </h2>

        <button
          onClick={createNewFile}
          className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
          title="New File"
        >
          +
        </button>

      </div>

      {/* Files */}
      <div className="flex-1 overflow-y-auto p-2">

        {files.map((file) => (
          <div
            key={file}
            className={`flex items-center justify-between rounded transition mb-1 ${
              selectedFile === file
                ? "bg-blue-600 text-white"
                : "hover:bg-[#37373d] text-gray-300"
            }`}
          >
            <button
              onClick={() => setSelectedFile(file)}
              className="flex items-center gap-3 flex-1 px-3 py-2 text-left"
            >
              <span>{getIcon(file)}</span>

              <span className="truncate">
                {file}
              </span>
            </button>

            <button
              onClick={() => deleteFile(file)}
              className="px-3 text-red-400 hover:text-red-300"
              title="Delete File"
            >
              🗑️
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Explorer;