import type { ReactElement, ReactNode, SyntheticEvent } from 'react'
import { Divider, Tooltip, WindowMenuBar, WindowMenuBarItem, WindowStatusBar, WindowStatusBarField } from '@murasaki/react98'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useProcess, useProcessActions } from '../../contexts/process'
import { assetPath } from '../../lib/asset-path'
import { useIframeWindow } from '../iframe/use-iframe-window'
import { InactiveClickGuard } from './inactive-click-guard'
import { RndWindow } from './rnd-window'

const IE_TITLE_SUFFIX = 'Microsoft Internet Explorer'
const FALLBACK_PAGE_TITLE = 'New Tab - Microsoft Internet Explorer'
const IE_MENUS = ['File', 'Edit', 'View', 'Go', 'Favorites', 'Help'] as const

const ICONS = {
  favorites: '/icons/windows98-icons/ico/directory_favorites.ico',
  home: '/icons/windows98-icons/ico/homepage.ico',
  html: '/icons/windows98-icons/ico/html.ico',
  mail: '/icons/windows98-icons/ico/mailbox_world.ico',
  print: '/icons/windows98-icons/ico/printer.ico',
  refresh: '/icons/windows98-icons/ico/directory_open_refresh.ico',
  search: '/icons/windows98-icons/ico/search_web.ico',
  stop: '/icons/windows98-icons/ico/no.ico',
  windows: '/icons/windows98-icons/ico/windows.ico',
} as const

interface InternetExplorerWindowProps {
  windowId: string
  src: string
  className?: string
  contentClassName?: string
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
}

interface ToolbarButtonProps {
  label: string
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
}

function displayAddressFromPath(path: string): string {
  const localUrl = new URL(path, 'http://murasaki.local')
  return localUrl.href
}

function getIframeAddress(iframe: HTMLIFrameElement, fallbackSrc: string): string {
  try {
    const location = iframe.contentWindow?.location
    if (!location)
      return displayAddressFromPath(fallbackSrc)

    return displayAddressFromPath(`${location.pathname}${location.search}${location.hash}`)
  }
  catch {
    return displayAddressFromPath(fallbackSrc)
  }
}

function internetExplorerTitle(pageTitle: string | undefined): string {
  const trimmedTitle = pageTitle?.trim() || FALLBACK_PAGE_TITLE
  const suffix = ` - ${IE_TITLE_SUFFIX}`

  if (trimmedTitle.endsWith(suffix))
    return trimmedTitle

  return `${trimmedTitle}${suffix}`
}

function getIframeTitle(iframe: HTMLIFrameElement): string {
  try {
    return internetExplorerTitle(iframe.contentDocument?.title ?? iframe.contentWindow?.document.title)
  }
  catch {
    return internetExplorerTitle(FALLBACK_PAGE_TITLE)
  }
}

function renderMenuLabel(menu: string): ReactElement {
  const [accelerator = '', ...rest] = menu

  return (
    <>
      <span className="underline">{accelerator}</span>
      {rest.join('')}
    </>
  )
}

function ToolbarSeparator(): ReactElement {
  return <div className="mx-1 h-6 border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
}

function ToolbarGrip(): ReactElement {
  return (
    <div className="mx-1 h-6 w-1 shrink-0 shadow-[inset_1px_0_0_var(--button-hilight),inset_-1px_0_0_var(--button-shadow)]" />
  )
}

function ToolbarImageIcon({ src }: { src: string }): ReactElement {
  return <img src={assetPath(src)} alt="" className="size-4 object-contain pixelated" draggable={false} />
}

function ToolbarButton({
  label,
  children,
  disabled = false,
  onClick,
}: ToolbarButtonProps): ReactElement {
  return (
    <Tooltip text={label} side="bottom">
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        title={label}
        className="size-7 shrink-0 border-none bg-(--button-face) shadow-(--shadow-raised) flex items-center justify-center p-0 text-(--button-text) active:not-disabled:shadow-(--shadow-sunken) disabled:opacity-55 disabled:grayscale focus:outline-dotted focus:outline-1 focus:outline-(--button-text) focus:-outline-offset-3"
        onClick={onClick}
      >
        <span className="flex size-4 items-center justify-center overflow-hidden">
          {children}
        </span>
      </button>
    </Tooltip>
  )
}

