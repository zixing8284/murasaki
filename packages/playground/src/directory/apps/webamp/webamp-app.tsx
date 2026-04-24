import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { ProcessComponentProps } from '../../../contexts/process'
import { useCallback, useRef } from 'react'
import { useProcess, useProcessActions } from '../../../contexts/process'
import { useWebamp } from './use-webamp'

/**
 * Webamp app — bypasses the standard `RndWindow` / `BaseWindow` chrome and
 * lets the Webamp bundle manage its own draggable windows and skinning.
 *
 * We render an absolutely-positioned host element portal-less (inside the
 * playground desktop container). `useWebamp` mounts the Webamp instance
 * into it and forwards Webamp's own close / minimise / track events back
 * to the playground `ProcessContext`.
 */
export function WebampApp({ windowId }: ProcessComponentProps): React.ReactElement | null {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const processInfo = useProcess(windowId)
  const { activate } = useProcessActions()

  // Drive init + context bridge. Must be unconditional (hooks order).
  useWebamp(windowId, containerRef)

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    // Stop desktop-level deactivation and bring Webamp forward.
    event.stopPropagation()
    activate(windowId)
  }, [activate, windowId])

  if (!processInfo)
    return null

  const { zIndex, process } = processInfo

  // Fill the desktop container so Webamp's own draggable windows have the
  // full desktop as their free canvas. `overflow: hidden` keeps Webamp's
  // child windows visually clipped to the desktop area, matching the
  // bounds that system `RndWindow` drags are constrained to.
  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex,
    display: process.minimized ? 'none' : undefined,
  }

  return (
    <div
      ref={containerRef}
      data-webamp-host={windowId}
      style={style}
      onPointerDownCapture={handlePointerDown}
    />
  )
}
