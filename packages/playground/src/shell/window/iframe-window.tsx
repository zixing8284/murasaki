import type { ReactNode } from 'react'
import type { AppId } from '../../contexts/process/directory'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  /** Force the active app into a mobile fullscreen shell instead of a desktop window. */
  isMobile?: boolean
  /** Keep mounted but hide when this process isn't the mobile-visible one. */
  mobileVisible?: boolean
  /** Size the window to the content dimensions the iframe reports (see ProcessBaseWindowConfig). */
  autoSize?: boolean
  /** Minimum content box to reserve when auto-sizing, so emulated menus have room (see ProcessBaseWindowConfig). */
  autoSizeMinContent?: { width?: number, height?: number }
}

const MOBILE_VIEWPORT_MIN_WIDTH = 320
const MOBILE_VIEWPORT_MIN_HEIGHT = 480

interface MobileIframeViewport {
  width: number
  height: number
  scale: number
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
  isMobile = false,
  mobileVisible = true,
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
  const iframeViewportRef = useRef<HTMLDivElement | null>(null)
  const mergedIframeRef = (el: HTMLIFrameElement | null): void => {
    iframeElementRef.current = el
    onIframeRef(el)
  }

  // Content size reported by an auto-sizing iframe (e.g. an embedded game).
  const [contentSize, setContentSize] = useState<{ width: number, height: number } | null>(null)
  const [mobileViewport, setMobileViewport] = useState<MobileIframeViewport | null>(null)
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

  useLayoutEffect(() => {
    if (!isMobile || !autoSize || !iframeLoaded || !mobileVisible || !win?.isActive)
      return

    const viewport = iframeViewportRef.current
    if (!viewport)
      return

    const measure = (): void => {
      const { clientWidth, clientHeight } = viewport
      if (clientWidth <= 0 || clientHeight <= 0)
        return

      const contentWidth = Math.max(contentSize?.width ?? 0, MOBILE_VIEWPORT_MIN_WIDTH)
      const contentHeight = Math.max(contentSize?.height ?? 0, MOBILE_VIEWPORT_MIN_HEIGHT)
      const scale = Math.min(clientWidth / contentWidth, clientHeight / contentHeight)
      if (!Number.isFinite(scale) || scale <= 0)
        return

      const next = {
        width: clientWidth / scale,
        height: clientHeight / scale,
        scale,
      }
      setMobileViewport((current) => {
        if (
          current
          && Math.abs(current.width - next.width) < 0.5
          && Math.abs(current.height - next.height) < 0.5
          && Math.abs(current.scale - next.scale) < 0.0005
        ) {
          return current
        }
        return next
      })
    }

    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    measure()
    return () => observer.disconnect()
  }, [
    autoSize,
    contentSize?.height,
    contentSize?.width,
    iframeLoaded,
    isMobile,
    mobileVisible,
    win?.isActive,
  ])

  const iframeViewportStyle = isMobile && autoSize && mobileViewport
    ? {
        width: `${mobileViewport.width}px`,
        height: `${mobileViewport.height}px`,
        transform: `scale(${mobileViewport.scale})`,
        transformOrigin: 'top left',
      }
    : undefined

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
      disableMaximize={disableMaximize || isMobile}
      disableMinimize={disableMinimize}
      disableResize={disableResize || isMobile}
      autoSize={autoSize}
      contentSize={contentSize}
      loadingCursor={isLoading}
      onDragChange={handleInteractionChange}
      onResizeChange={handleInteractionChange}
      isMobile={isMobile}
      mobileVisible={mobileVisible}
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
        ref={iframeViewportRef}
        className={`size-full relative overflow-hidden overscroll-contain touch-none ${iframeLoaded ? '' : 'opacity-0'}`}
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
              iconSrc={entry
                ? assetPath(entry.icon.lg)
                : undefined}
            />
          </div>
        )}
        <iframe
          ref={mergedIframeRef}
          src={assetPath(src)}
          sandbox={sandbox}
          referrerPolicy={referrerPolicy}
          className="size-full border-none block"
          style={iframeViewportStyle}
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
