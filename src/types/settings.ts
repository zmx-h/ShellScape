export type BackgroundType = 'image' | 'video' | 'none'

export type FitMode = 'cover' | 'contain' | 'fill' | 'none'

export type BackgroundPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

export interface BackgroundConfig {
  type: BackgroundType
  path: string
  fitMode: FitMode
  position: BackgroundPosition
  opacity: number // 0.0 - 1.0, higher = more opaque background (less see-through)
}

export interface TerminalConfig {
  shell: string
  fontSize: number
  fontFamily: string
  colorScheme: string
  cursorStyle: 'block' | 'underline' | 'bar'
  cursorBlink: boolean
}

export interface UIConfig {
  toolbarAutoHide: boolean
  toolbarPinned: boolean
  hideDelay: number // ms
}

export interface AppSettings {
  background: BackgroundConfig
  terminal: TerminalConfig
  ui: UIConfig
}

export const DEFAULT_SETTINGS: AppSettings = {
  background: {
    type: 'none',
    path: '',
    fitMode: 'cover',
    position: 'center',
    opacity: 0.4,
  },
  terminal: {
    shell: 'powershell',
    fontSize: 14,
    fontFamily: 'Cascadia Code, Fira Code, Consolas, monospace',
    colorScheme: 'default',
    cursorStyle: 'block',
    cursorBlink: true,
  },
  ui: {
    toolbarAutoHide: true,
    toolbarPinned: false,
    hideDelay: 800,
  },
}

export const FIT_MODE_LABELS: Record<FitMode, string> = {
  cover: '裁剪填充',
  contain: '完整显示',
  fill: '拉伸填满',
  none: '原始大小',
}

export const POSITION_LABELS: Record<BackgroundPosition, string> = {
  center: '居中',
  top: '顶部',
  bottom: '底部',
  left: '左侧',
  right: '右侧',
  'top-left': '左上',
  'top-right': '右上',
  'bottom-left': '左下',
  'bottom-right': '右下',
}

export const COLOR_SCHEMES: Record<string, { name: string; background: string; foreground: string; cursor: string }> = {
  default: {
    name: '默认',
    background: 'rgba(0, 0, 0, 0.5)',
    foreground: '#ffffff',
    cursor: '#ffffff',
  },
  dracula: {
    name: 'Dracula',
    background: 'rgba(40, 42, 54, 0.5)',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
  },
  nord: {
    name: 'Nord',
    background: 'rgba(46, 52, 64, 0.5)',
    foreground: '#d8dee9',
    cursor: '#d8dee9',
  },
  'one-dark': {
    name: 'One Dark',
    background: 'rgba(40, 44, 52, 0.5)',
    foreground: '#abb2bf',
    cursor: '#528bff',
  },
}
