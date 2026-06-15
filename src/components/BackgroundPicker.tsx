import { useRef, useState, useCallback } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import type { BackgroundType } from '../types/settings'

export function BackgroundPicker() {
  const setBackground = useSettingsStore((s) => s.setBackground)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = useCallback((file: File) => {
    const path = (file as any).path ?? file.name
    const ext = file.name.toLowerCase().split('.').pop()
    const videoExts = ['mp4', 'webm', 'ogv', 'mov']
    const type: BackgroundType = videoExts.includes(ext ?? '') ? 'video' : 'image'
    setBackground({ type, path })
  }, [setBackground])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center transition-colors cursor-default ${
        isDragOver ? 'bg-blue-500/20' : 'bg-transparent pointer-events-none'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragOver && (
        <div className="text-center pointer-events-none">
          <div className="text-white/60 text-lg">拖放图片或视频到此处</div>
          <div className="text-white/40 text-sm mt-1">支持 PNG、JPG、GIF、MP4、WebM</div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
