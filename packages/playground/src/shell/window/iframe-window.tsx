import type { ReactNode } from 'react'
import type { AppId } from '../../contexts/process/directory'
import { useEffect, useRef, useState } from 'react'
import appDirectory from '../../contexts/process/directory'
import { useProcess, useProcessActions } from '../../contexts/process/hooks'
import { useSystemBusy } from '../../contexts/system-cursor'
import { assetPath } from '../../lib/asset-path'
import { useIframeWindow } from '../iframe/use-iframe-window'
import { AppLaunchSplash } from './app-launch-splash'
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
  /** Size the window to the content dimensions the iframe reports (see ProcessBaseWindowConfig). */
  autoSize?: boolean
  /** Minimum content box to reserve when auto-sizing, so emulated menus have room (see ProcessBaseWindowConfig). */
  autoSizeMinContent?: { width?: number, height?: number }
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
  autoSize = false,
  autoSizeMinContent,
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

  // Content size reported by an auto-sizing iframe (e.g. an embedded game).
  const [contentSize, setContentSize] = useState<{ width: number, height: number } | null>(null)
  const minContentWidth = autoSizeMinContent?.width ?? 0
  const minContentHeight = autoSizeMinContent?.height ?? 0
  useEffect(() => {
    if (!autoSize)
      return
    const onMessage = (event: MessageEvent): void => {
      if (event.source !== iframeElementRef.current?.contentWindow)
        return
      const data = event.data as { type?: string, width?: number, height?: number }
      if (data?.type === 'arcade:size' && typeof data.width === 'number' && typeof data.height === 'number') {
        // Reserve menu headroom: the emulator paints its program at the
        // top-left on a transparent desktop, so padding the reported size lets
        // dropdowns fall into the extra space instead of clipping/flipping.
        setContentSize({
          width: Math.max(Math.round(data.width), minContentWidth),
          height: Math.max(Math.round(data.height), minContentHeight),
        })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [autoSize, minContentWidth, minContentHeight])

  const handleInteractionChange = (active: boolean): void => {
    if (iframeElementRef.current) {
      iframeElementRef.current.style.pointerEvents = active ? 'none' : ''
    }
  }

  if (!win)
    return null

  const entry = appDirectory[win.process.appId as AppId]

  return (
    <RndWindow
      windowId={windowId}
      className={className}
      contentClassName={contentClassName}
      titleIcon={titleIcon}
      disableMaximize={disableMaximize}
      disableMinimize={disableMinimize}
      disableResize={disableResize}
      autoSize={autoSize}
      contentSize={contentSize}
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
          <div className="absolute inset-0">
            <AppLaunchSplash
              name={entry?.name ?? win.process.title}
              iconSrc={entry ? assetPath(entry.icon.lg) : undefined}
            />
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