function scheduleFrameMetadataSync(frameWindow: Window, sync: () => void): void {
  frameWindow.setTimeout(sync, 0)
  frameWindow.setTimeout(sync, 150)
}

function patchHistoryMethod(
  frameWindow: Window,
  method: 'pushState' | 'replaceState',
  sync: () => void,
): () => void {
  const history = frameWindow.history
  const original = history[method]
  const patched: typeof history.pushState = function patchedHistoryState(data, unused, url) {
    original.call(history, data, unused, url)
    scheduleFrameMetadataSync(frameWindow, sync)
  }

  history[method] = patched

  return () => {
    history[method] = original
  }
}

function installFrameMetadataSync(iframe: HTMLIFrameElement, sync: () => void): (() => void) | undefined {
  try {
    const frameWindow = iframe.contentWindow
    const titleElement = iframe.contentDocument?.querySelector('title')
    if (!frameWindow)
      return undefined

    const handleNavigation = (): void => {
      scheduleFrameMetadataSync(frameWindow, sync)
    }
    const observer = titleElement ? new MutationObserver(sync) : undefined
    const restorePushState = patchHistoryMethod(frameWindow, 'pushState', sync)
    const restoreReplaceState = patchHistoryMethod(frameWindow, 'replaceState', sync)

    frameWindow.addEventListener('hashchange', handleNavigation)
    frameWindow.addEventListener('popstate', handleNavigation)
    if (observer && titleElement)
      observer.observe(titleElement, { childList: true, characterData: true, subtree: true })

    return () => {
      frameWindow.removeEventListener('hashchange', handleNavigation)
      frameWindow.removeEventListener('popstate', handleNavigation)
      restorePushState()
      restoreReplaceState()
      observer?.disconnect()
    }
  }
  catch {
    return undefined
  }
}

