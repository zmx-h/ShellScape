import { useSettingsStore } from '../stores/settingsStore'
import { COLOR_SCHEMES } from '../types/settings'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const terminal = useSettingsStore((s) => s.terminal)
  const setTerminal = useSettingsStore((s) => s.setTerminal)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-80 h-full bg-gray-900/95 backdrop-blur-md shadow-2xl overflow-y-auto">
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm tracking-wide">终端设置</h2>
            <button
              className="text-white/60 hover:text-white text-lg leading-none cursor-pointer"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Shell */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-xs">Shell</label>
            <select
              value={terminal.shell}
              onChange={(e) => setTerminal({ shell: e.target.value })}
              className="w-full bg-white/10 text-white/90 rounded px-2 py-1.5 text-xs border border-white/20 cursor-pointer"
            >
              <option value="powershell" className="bg-gray-800">PowerShell</option>
              <option value="cmd" className="bg-gray-800">CMD</option>
              <option value="git-bash" className="bg-gray-800">Git Bash</option>
              <option value="wsl" className="bg-gray-800">WSL</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-xs block">
              字体大小: {terminal.fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="32"
              value={terminal.fontSize}
              onChange={(e) => setTerminal({ fontSize: Number(e.target.value) })}
              className="w-full h-1 accent-white/80 cursor-pointer"
            />
          </div>

          {/* Font Family */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-xs block">字体</label>
            <select
              value={terminal.fontFamily}
              onChange={(e) => setTerminal({ fontFamily: e.target.value })}
              className="w-full bg-white/10 text-white/90 rounded px-2 py-1.5 text-xs border border-white/20 cursor-pointer"
            >
              <option value="Cascadia Code, Fira Code, Consolas, monospace" className="bg-gray-800">
                Cascadia Code
              </option>
              <option value="Fira Code, Consolas, monospace" className="bg-gray-800">
                Fira Code
              </option>
              <option value="JetBrains Mono, Consolas, monospace" className="bg-gray-800">
                JetBrains Mono
              </option>
              <option value="Consolas, monospace" className="bg-gray-800">
                Consolas
              </option>
              <option value="monospace" className="bg-gray-800">
                System Monospace
              </option>
            </select>
          </div>

          {/* Color Scheme */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-xs block">配色方案</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                <button
                  key={key}
                  className={`text-xs px-2 py-1.5 rounded border cursor-pointer transition-colors ${
                    terminal.colorScheme === key
                      ? 'border-white/40 bg-white/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  }`}
                  onClick={() => setTerminal({ colorScheme: key })}
                >
                  {scheme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cursor Style */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-xs block">光标样式</label>
            <div className="flex gap-2">
              {(['block', 'underline', 'bar'] as const).map((style) => (
                <button
                  key={style}
                  className={`text-xs px-2 py-1 rounded border cursor-pointer transition-colors ${
                    terminal.cursorStyle === style
                      ? 'border-white/40 bg-white/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  }`}
                  onClick={() => setTerminal({ cursorStyle: style })}
                >
                  {style === 'block' ? '方块' : style === 'underline' ? '下划线' : '竖线'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
