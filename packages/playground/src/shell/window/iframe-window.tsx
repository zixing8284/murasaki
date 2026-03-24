import type { ReactNode } from 'react'
import { useState } from 'react'
import { useProcess, useProcessActions } from '../../contexts/process'
import { useIframeWindow } from '../iframe/use-iframe-window'
import { RndWindow } from './rnd-window'

interface IframeWindowProps {
  windowId: string
  src: string
  className?: string
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
 * - contentWindow focus → activate owning window + delayed focus (same-origin iframes only)
 */
export function IframeWindow({
  windowId,
  src,
  className,
  titleIcon,
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
}: IframeWindowProps): React.ReactElement | null {
  const actions = useProcessActions()
  const win = useProcess(windowId)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const { iframeRef, iframeLoaded, focusIframe, cancelIframeInteraction, sandbox, referrerPolicy } = useIframeWindow({
    windowId,
  })

  if (!win)
    return null

  // Only active window's iframe can receive interactions
  const isInteractive = !isDragging && !isResizing && win.isActive

  return (
    <RndWindow
      windowId={windowId}
      className={className}
      titleIcon={titleIcon}
      disableMaximize={disableMaximize}
      disableMinimize={disableMinimize}
      disableResize={disableResize}
      onDragChange={setIsDragging}
      onResizeChange={setIsResizing}
    >
      {/*
       * Iframe wrapper: clicking activates the window and triggers delayed focus.
       * pointer-events is disabled during drag/resize or when window is inactive.
       * For same-origin iframes, clicking inside content also triggers the
       * contentWindow focus listener which calls activate() + focusIframe().
       * For cross-origin iframes, clicking inside content doesn't bubble up,
       * so focus is only triggered via the wrapper's onPointerDown.
       */}
      <div
        className={`w-full h-full relative ${iframeLoaded ? '' : 'opacity-0'} ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
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
            <span className="text-xs text-(--window-text)">Loading...</span>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={src}
          sandbox={sandbox}
          referrerPolicy={referrerPolicy}
          className="w-full h-full border-none block"
          title={win.process.title}
        />
      </div>
    </RndWindow>
  )
}
