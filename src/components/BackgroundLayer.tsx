import { useSettingsStore } from '../stores/settingsStore'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    __TAURI_INTERNALS__?: { invoke?: Function }
  }
}

export function BackgroundLayer() {
  const background = useSettingsStore((s) => s.background)
  const [safeUrl, setSafeUrl] = useState<string | null>(null)

  const isInTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined

  useEffect(() => {
    if (background.type === 'none' || !background.path) {
      setSafeUrl(null)
      return
    }

    if (isInTauri) {
      import('@tauri-apps/api/core').then(async ({ invoke }) => {
        try {
          const dataUrl = await invoke<string>('read_file_as_data_url', { path: background.path })
          console.log(`[bg] Got data URL, length=${dataUrl.length}`)
          setSafeUrl(dataUrl)
        } catch (e) {
          console.error('[bg] invoke read_file_as_data_url failed:', e)
          setSafeUrl(null)
        }
      }).catch((e) => {
        console.error('[bg] Failed to import @tauri-apps/api/core:', e)
        setSafeUrl(null)
      })
    } else {
      // Dev mode in browser — can't load local files directly
      console.log('[bg] Not in Tauri, setting path as-is for dev mode')
      setSafeUrl(background.path)
    }
  }, [background.path, background.type, isInTauri])

  if (background.type === 'none' || !background.path || !safeUrl) {
    return <div className="absolute inset-0 bg-black" />
  }

  const objectPosition = background.position.replace('-', ' ') as string

  const commonStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: background.fitMode === 'none' ? undefined : (background.fitMode as any),
    objectPosition,
    pointerEvents: 'none',
    filter: 'brightness(0.45)',
  }

  const mediaEl =
    background.type === 'video' ? (
      <video
        src={safeUrl}
        autoPlay loop muted playsInline
        style={commonStyle}
        onError={(e) => console.error('[bg] video error:', (e.target as HTMLVideoElement).src.substring(0, 80))}
      />
    ) : (
      <img
        src={safeUrl}
        alt="bg"
        style={commonStyle}
        onError={(e) => console.error('[bg] img error:', (e.target as HTMLImageElement).src.substring(0, 80))}
      />
    )

  return (
    <>
      {mediaEl}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </>
  )
}
