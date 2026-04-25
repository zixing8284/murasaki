import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { ProcessComponentProps } from '../../../contexts/process'
import { useCallback, useMemo, useRef } from 'react'
import { useProcess, useProcessActions } from '../../../contexts/process'
import { useWebampBounds, useWebampViewportBounds } from './webamp-bounds'
import { useWebampLoader } from './webamp-loader'
import { useWebampMilkdrop } from './webamp-milkdrop'
import { useWebampPersistence } from './webamp-persistence'
import { useWebampInteractionBoundary } from './webamp-pointer-cleanup'

/**
 * Webamp app — bypasses the standard `RndWindow` / `BaseWindow` chrome
 * and lets the Webamp bundle manage its own draggable windows and
 * skinning, mirroring daedalOS's `hasWindow: false` pattern.
 *
 * This component is the *host*: it owns process-context concerns
 * (activation, z-index, minimise visibility) and provides the
 * absolutely-positioned host element inside the playground desktop
 * container. The split hooks own everything else:
 *
 *   - `useWebampLoader`         — script load, instance lifecycle, DOM mount
 *   - `useWebampViewportBounds` — host size → Webamp internal browser bounds
 *   - `useWebampBounds`         — cluster bounds clamp fallback
 *   - `useWebampMilkdrop`       — lazy butterchurn load, preset cycling, seed
 *   - `useWebampPersistence`    — sessionStorage main-window position writer
 *   - `useWebampInteractionBoundary` — release/cancel cleanup for Webamp's
 *                                      document-level interaction handlers
 */
export function WebampApp({ windowId }: ProcessComponentProps): React.ReactElement | null {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const processInfo = useProcess(windowId)
  const { activate, close, minimize, title } = useProcessActions()

  // Bridge Webamp adapter events to ProcessContext. Identities can change
  // across renders; the loader hook captures them via latest refs.
  const callbacks = useMemo(
    () => ({
      onClose: () => close(windowId),
      onMinimize: () => minimize(windowId),
      onTitleChange: (next: string) => title(windowId, next),
    }),
    [close, minimize, title, windowId],
  )

  const instance = useWebampLoader(containerRef, callbacks)
  useWebampViewportBounds(instance, containerRef)
  useWebampBounds(instance, containerRef)
  useWebampMilkdrop(instance, containerRef)
  useWebampPersistence(instance)
  useWebampInteractionBoundary(containerRef)

  // Activation only — the context-menu / cross-window stacking concern is
  // solved at the Webamp layer (constructor `zIndex` option) rather than
  // here, because the menu is rendered into a body-level portal that
  // sits outside our host's stacking context.
  const activateSelf = useCallback(() => {
    activate(windowId)
  }, [activate, windowId])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    activateSelf()
  }, [activateSelf])

  if (!processInfo)
    return null

  const { zIndex, process } = processInfo

  // Fill the desktop container so Webamp's own draggable windows have the
  // full desktop as their free canvas. `overflow: hidden` keeps Webamp's
  // child windows visually clipped to the desktop area, matching the
  // bounds that system `RndWindow` drags are constrained to. Pointer
  // events are scoped via `playground.css` (`#webamp` is transparent;
  // its direct children re-enable events) so desktop icons remain
  // interactive in the gaps between Webamp windows.
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
      onContextMenuCapture={activateSelf}
    />
  )
}
