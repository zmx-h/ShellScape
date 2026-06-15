import { useRef } from 'react'
import { isTauri } from '@tauri-apps/api/core'
import { useSettingsStore } from '../stores/settingsStore'
import { FIT_MODE_LABELS, POSITION_LABELS } from '../types/settings'
import type { FitMode, BackgroundPosition, BackgroundType } from '../types/settings'

interface ToolbarProps {
  onOpenSettings: () => void
}

export function Toolbar({ onOpenSettings }: ToolbarProps) {
  const background = useSettingsStore((s) => s.background)
  const toolbarPinned = useSettingsStore((s) => s.ui.toolbarPinned)
  const setFitMode = useSettingsStore((s) => s.setFitMode)
  const setBackgroundPosition = useSettingsStore((s) => s.setBackgroundPosition)
  const setOpacity = useSettingsStore((s) => s.setOpacity)
  const setBackground = useSettingsStore((s) => s.setBackground)
  const clearBackground = useSettingsStore((s) => s.clearBackground)
  const toggleToolbarPin = useSettingsStore((s) => s.toggleToolbarPin)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilePick = async () => {
    if (isTauri()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog')
        const selected = await open({
          multiple: false,
          filters: [{
            name: 'Media',
            extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'mov']
          }]
        })
        if (selected && typeof selected === 'string') {
          const ext = selected.toLowerCase().split('.').pop()
          const videoExts = ['mp4', 'webm', 'mov']
          const type: BackgroundType = videoExts.includes(ext ?? '') ? 'video' : 'image'
          setBackground({ type, path: selected })
        }
      } catch {
        // Fall back to HTML file input
        fileInputRef.current?.click()
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const path = (file as any).path ?? file.name
    const ext = file.name.toLowerCase().split('.').pop()
    const videoExts = ['mp4', 'webm', 'ogv', 'mov']
    const type: BackgroundType = videoExts.includes(ext ?? '') ? 'video' : 'image'
    setBackground({ type, path })
  }

  const handleClear = () => {
    clearBackground()
  }

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-black/50 backdrop-blur-sm">
      <button
        className="text-white/80 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
        onClick={handleFilePick}
      >
        选择背景
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {background.type !== 'none' && (
        <button
          className="text-white/60 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
          onClick={handleClear}
        >
          清除背景
        </button>
      )}

      <div className="w-px h-4 bg-white/20" />

      <label className="text-white/70 text-xs flex items-center gap-1.5">
        透明度
        <input
          type="range"
          min="5"
          max="95"
          value={Math.round(background.opacity * 100)}
          onChange={(e) => setOpacity(Number(e.target.value) / 100)}
          className="w-24 h-1 accent-white/80 cursor-pointer"
        />
        <span className="w-8 text-right">{Math.round(background.opacity * 100)}%</span>
      </label>

      <div className="w-px h-4 bg-white/20" />

      {(['cover', 'contain', 'fill', 'none'] as FitMode[]).map((mode) => (
        <button
          key={mode}
          className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
            background.fitMode === mode
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          onClick={() => setFitMode(mode)}
        >
          {FIT_MODE_LABELS[mode]}
        </button>
      ))}

      <div className="w-px h-4 bg-white/20" />

      <label className="text-white/70 text-xs flex items-center gap-1">
        位置
        <select
          value={background.position}
          onChange={(e) => setBackgroundPosition(e.target.value as BackgroundPosition)}
          className="bg-white/10 text-white/80 text-xs rounded px-1 py-0.5 border border-white/20 cursor-pointer"
        >
          {Object.entries(POSITION_LABELS).map(([value, label]) => (
            <option key={value} value={value} className="bg-gray-800">
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex-1" />

      <button
        className="text-white/80 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
        onClick={onOpenSettings}
      >
        终端设置
      </button>

      <button
        className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
          toolbarPinned
            ? 'bg-white/20 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        onClick={toggleToolbarPin}
        title="Ctrl+Shift+L"
      >
        {toolbarPinned ? '📌 已固定' : '📌'}
      </button>
    </div>
  )
}
