import type { ReactElement, ReactNode, SyntheticEvent } from 'react'
import {
  Divider,
  MenuItem,
  MenuSeparator,
  Tooltip,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowStatusBar,
  WindowStatusBarField,
} from '@murasaki-io/react98'
import { useEffect, useRef, useState } from 'react'
import { useProcess, useProcessActions } from '../../contexts/process/hooks'
import { assetPath } from '../../lib/asset-path'
import { IE_TOOLBAR_ICONS } from '../../lib/playground-assets'
import { useIframeWindow } from '../iframe/use-iframe-window'
import { InactiveClickGuard } from './inactive-click-guard'
import { RndWindow } from './rnd-window'

const IE_TITLE_SUFFIX = 'Microsoft Internet Explorer'
const FALLBACK_PAGE_TITLE = 'New Tab - Microsoft Internet Explorer'

const ICONS = IE_TOOLBAR_ICONS

interface Ie2ChromeProps {
  windowId: string
  src: string
  className?: string
  contentClassName?: string
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
  /** Toggle handler for the Favorites toolbar button. When omitted the button is disabled. */
  onFavoritesClick?: () => void
  /** Renders a sidebar (e.g. Favorites) next to the page. Receives a `navigate` helper. */
  renderSidebar?: (navigate: (url: string) => void) => ReactNode
}

interface ToolbarButtonProps {
  label: string
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
}

function resolveIframeSrc(path: string): string {
  if (path.startsWith('https://') || path.startsWith('http://') || path.startsWith('//'))
    return path
  return assetPath(path)
}

/**
 * Decodes percent-encoded sequences (e.g. Chinese characters) so the address
 * bar reads like a real browser's Unicode display. decodeURI preserves reserved
 * delimiters (`/`, `?`, `#`, `&`, …); malformed input falls back to the raw URL.
 */
function decodeAddressForDisplay(url: string): string {
  try {
    return decodeURI(url)
  }
  catch {
    return url
  }
}

