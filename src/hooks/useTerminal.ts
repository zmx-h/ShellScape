import { useEffect, useRef, useCallback, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { useSettingsStore } from '../stores/settingsStore'
import { COLOR_SCHEMES } from '../types/settings'

export function useTerminal(containerRef: React.RefObject<HTMLDivElement | null>) {
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [ptyStatus, setPtyStatus] = useState<'loading' | 'connected' | 'failed'>('loading')
  const unlistenRef = useRef<(() => void) | null>(null)
  const invokeRef = useRef<((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null>(null)

  const updateTheme = useCallback((term: Terminal, scheme: string, opacity: number) => {
    const colors = COLOR_SCHEMES[scheme] ?? COLOR_SCHEMES.default
    term.options.theme = {
      background: `rgba(0, 0, 0, ${opacity})`,
      foreground: colors.foreground,
      cursor: colors.cursor,
    }
  }, [])

  const updateFont = useCallback((term: Terminal, fontSize: number, fontFamily: string) => {
    term.options.fontSize = fontSize
    term.options.fontFamily = fontFamily
  }, [])

  const notifyResize = useCallback(() => {
    if (!fitAddonRef.current || !invokeRef.current) return
    const dims = fitAddonRef.current.proposeDimensions()
    if (dims) {
      invokeRef.current('resize_pty', { rows: dims.rows, cols: dims.cols }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const store = useSettingsStore.getState()
    const term = new Terminal({
      allowTransparency: true,
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: store.terminal.fontSize,
      fontFamily: store.terminal.fontFamily,
      theme: {
        background: `rgba(0, 0, 0, ${store.background.opacity})`,
        foreground: '#ffffff',
      },
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    terminalRef.current = term
    fitAddonRef.current = fitAddon

    const tauriCheck = typeof (window as any).__TAURI_INTERNALS__ !== 'undefined'
    term.writeln(`\x1b[0;90mTauri mode: ${tauriCheck}\x1b[0m`)

    if (tauriCheck) {
      ;(async () => {
        try {
          const { invoke } = await import('@tauri-apps/api/core')
          const { listen } = await import('@tauri-apps/api/event')
          invokeRef.current = invoke

          term.writeln('\x1b[0;90m• Tauri IPC detected, connecting PTY...\x1b[0m')

          // Notify PTY of initial terminal size
          notifyResize()

          // Forward keystrokes to PTY
          term.onData((data) => {
            invoke('write_pty', { data }).catch((e) => {
              console.error('[terminal] write_pty failed:', e)
              term.writeln(`\r\n\x1b[1;31m[IPC Error: ${e}]\x1b[0m`)
            })
          })

          // Listen for PTY output
          try {
            const unlistenPty = await listen<string>('pty-output', (event) => {
              term.write(event.payload)
            })
            const unlistenExit = await listen('pty-exit', () => {
              term.writeln('\r\n\x1b[1;33m[Process exited]\x1b[0m')
            })

            // Request initial prompt
            invoke('write_pty', { data: '\r' }).catch(() => {})

            unlistenRef.current = () => {
              unlistenPty()
              unlistenExit()
            }
            setPtyStatus('connected')
            term.writeln('\x1b[0;90m• PTY connected. Type commands below.\x1b[0m')
          } catch (e) {
            setPtyStatus('failed')
            term.writeln(`\x1b[1;31m[Event listen failed: ${e}]\x1b[0m`)
          }
        } catch (e) {
          console.error('[terminal] Tauri init error:', e)
          setPtyStatus('failed')
          term.writeln(`\x1b[1;31m[Tauri init error: ${e}]\x1b[0m`)
        }
      })()
    } else {
      setPtyStatus('failed')
      term.writeln('\x1b[0;90mNot in Tauri. Browser dev mode.\x1b[0m')
      term.write('$ ')
      term.onData((data: string) => {
        const cc = data.charCodeAt(0)
        if (cc === 13) { term.writeln(''); term.writeln('\x1b[0;90m(dev mode)\x1b[0m'); term.write('$ ')
        } else if (cc === 127) { if (term.buffer.active.cursorX > 2) term.write('\b \b')
        } else if (cc >= 32) { term.write(data) }
      })
    }

    const ro = new ResizeObserver(() => {
      fitAddon.fit()
      notifyResize()
    })
    ro.observe(containerRef.current)

    const unsub = useSettingsStore.subscribe((state, prevState) => {
      if (!terminalRef.current) return
      if (state.terminal.fontSize !== prevState.terminal.fontSize ||
          state.terminal.fontFamily !== prevState.terminal.fontFamily)
        updateFont(terminalRef.current, state.terminal.fontSize, state.terminal.fontFamily)
      if (state.terminal.colorScheme !== prevState.terminal.colorScheme ||
          state.background.opacity !== prevState.background.opacity)
        updateTheme(terminalRef.current, state.terminal.colorScheme, state.background.opacity)
    })

    return () => {
      unsub()
      if (unlistenRef.current) unlistenRef.current()
      ro.disconnect()
      term.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
      invokeRef.current = null
    }
  }, [containerRef, updateTheme, updateFont, notifyResize])

  return { terminal: terminalRef, fitAddon: fitAddonRef, ptyStatus }
}
