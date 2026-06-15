import { useRef } from 'react'
import { useTerminal } from '../hooks/useTerminal'

export function TerminalView() {
  const containerRef = useRef<HTMLDivElement>(null)
  useTerminal(containerRef)

  return (
    <div ref={containerRef} className="w-full h-full bg-transparent" />
  )
}