export function InternetExplorerWindow({
  windowId,
  src,
  className,
  contentClassName,
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
}: InternetExplorerWindowProps): ReactElement | null {
  const actions = useProcessActions()
  const win = useProcess(windowId)
  const iframeElementRef = useRef<HTMLIFrameElement | null>(null)
  const cleanupMetadataSyncRef = useRef<(() => void) | undefined>(undefined)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [address, setAddress] = useState(() => displayAddressFromPath(src))
  const { iframeRef, iframeLoaded, focusIframe, cancelIframeInteraction, sandbox, referrerPolicy } = useIframeWindow({
    windowId,
  })

  const setIframeRef = useCallback((el: HTMLIFrameElement | null) => {
    iframeElementRef.current = el
    iframeRef(el)
  }, [iframeRef])

  const syncFrameMetadata = useCallback((iframe: HTMLIFrameElement) => {
    setAddress(getIframeAddress(iframe, src))
    actions.title(windowId, getIframeTitle(iframe))
  }, [actions, src, windowId])

  const handleIframeLoad = useCallback((event: SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget

    cleanupMetadataSyncRef.current?.()
    syncFrameMetadata(iframe)
    cleanupMetadataSyncRef.current = installFrameMetadataSync(iframe, () => syncFrameMetadata(iframe))
  }, [syncFrameMetadata])

  const handleHome = useCallback(() => {
    const iframe = iframeElementRef.current
    if (!iframe)
      return

    const homeSrc = assetPath(src)
    try {
      iframe.contentWindow?.location.assign(homeSrc)
    }
    catch {
      iframe.src = homeSrc
    }
  }, [src])

  const handleRefresh = useCallback(() => {
    const iframe = iframeElementRef.current
    if (!iframe)
      return

    try {
      iframe.contentWindow?.location.reload()
    }
    catch {
      iframe.setAttribute('src', iframe.src)
    }
  }, [])

  useEffect(() => {
    return () => {
      cleanupMetadataSyncRef.current?.()
      cleanupMetadataSyncRef.current = undefined
    }
  }, [])

  if (!win)
    return null

  const isInteracting = isDragging || isResizing

  return (
    <RndWindow
      windowId={windowId}
      className={className}
      contentClassName={`p-0 flex flex-col ${contentClassName ?? ''}`}
      disableMaximize={disableMaximize}
      disableMinimize={disableMinimize}
      disableResize={disableResize}
      onDragChange={setIsDragging}
      onResizeChange={setIsResizing}
    >
      <InactiveClickGuard windowId={windowId} className="shrink-0">
        <WindowMenuBar className="h-5">
          {IE_MENUS.map(menu => (
            <WindowMenuBarItem key={menu}>{renderMenuLabel(menu)}</WindowMenuBarItem>
          ))}
        </WindowMenuBar>
      </InactiveClickGuard>

      <Divider />

      <InactiveClickGuard windowId={windowId} className="shrink-0">
        <div className="flex items-center gap-0 bg-(--button-face) px-0.5 py-1 min-w-0">
          <ToolbarGrip />
          <ToolbarButton label="Back" disabled>
            <span aria-hidden className="font-[Marlett] text-sm leading-none text-(--button-text)">3</span>
          </ToolbarButton>
          <ToolbarButton label="Forward" disabled>
            <span aria-hidden className="font-[Marlett] text-sm leading-none text-(--button-text)">4</span>
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton label="Stop" disabled>
            <ToolbarImageIcon src={ICONS.stop} />
          </ToolbarButton>
          <ToolbarButton label="Refresh" onClick={handleRefresh}>
            <ToolbarImageIcon src={ICONS.refresh} />
          </ToolbarButton>
          <ToolbarButton label="Home" onClick={handleHome}>
            <ToolbarImageIcon src={ICONS.home} />
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton label="Search" disabled>
            <ToolbarImageIcon src={ICONS.search} />
          </ToolbarButton>
          <ToolbarButton label="Favorites" disabled>
            <ToolbarImageIcon src={ICONS.favorites} />
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton label="Print" disabled>
            <ToolbarImageIcon src={ICONS.print} />
          </ToolbarButton>
          <ToolbarButton label="Mail" disabled>
            <ToolbarImageIcon src={ICONS.mail} />
          </ToolbarButton>
          <div className="flex-1 min-w-2" />
          <div className="size-7 shrink-0 shadow-(--shadow-sunken) bg-(--button-face) flex items-center justify-center">
            <ToolbarImageIcon src={ICONS.windows} />
          </div>
        </div>
      </InactiveClickGuard>

      <Divider />

      <InactiveClickGuard windowId={windowId} className="shrink-0">
        <div className="flex items-center gap-1 bg-(--button-face) px-1 py-1 min-w-0">
          <span className="shrink-0 text-(--button-text)">{renderMenuLabel('Address')}</span>
          <div className="flex h-5.5 min-w-0 flex-1 items-center gap-1 overflow-hidden bg-(--window) pl-2 pr-1 shadow-(--shadow-border-field)">
            <ToolbarImageIcon src={ICONS.html} />
            <input
              aria-label="Address"
              className="min-w-0 flex-1 truncate border-none bg-transparent p-0 text-(--window-text) outline-none read-only:bg-transparent"
              readOnly
              value={address}
            />
          </div>
        </div>
      </InactiveClickGuard>

      <div
        className="relative flex-1 min-h-0 bg-(--window) overscroll-contain touch-none"
        onPointerDown={(event) => {
          event.stopPropagation()
          actions.activate(windowId)
          focusIframe()
        }}
        onPointerLeave={cancelIframeInteraction}
      >
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-(--button-face)">
            <span className="text-xs text-(--window-text)">Loading...</span>
          </div>
        )}
        <iframe
          ref={setIframeRef}
          src={assetPath(src)}
          sandbox={sandbox}
          referrerPolicy={referrerPolicy}
          className={`block size-full border-none bg-(--window) ${iframeLoaded ? '' : 'opacity-0'} ${isInteracting ? 'pointer-events-none' : ''}`}
          title={win.process.title}
          onLoad={handleIframeLoad}
        />
        {!win.isActive && (
          <div
            aria-hidden
            className="absolute inset-0 cursor-default"
            onPointerDown={(event) => {
              event.stopPropagation()
              actions.activate(windowId)
              focusIframe()
            }}
          />
        )}
      </div>

      <WindowStatusBar className="shrink-0 pt-1">
        <WindowStatusBarField className="truncate">
          {iframeLoaded ? 'Done' : 'Loading...'}
        </WindowStatusBarField>
        <WindowStatusBarField grow={false} className="w-30 truncate">
          Internet
        </WindowStatusBarField>
      </WindowStatusBar>
    </RndWindow>
  )
}
