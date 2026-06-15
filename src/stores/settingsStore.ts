import { create } from 'zustand'
import type { AppSettings, BackgroundConfig, TerminalConfig, UIConfig, BackgroundType, FitMode, BackgroundPosition } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'

const STORAGE_KEY = 'clibg-settings'

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed, background: { ...DEFAULT_SETTINGS.background, ...parsed.background }, terminal: { ...DEFAULT_SETTINGS.terminal, ...parsed.terminal }, ui: { ...DEFAULT_SETTINGS.ui, ...parsed.ui } }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // silently fail
  }
}

interface SettingsStore extends AppSettings {
  setBackgroundType: (type: BackgroundType) => void
  setBackgroundPath: (path: string) => void
  setFitMode: (mode: FitMode) => void
  setBackgroundPosition: (pos: BackgroundPosition) => void
  setOpacity: (opacity: number) => void
  setBackground: (config: Partial<BackgroundConfig>) => void
  clearBackground: () => void
  setTerminal: (config: Partial<TerminalConfig>) => void
  setUI: (config: Partial<UIConfig>) => void
  toggleToolbarPin: () => void
}

export const useSettingsStore = create<SettingsStore>((set) => {
  const initial = loadSettings()
  return {
    ...initial,
    setBackgroundType: (type) =>
      set((s) => {
        const newState = { ...s, background: { ...s.background, type } }
        saveSettings(newState)
        return newState
      }),
    setBackgroundPath: (path) =>
      set((s) => {
        const newState = { ...s, background: { ...s.background, path } }
        saveSettings(newState)
        return newState
      }),
    setFitMode: (fitMode) =>
      set((s) => {
        const newState = { ...s, background: { ...s.background, fitMode } }
        saveSettings(newState)
        return newState
      }),
    setBackgroundPosition: (position) =>
      set((s) => {
        const newState = { ...s, background: { ...s.background, position } }
        saveSettings(newState)
        return newState
      }),
    setOpacity: (opacity) =>
      set((s) => {
        const newState = { ...s, background: { ...s.background, opacity } }
        saveSettings(newState)
        return newState
      }),
    setBackground: (config) =>
      set((s) => {
        const newState = { ...s, background: { ...s.background, ...config } }
        saveSettings(newState)
        return newState
      }),
    clearBackground: () =>
      set((s) => {
        const newState = { ...s, background: { ...DEFAULT_SETTINGS.background } }
        saveSettings(newState)
        return newState
      }),
    setTerminal: (config) =>
      set((s) => {
        const newState = { ...s, terminal: { ...s.terminal, ...config } }
        saveSettings(newState)
        return newState
      }),
    setUI: (config) =>
      set((s) => {
        const newState = { ...s, ui: { ...s.ui, ...config } }
        saveSettings(newState)
        return newState
      }),
    toggleToolbarPin: () =>
      set((s) => {
        const newState = { ...s, ui: { ...s.ui, toolbarPinned: !s.ui.toolbarPinned } }
        saveSettings(newState)
        return newState
      }),
  }
})
