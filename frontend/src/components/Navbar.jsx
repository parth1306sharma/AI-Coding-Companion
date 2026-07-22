function Navbar() {
  return (
    <div className="h-16 bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between px-6">

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl">
          🤖
        </div>

        <div>
          <h1 className="text-white font-bold text-xl">
            AI Coding Companion
          </h1>

          <p className="text-gray-400 text-xs">
            Competitive Programming Assistant
          </p>
        </div>
      </div>

      <div className="text-green-400 text-sm">
        Gemini Connected
      </div>

    </div>
  );
}

export default Navbar;