function displayAddressFromPath(path: string): string {
  // resolveIframeSrc handles external URLs unchanged and applies the Vite
  // BASE_URL prefix to local asset paths, giving us a root-relative or
  // absolute URL that new URL() can then anchor to the real runtime origin.
  return decodeAddressForDisplay(new URL(resolveIframeSrc(path), window.location.href).href)
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

/** Best-effort title derived from a URL's hostname, for cross-origin pages whose document title cannot be read. */
function titleFromUrl(url: string): string {
  try {
    const resolved = new URL(resolveIframeSrc(url), window.location.href)
    // Same-origin pages are local assets; derive no hostname title for them.
    if (resolved.origin === window.location.origin)
      return internetExplorerTitle(undefined)
    return internetExplorerTitle(resolved.hostname)
  }
  catch { /* invalid URL */ }
  return internetExplorerTitle(undefined)
}

function getIframeTitle(iframe: HTMLIFrameElement, fallbackUrl: string): string {
  try {
    return internetExplorerTitle(iframe.contentDocument?.title ?? iframe.contentWindow?.document.title)
  }
  catch {
    return titleFromUrl(fallbackUrl)
  }
}

function MenuLabel({ menu }: { menu: string }): ReactElement {
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
  return <img src={assetPath(src)} alt="" className="size-5 object-contain pixelated" draggable={false} />
}

function ToolbarButton({
  label,
  children,
  disabled = false,
  onClick,
}: ToolbarButtonProps): ReactElement {
  const iconClassName = [
    'flex size-5 items-center justify-center overflow-hidden',
    disabled ? '[&_img]:grayscale [&_img]:opacity-55 [&_img]:contrast-75' : undefined,
  ].filter(Boolean).join(' ')

  return (
    <Tooltip text={label} side="bottom">
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        title={label}
        className="size-8 shrink-0 border-none bg-(--button-face) shadow-(--shadow-raised) flex items-center justify-center p-0 text-(--button-text) active:not-disabled:shadow-(--shadow-sunken) disabled:text-(--gray-text) disabled:[text-shadow:1px_1px_0_var(--button-hilight)] focus:outline-dotted focus:outline-1 focus:outline-(--button-text) focus:-outline-offset-3"
        onClick={onClick}
      >
        <span className={iconClassName}>
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

export function Ie2Chrome({
  windowId,
  src,
  className,
  contentClassName,
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
  onFavoritesClick,
  renderSidebar,
}: Ie2ChromeProps): ReactElement | null {
  const actions = useProcessActions()
  const win = useProcess(windowId)
  const iframeElementRef = useRef<HTMLIFrameElement | null>(null)
  const cleanupMetadataSyncRef = useRef<(() => void) | undefined>(undefined)
  const currentSrcRef = useRef(src)
  const [address, setAddress] = useState(() => displayAddressFromPath(src))
  const { iframeRef, iframeLoaded, focusIframe, cancelIframeInteraction, sandbox, referrerPolicy } = useIframeWindow({
    windowId,
  })

  const setIframeRef = (el: HTMLIFrameElement | null): void => {
    iframeElementRef.current = el
    iframeRef(el)
  }

  // Synchronously applies pointer-events: none at drag/resize start — before
  // React re-renders — preventing the iframe from swallowing mousemove events
  // during the first frame of the interaction.
  const handleInteractionChange = (active: boolean): void => {
    if (iframeElementRef.current) {
      iframeElementRef.current.style.pointerEvents = active ? 'none' : ''
    }
  }

  const syncFrameMetadata = (iframe: HTMLIFrameElement): void => {
    setAddress(getIframeAddress(iframe, currentSrcRef.current))
    actions.title(windowId, getIframeTitle(iframe, currentSrcRef.current))
  }

  const handleIframeLoad = (event: SyntheticEvent<HTMLIFrameElement>): void => {
    const iframe = event.currentTarget

    cleanupMetadataSyncRef.current?.()
    syncFrameMetadata(iframe)
    cleanupMetadataSyncRef.current = installFrameMetadataSync(iframe, () => syncFrameMetadata(iframe))
  }

  // Navigate the embedded page and eagerly sync the address bar, window title,
  // and taskbar running-task label. The load handler later reconciles with the
  // real document title once the page settles (same-origin) or keeps the
  // hostname-derived title (cross-origin).
  const navigateTo = (url: string): void => {
    const iframe = iframeElementRef.current
    if (!iframe)
      return

    currentSrcRef.current = url
    setAddress(displayAddressFromPath(url))
    actions.title(windowId, titleFromUrl(url))

    const target = resolveIframeSrc(url)
    try {
      iframe.contentWindow?.location.assign(target)
    }
    catch {
      iframe.src = target
    }
  }

  const handleHome = (): void => {
    navigateTo(src)
  }

  const handleRefresh = (): void => {
    const iframe = iframeElementRef.current
    if (!iframe)
      return

    try {
      iframe.contentWindow?.location.reload()
    }
    catch {
      iframe.setAttribute('src', iframe.src)
    }
  }

  useEffect(() => {
    return () => {
      cleanupMetadataSyncRef.current?.()
      cleanupMetadataSyncRef.current = undefined
    }
  }, [])

  if (!win)
    return null

  return (
    <RndWindow
      windowId={windowId}
      className={className}
      contentClassName={`p-0 flex flex-col ${contentClassName ?? ''}`}
      disableMaximize={disableMaximize}
      disableMinimize={disableMinimize}
      disableResize={disableResize}
      onDragChange={handleInteractionChange}
      onResizeChange={handleInteractionChange}
    >
      <InactiveClickGuard windowId={windowId} className="shrink-0">
        <WindowMenuBar className="h-5">
          <WindowMenuBarMenu value="file">
            <WindowMenuBarTrigger><MenuLabel menu="File" /></WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-44">
              <MenuItem reserveIconSpace disabled>New Window</MenuItem>
              <MenuItem reserveIconSpace disabled>Open…</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace disabled>Save As…</MenuItem>
              <MenuItem reserveIconSpace disabled>Page Setup…</MenuItem>
              <MenuItem reserveIconSpace disabled>Print…</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace disabled>Close</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="edit">
            <WindowMenuBarTrigger><MenuLabel menu="Edit" /></WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-40">
              <MenuItem reserveIconSpace disabled>Cut</MenuItem>
              <MenuItem reserveIconSpace disabled>Copy</MenuItem>
              <MenuItem reserveIconSpace disabled>Paste</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace disabled>Select All</MenuItem>
              <MenuItem reserveIconSpace disabled>Find…</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="view">
            <WindowMenuBarTrigger><MenuLabel menu="View" /></WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-44">
              <MenuItem reserveIconSpace disabled>Toolbars</MenuItem>
              <MenuItem reserveIconSpace disabled>Status Bar</MenuItem>
              <MenuSeparator />
              <MenuItem icon={<img src={assetPath('/icons/misc/icon-refresh.png')} alt="" className="size-4 object-contain pixelated" draggable={false} />} onClick={handleRefresh}>Refresh</MenuItem>
              <MenuItem reserveIconSpace disabled>Source</MenuItem>
              <MenuItem reserveIconSpace disabled>Full Screen</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="go">
            <WindowMenuBarTrigger><MenuLabel menu="Go" /></WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-40">
              <MenuItem reserveIconSpace disabled>Back</MenuItem>
              <MenuItem reserveIconSpace disabled>Forward</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace onClick={handleHome}>Home Page</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="favorites">
            <WindowMenuBarTrigger><MenuLabel menu="Favorites" /></WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-48">
              <MenuItem reserveIconSpace disabled>Add to Favorites…</MenuItem>
              <MenuItem reserveIconSpace disabled>Organize Favorites…</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="help">
            <WindowMenuBarTrigger><MenuLabel menu="Help" /></WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-48">
              <MenuItem reserveIconSpace disabled>Contents and Index</MenuItem>
              <MenuItem reserveIconSpace disabled>Tip of the Day</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace disabled>About Internet Explorer</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
        </WindowMenuBar>
      </InactiveClickGuard>

      <Divider />

      <InactiveClickGuard windowId={windowId} className="shrink-0">
        <div className="flex items-center gap-0 bg-(--button-face) px-0.5 py-1 min-w-0">
          <ToolbarGrip />
          <ToolbarButton label="Back" disabled>
            <span aria-hidden className="font-[Marlett] text-sm leading-none">3</span>
          </ToolbarButton>
          <ToolbarButton label="Forward" disabled>
            <span aria-hidden className="font-[Marlett] text-sm leading-none">4</span>
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
          <ToolbarButton label="Favorites" disabled={!onFavoritesClick} onClick={onFavoritesClick}>
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
        <div className="flex items-center gap-1 bg-(--button-face) p-1 min-w-0">
          <span className="shrink-0 text-(--button-text)"><MenuLabel menu="Address" /></span>
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

      <div className="flex flex-1 min-h-0 min-w-0">
        {renderSidebar?.(navigateTo)}
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
              <span className="text-xs text-(--window-text)">Loading…</span>
            </div>
          )}
          <iframe
            ref={setIframeRef}
            src={resolveIframeSrc(src)}
            sandbox={sandbox}
            referrerPolicy={referrerPolicy}
            className={`block size-full border-none bg-(--window) ${iframeLoaded ? '' : 'opacity-0'}`}
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
