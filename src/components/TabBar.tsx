export function TabBar() {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1 bg-black/50 backdrop-blur-sm">
      <button className="flex items-center gap-1.5 px-3 py-1 rounded-t text-xs bg-white/10 text-white cursor-pointer">
        <span className="text-green-400 text-[10px]">●</span>
        PowerShell
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1 rounded-t text-xs text-white/50 hover:text-white/80 hover:bg-white/5 cursor-pointer">
        <span className="text-yellow-400 text-[10px]">●</span>
        Git Bash
      </button>
      <button className="flex items-center gap-1.5 px-2 py-1 rounded-t text-xs text-white/40 hover:text-white/70 hover:bg-white/5 cursor-pointer">
        +
      </button>
    </div>
  )
}
