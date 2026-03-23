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
  sandbox?: string
  referrerPolicy?: string
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
}

/**
 * A window that embeds a web application in an iframe.
 *
 * Handles:
 * - Loading state display
 * - Focus management (click → activate + focus iframe)
 * - Pointer-events disabled during drag to prevent iframe interaction conflicts
 * - contentWindow focus/blur → activate owning window
 */
export function IframeWindow({
  windowId,
  src,
  className,
  titleIcon,
  sandbox = 'allow-scripts allow-same-origin allow-forms allow-pointer-lock',
  referrerPolicy = 'no-referrer-when-downgrade',
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
}: IframeWindowProps): React.ReactElement | null {
  const actions = useProcessActions()
  const win = useProcess(windowId)
  const [isDragging, setIsDragging] = useState(false)
  const { iframeRef, isLoading, focusIframe } = useIframeWindow({
    windowId,
    src,
    sandbox,
    referrerPolicy,
  })

  if (!win)
    return null

  return (
    <RndWindow
      windowId={windowId}
      className={className}
      titleIcon={titleIcon}
      disableMaximize={disableMaximize}
      disableMinimize={disableMinimize}
      disableResize={disableResize}
      onDragChange={setIsDragging}
    >
      {/*
       * Iframe wrapper: clicking activates the window and focuses the iframe.
       * pointer-events is disabled during drag to prevent iframe interaction conflicts.
       */}
      <div
        className="w-full h-full relative"
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        onPointerDown={(e) => {
          e.stopPropagation()
          actions.activate(windowId)
          focusIframe()
        }}
      >
        {isLoading && (
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
