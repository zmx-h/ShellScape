import { useState } from 'react'
import { motion } from 'framer-motion'
import { BackgroundLayer } from './components/BackgroundLayer'
import { TerminalView } from './components/TerminalView'
import { TitleBar } from './components/TitleBar'
import { Toolbar } from './components/Toolbar'
import { TabBar } from './components/TabBar'
import { SettingsPanel } from './components/SettingsPanel'
import { BackgroundPicker } from './components/BackgroundPicker'
import { useEdgeDetection } from './hooks/useEdgeDetection'
import { useSettingsStore } from './stores/settingsStore'

const TOOLBAR_HEIGHT = 56
const TABBAR_HEIGHT = 32

export default function App() {
  const { toolbarVisible, tabBarVisible } = useEdgeDetection()
  const toolbarPinned = useSettingsStore((s) => s.ui.toolbarPinned)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const showToolbar = toolbarVisible || toolbarPinned

  return (
    <div className="flex flex-col w-full h-full bg-black">
      {/* Top: toolbar area — takes layout space, collapses to height 0 when hidden */}
      <motion.div
        className="shrink-0 overflow-hidden z-30"
        animate={{
          height: showToolbar ? TOOLBAR_HEIGHT : 0,
          opacity: showToolbar ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div style={{ height: TOOLBAR_HEIGHT }}>
          <TitleBar />
          <Toolbar onOpenSettings={() => setSettingsOpen(true)} />
        </div>
      </motion.div>

      {/* Middle: terminal + background — fills remaining space */}
      <div className="flex-1 relative min-h-0">
        <BackgroundLayer />
        <TerminalView />
      </div>

      {/* Bottom: tab bar area — takes layout space, collapses when hidden */}
      <motion.div
        className="shrink-0 overflow-hidden z-30"
        animate={{
          height: tabBarVisible ? TABBAR_HEIGHT : 0,
          opacity: tabBarVisible ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div style={{ height: TABBAR_HEIGHT }}>
          <TabBar />
        </div>
      </motion.div>

      {/* Overlays */}
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <BackgroundPicker />
    </div>
  )
}
