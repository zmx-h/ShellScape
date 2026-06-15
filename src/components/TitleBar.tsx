import { useState } from 'react'
import { isTauri } from '@tauri-apps/api/core'

export function TitleBar() {
  const [_isMaximized, setIsMaximized] = useState(false)

  const handleMinimize = async () => {
    if (isTauri()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().minimize()
    }
  }

  const handleToggleMaximize = async () => {
    if (isTauri()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      const win = getCurrentWindow()
      await win.toggleMaximize()
      setIsMaximized(await win.isMaximized())
    }
  }

  const handleClose = async () => {
    if (isTauri()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().close()
    }
  }

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-8 px-3 bg-black/60 backdrop-blur-sm select-none"
      onDoubleClick={handleToggleMaximize}
    >
      <span className="text-white/60 text-[11px] tracking-wider ml-2">CLIBackground</span>
      <div className="flex items-center gap-2">
        <button
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"
          title="最小化"
          onClick={handleMinimize}
        />
        <button
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"
          title="最大化"
          onClick={handleToggleMaximize}
        />
        <button
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"
          title="关闭"
          onClick={handleClose}
        />
      </div>
    </div>
  )
}
