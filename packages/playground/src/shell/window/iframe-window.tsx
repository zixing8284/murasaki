import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useProcess, useProcessActions } from '../../contexts/process/hooks'
import { useSystemBusy } from '../../contexts/system-cursor'
import { assetPath } from '../../lib/asset-path'
import { useIframeWindow } from '../iframe/use-iframe-window'
import { RndWindow } from './rnd-window'

interface IframeWindowProps {
  windowId: string
  src: string
  className?: string
  contentClassName?: string
  titleIcon?: ReactNode
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
}

/**
 * A window that embeds a web application in an iframe.
 *
 * Handles:
 * - Loading state display (iframeLoaded controls visibility with opacity-0 until loaded)
 * - Focus management (click → activate + delayed focus iframe)
 * - Pointer-events disabled during drag/resize and when window is inactive
 * - contentWindow focus → activate owning window + delayed focus (best-effort)
 */
export function IframeWindow({
  windowId,
  src,
  className,
  contentClassName,
  titleIcon,
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
}: IframeWindowProps): React.ReactElement | null {
  const actions = useProcessActions()
  const win = useProcess(windowId)
  const { iframeRef: onIframeRef, iframeLoaded, isLoading, focusIframe, cancelIframeInteraction, sandbox, referrerPolicy } = useIframeWindow({
    windowId,
  })

  // Register desktop-level working cursor while iframe content loads
  useSystemBusy(isLoading, 'working')

  // Direct ref to the iframe element. Synchronously applies pointer-events: none
  // at drag/resize start — before React re-renders — preventing the iframe from
  // swallowing mousemove events during the first frame of the interaction.
  const iframeElementRef = useRef<HTMLIFrameElement | null>(null)
  const mergedIframeRef = (el: HTMLIFrameElement | null): void => {
    iframeElementRef.current = el
    onIframeRef(el)
  }

  const handleInteractionChange = (active: boolean): void => {
    if (iframeElementRef.current) {
      iframeElementRef.current.style.pointerEvents = active ? 'none' : ''
    }
  }

  if (!win)
    return null

  return (
    <RndWindow
      windowId={windowId}
      className={className}
      contentClassName={contentClassName}
      titleIcon={titleIcon}
      disableMaximize={disableMaximize}
      disableMinimize={disableMinimize}
      disableResize={disableResize}
      loadingCursor={isLoading}
      onDragChange={handleInteractionChange}
      onResizeChange={handleInteractionChange}
    >
      {/*
       * Iframe wrapper: clicking activates the window and triggers delayed focus.
       *
       * - During drag/resize, the iframe itself gets pointer-events: none so
       *   mousemove/up events don't get swallowed when the pointer crosses
       *   the iframe boundary.
       * - When the window is inactive, a transparent "glass" overlay is placed
       *   above the iframe. This captures the first click to activate the
       *   window (solving cross-origin iframes where inner clicks can't bubble
       *   out) and prevents accidental operations inside the iframe content.
       * - `overscroll-behavior: contain` and `touch-action: none` on the
       *   wrapper stop pull-to-refresh / chained scroll leaking to the host
       *   page when touching inside the iframe area.
       */}
      <div
        className={`size-full relative overscroll-contain touch-none ${iframeLoaded ? '' : 'opacity-0'}`}
        onPointerDown={(e) => {
          e.stopPropagation()
          actions.activate(windowId)
          focusIframe()
        }}
        onPointerLeave={() => {
          // Cancel any iframe internal drag/draw behavior when pointer leaves the window
          cancelIframeInteraction()
        }}
      >
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-(--button-face)">
            <span className="text-xs text-(--window-text)">Loading…</span>
          </div>
        )}
        <iframe
          ref={mergedIframeRef}
          src={assetPath(src)}
          sandbox={sandbox}
          referrerPolicy={referrerPolicy}
          className="size-full border-none block"
          title={win.process.title}
        />
        {/*
         * Glass overlay: only rendered while the window is inactive. Captures
         * the activation click so cross-origin iframes behave like native
         * Windows apps (first click activates, second click interacts).
         */}
        {!win.isActive && (
          <div
            aria-hidden
            className="absolute inset-0 cursor-default"
            onPointerDown={(e) => {
              e.stopPropagation()
              actions.activate(windowId)
              focusIframe()
            }}
          />
        )}
      </div>
    </RndWindow>
  )
}
