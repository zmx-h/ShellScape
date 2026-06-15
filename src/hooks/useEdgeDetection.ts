import { useState, useEffect, useRef, useCallback } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

const EDGE_ZONE = 40

export function useEdgeDetection() {
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [tabBarVisible, setTabBarVisible] = useState(false)
  const toolbarPinned = useSettingsStore((s) => s.ui.toolbarPinned)
  const hideDelay = useSettingsStore((s) => s.ui.hideDelay)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const altPressedRef = useRef(false)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const startHideTimer = useCallback(() => {
    clearHideTimer()
    if (toolbarPinned) return
    hideTimerRef.current = setTimeout(() => {
      if (!altPressedRef.current) {
        setToolbarVisible(false)
        setTabBarVisible(false)
      }
    }, hideDelay)
  }, [clearHideTimer, hideDelay, toolbarPinned])

  const showToolbar = useCallback(() => {
    clearHideTimer()
    setToolbarVisible(true)
  }, [clearHideTimer])

  const showTabBar = useCallback(() => {
    clearHideTimer()
    setTabBarVisible(true)
  }, [clearHideTimer])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < EDGE_ZONE) {
        showToolbar()
      } else if (e.clientY > window.innerHeight - EDGE_ZONE) {
        showTabBar()
      } else {
        startHideTimer()
      }
    }

    const handleMouseLeave = () => {
      startHideTimer()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        e.preventDefault()
        altPressedRef.current = true
        setToolbarVisible(true)
        setTabBarVisible(true)
        clearHideTimer()
      }
      if (e.key === 'L' && e.ctrlKey && e.shiftKey) {
        useSettingsStore.getState().toggleToolbarPin()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        altPressedRef.current = false
        if (!toolbarPinned) {
          startHideTimer()
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearHideTimer()
    }
  }, [showToolbar, showTabBar, startHideTimer, clearHideTimer, toolbarPinned])

  // If toolbar is pinned, always show
  useEffect(() => {
    if (toolbarPinned) {
      setToolbarVisible(true)
    }
  }, [toolbarPinned])

  return { toolbarVisible, tabBarVisible }
}
