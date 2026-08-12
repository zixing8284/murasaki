import type { CSSProperties, DragEvent } from 'react'
import type { DesktopHandle } from './desktop/desktop'
import { LayerProvider } from '@murasaki-io/react98'
import { useEffect, useRef, useState } from 'react'
import { useDesktopFiles } from '../contexts/desktop-files/hooks'
import { isSupportedDesktopMediaFile } from '../contexts/desktop-files/storage'
import { getStartupAppIds } from '../contexts/process/directory'
import { useProcessActions } from '../contexts/process/hooks'
import { ScreenBoundaryContext } from '../contexts/screen-boundary'
import { useCrtEffect } from '../hooks/use-crt-effect'
import { useCrtTuning } from '../hooks/use-crt-tuning'
import { useCustomWallpaperUrl } from '../hooks/use-custom-wallpaper-url'
import { useDesktopBgColor } from '../hooks/use-desktop-bg-color'
import { useGradientTitlebar } from '../hooks/use-gradient-titlebar'
import { useIconLabelBgColor } from '../hooks/use-icon-label-bg-color'
import { useMonitorFrame } from '../hooks/use-monitor-frame'
import { usePinchZoomPause } from '../hooks/use-pinch-zoom-pause'
import { SCREEN_SIZE_PRESETS, useScreenSize } from '../hooks/use-screen-size'
import { useShaderGlass } from '../hooks/use-shader-glass'
import { useWallpaper } from '../hooks/use-wallpaper'
import { assetPath } from '../lib/asset-path'
import { isCustomWallpaperId } from '../lib/wallpaper-storage'
import { getWallpaperEntry } from '../lib/wallpapers'
import { warmServiceWorkerCache } from '../sw-register'
import { CrtOverlay } from './crt-overlay'
import { Desktop } from './desktop/desktop'
import { ShellInputProvider } from './input/shell-input'
import { ShaderGlass } from './shader-glass'
import { StartMenu } from './start-menu/start-menu'
import { StartupScreen } from './startup/startup-screen'
import { useStartupPreload } from './startup/use-startup-preload'
import { Taskbar } from './taskbar/taskbar'
import { WindowRenderer } from './window/renderer'

function hasFilePayload(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) {
    return false
  }

  for (let i = 0; i < dataTransfer.items.length; i += 1) {
    if (dataTransfer.items[i]?.kind === 'file') {
      return true
    }
  }

  for (let i = 0; i < dataTransfer.types.length; i += 1) {
    if (dataTransfer.types[i] === 'Files') {
      return true
    }
  }

  return false
}

function hasSupportedFiles(fileList: FileList | null): boolean {
  if (!fileList) {
    return false
  }

  return Array.from(fileList).some(isSupportedDesktopMediaFile)
}

function handleDragOver(event: DragEvent<HTMLDivElement>): void {
  if (!hasFilePayload(event.dataTransfer)) {
    return
  }

  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

export function Shell(): React.ReactElement {
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const screenRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [shellInputRoot, setShellInputRoot] = useState<HTMLDivElement | null>(null)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const desktopRef = useRef<DesktopHandle>(null)
  const dragDepthRef = useRef(0)
  const [crtEnabled] = useCrtEffect()
  const [crtTuning] = useCrtTuning()

  // Pause the full-screen CRT animations during trackpad pinch-zoom so they do
  // not compete with the browser's per-frame page re-rasterization. Only wires
  // up listeners while the CRT effect is active.
  usePinchZoomPause(crtEnabled)
  const [monitorFrame] = useMonitorFrame()
  const shaderGlass = useShaderGlass(screenRef)
  const [gradientEnabled] = useGradientTitlebar()

  // Stop CRT Glass when the monitor frame is hidden — the effect is only
  // meaningful inside the bezel, and leaving the capture stream running
  // wastes resources when the controls and output panel are gone.
  useEffect(() => {
    if (!monitorFrame && shaderGlass.active) {
      shaderGlass.stop()
    }
  }, [monitorFrame, shaderGlass])
  const [wallpaperSettings] = useWallpaper()
  const [desktopBgColor] = useDesktopBgColor()
  const [iconLabelBgColor] = useIconLabelBgColor()
  const [screenSize, setScreenSize] = useScreenSize()
  const wallpaperEntry = getWallpaperEntry(wallpaperSettings.id)
  const customWallpaperUrl = useCustomWallpaperUrl(wallpaperSettings.id)
  const { importFiles, loading: desktopFilesLoading } = useDesktopFiles()

  // const { open, deactivateAll, setContainer, linkElement } = useProcessActions()
  const { open, deactivateAll, minimizeAll, setContainer } = useProcessActions()

  const preload = useStartupPreload()
  const isBooted = preload.ready && !desktopFilesLoading

  // Set container ref to store on mount
  const setContainerRef = (el: HTMLDivElement | null): void => {
    containerRef.current = el
    setContainer(el)
  }

  const setScreenRootRef = (el: HTMLDivElement | null): void => {
    screenRef.current = el
    setShellInputRoot(el)
  }

  // Open default windows once boot is complete, and ask the SW to warm
  // its cache in the background so repeat visits are instant.
  useEffect(() => {
    if (!isBooted)
      return
    getStartupAppIds().forEach(appId => open(appId))
    warmServiceWorkerCache(['critical', 'warm'])
  }, [isBooted, open])

  const handleDesktopClick = (): void => {
    deactivateAll()
    setShowStartMenu(false)
  }

  const handleShowDesktop = (): void => {
    minimizeAll()
    desktopRef.current?.clearSelection()
    setShowStartMenu(false)
  }

  const handleDragEnter = (event: DragEvent<HTMLDivElement>): void => {
    if (!hasFilePayload(event.dataTransfer)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current += 1
    setIsDragActive(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    if (!hasFilePayload(event.dataTransfer)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setIsDragActive(false)
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    dragDepthRef.current = 0
    setIsDragActive(false)

    if (!hasSupportedFiles(event.dataTransfer.files)) {
      return
    }
    void importFiles(Array.from(event.dataTransfer.files))
  }

  const isCustom = isCustomWallpaperId(wallpaperSettings.id)
  const wallpaperSrc = isCustom ? customWallpaperUrl : wallpaperEntry?.src
  const isNoneWallpaper = wallpaperSettings.id === 'none'
  // Note: avoid `background-attachment: fixed` (`bg-fixed`). A viewport-fixed
  // background cannot be promoted to its own compositor layer, so the browser
  // must repaint the full-viewport wallpaper on every frame — this is the main
  // cause of stutter during trackpad pinch-zoom (which re-rasterizes the page
  // per frame), especially with the animated tiled default wallpaper. The
  // desktop never scrolls and fills the viewport in the default layout, so
  // scroll-attachment renders identically while staying compositable.
  const wallpaperBgClasses = wallpaperSrc
    ? wallpaperSettings.mode === 'stretch'
      ? 'bg-no-repeat bg-center bg-cover'
      : wallpaperSettings.mode === 'fill'
        ? 'bg-no-repeat bg-center bg-size-[100%_100%]'
        : wallpaperSettings.mode === 'centered'
          ? 'bg-no-repeat bg-center bg-contain'
          : 'bg-size-[initial] bg-repeat bg-center'
    : ''

  const screenStyle = {
    ...(isBooted ? { backgroundColor: desktopBgColor } : {}),
    ...(isBooted && wallpaperSrc ? { backgroundImage: `url(${isCustom ? wallpaperSrc : assetPath(wallpaperSrc)})` } : {}),
    '--desktop-icon-label-bg': isNoneWallpaper ? 'transparent' : iconLabelBgColor,
  } as CSSProperties

  // Monitor sizing — the monitor always fits the viewport (no manual scale):
  //
  // 1. single monitor: bezel uses native resolution capped by CSS max-h/w-full,
  //    so a larger preset (e.g. 1600×1200) fills more of the viewport than a
  //    smaller one (640×480), keeping the resolution choices visually distinct.
  //
  // 2. CRT glass: each panel is computed to half the available viewport so both
  //    always fit side-by-side without overflow.
  //
  // All sizes are real CSS pixels, so window drag/resize coordinate math stays
  // correct (portrait rotation is handled by the transform-aware drag hooks).
  const aspect = screenSize.width / screenSize.height
  const pad = 'clamp(0.5rem,2.5vw,1.25rem)'
  const glassActive = shaderGlass.active

  // Half-viewport formula used when both panels must fit side-by-side
  const glassFitW = `min(calc((100vw - ${pad} * 2 - 0.75rem) / 2), calc((100vh - ${pad} * 2) * ${String(aspect)}))`
  const glassFitH = `min(calc((100vw - ${pad} * 2 - 0.75rem) / 2 / ${String(aspect)}), calc(100vh - ${pad} * 2))`

  // Bezel inline size style — native resolution capped to viewport, or half-viewport beside the glass panel
  const bezelSizeStyle: CSSProperties = !glassActive
    ? { width: screenSize.width, height: screenSize.height, aspectRatio: `${screenSize.width} / ${screenSize.height}` }
    : { width: glassFitW, height: glassFitH }

  // CRT output panel size style
  // CRT output panel size style
  const crtPanelSizeStyle: CSSProperties = { width: glassFitW, height: glassFitH }

  // Structural classes/styles that switch between no-bezel and bezel modes without
  // changing the element type at each tree position. React updates props in-place so
  // WindowRenderer (and open windows such as DisplayProperties) never unmounts on toggle.
  const alignmentWrapperClass = !monitorFrame
    ? 'relative size-full'
    : (!glassActive ? 'contents' : 'flex items-center gap-3 max-h-full max-w-full')

  const bezelContainerClass = !monitorFrame
    ? 'relative size-full overflow-hidden'
    : `relative isolate box-border min-h-0 min-w-0 overflow-hidden bg-(--button-face) p-[clamp(20px,3.5vw,40px)] shadow-[2px_2px_0_1px_var(--button-dk-shadow)]${!glassActive ? ' max-h-full max-w-full' : ''}`

  const bezelContainerStyle: CSSProperties | undefined = monitorFrame
    ? {
        ...bezelSizeStyle,
        borderTop: '6px solid var(--button-hilight)',
        borderLeft: '6px solid var(--button-hilight)',
        borderRight: '6px solid var(--button-shadow)',
        borderBottom: '6px solid var(--button-shadow)',
        outline: '1px dotted var(--button-face)',
        outlineOffset: '-5px',
      }
    : undefined

  const screenSurroundClass = monitorFrame
    ? 'relative z-1 size-full overflow-hidden bg-gray-950 p-[clamp(2px,0.4vw,4px)] shadow-[inset_0_0_24px_rgb(0_0_0/0.85)]'
    : 'size-full'

  const desktopContent = (
    <>
      {crtEnabled && <CrtOverlay settings={crtTuning} />}
      {/* Desktop */}
      <div
        ref={setScreenRootRef}
        className={`relative z-0 flex size-full min-h-0 flex-col overflow-hidden${wallpaperBgClasses ? ` ${wallpaperBgClasses}` : ''}${gradientEnabled ? '' : ' [--gradient-active-title:var(--active-title)] [--gradient-inactive-title:var(--inactive-title)]'}`}
        style={screenStyle}
      >
        {!isBooted
          ? (
              <StartupScreen
                preload={preload}
                waitingForDesktopFiles={preload.ready && desktopFilesLoading}
              />
            )
          : (
              <LayerProvider>
                <ShellInputProvider rootElement={shellInputRoot}>
                  <ScreenBoundaryContext value={screenRef}>
                    {/* Desktop Area */}
                    <div className="flex-1 overflow-hidden relative">
                      <div
                        className="h-full relative overflow-clip"
                        ref={setContainerRef}
                        onPointerDown={handleDesktopClick}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {/* Desktop Icons */}
                        <Desktop ref={desktopRef} />

                        {isDragActive && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 pointer-events-none">
                            <div className="px-4 py-2 text-[11px] text-(--button-text) bg-(--button-face) shadow-(--shadow-raised)">
                              Drop audio or video files to add them to the desktop
                            </div>
                          </div>
                        )}

                        {/* All managed windows */}
                        <WindowRenderer />
                      </div>
                    </div>

                    {/* Start Menu */}
                    {showStartMenu && (
                      <StartMenu
                        anchorRef={startButtonRef}
                        screenRef={screenRef}
                        onClose={() => setShowStartMenu(false)}
                      />
                    )}

                    {/* Taskbar */}
                    <Taskbar
                      startButtonRef={startButtonRef}
                      showStartMenu={showStartMenu}
                      onStartMenuToggle={() => setShowStartMenu(!showStartMenu)}
                      onShowDesktop={handleShowDesktop}
                    />
                  </ScreenBoundaryContext>
                </ShellInputProvider>
              </LayerProvider>
            )}
      </div>
    </>
  )

  return (
    <div className="flex h-screen w-full bg-[#20242c] p-[clamp(0.5rem,2.5vw,1.25rem)] select-none selection:bg-(--hilight) selection:text-(--hilight-text) items-center justify-center overflow-hidden">
      {/*
        Alignment wrapper — className switches between modes but element type stays `div`,
        so React updates props in-place and never remounts the subtree below.
          no bezel  : relative size-full (fills padded viewport)
          fit+single: `contents` (bezel participates in outer flex directly)
          fit+glass : flex row capped to viewport so both panels fit side-by-side
          numeric   : m-auto flex row inside the scrollable outer container
      */}
      <div className={alignmentWrapperClass}>
        {/* Bezel container — className/style change on toggle; always a `div` at position 0 */}
        <div className={bezelContainerClass} style={bezelContainerStyle}>
          {/* Screen surround — always the first child so WindowRenderer is never remounted */}
          <div className={screenSurroundClass}>
            {desktopContent}
          </div>

          {/* Bezel decorations rendered after content to keep the screen at stable position 0.
              All elements are absolutely positioned and do not affect layout. */}
          {monitorFrame && (
            <>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ outline: '1px dotted var(--button-face)' }} />

              {/* Inner bevel — gives depth to the bezel frame */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-2"
                style={{
                  inset: 'clamp(18px,3.3vw,38px)',
                  borderTop: '2px solid var(--button-shadow)',
                  borderLeft: '2px solid var(--button-shadow)',
                  borderBottom: '2px solid var(--button-hilight)',
                  borderRight: '2px solid var(--button-hilight)',
                }}
              />

              {/* Display controls: resolution + CRT Glass */}
              <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1">
                <select
                  className="cursor-pointer appearance-none bg-(--button-face) px-1.5 py-0.5 text-[10px] text-(--button-text) shadow-(--shadow-raised)"
                  value={`${screenSize.width}x${screenSize.height}`}
                  onChange={(e) => {
                    const preset = SCREEN_SIZE_PRESETS.find(p => `${p.width}x${p.height}` === e.target.value)
                    if (preset)
                      setScreenSize({ width: preset.width, height: preset.height })
                  }}
                >
                  {SCREEN_SIZE_PRESETS.map(preset => (
                    <option key={`${preset.width}x${preset.height}`} value={`${preset.width}x${preset.height}`}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!shaderGlass.supported}
                  title={
                    shaderGlass.supported
                      ? 'Show a live CRT-shaded view beside the monitor'
                      : 'Requires Chrome 104+ (Region Capture)'
                  }
                  className="cursor-pointer bg-(--button-face) px-1.5 py-0.5 text-[10px] text-(--button-text) disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ boxShadow: shaderGlass.active ? 'var(--shadow-sunken)' : 'var(--shadow-raised)' }}
                  onClick={() => {
                    if (shaderGlass.active)
                      shaderGlass.stop()
                    else
                      void shaderGlass.start()
                  }}
                >
                  {shaderGlass.active ? 'Exit CRT Glass' : 'CRT Glass'}
                </button>
              </div>

              {/* Power LED indicator */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 right-5 inline-block h-2 w-5"
                style={{
                  borderTop: '3px solid #4d9046',
                  borderBottom: '3px solid #07ff00',
                }}
              />
            </>
          )}
        </div>

        {/* CRT output panel — ShaderGlass side-by-side view (bezel mode only) */}
        {monitorFrame && shaderGlass.active && shaderGlass.stream && (
          <div
            className="relative overflow-hidden bg-black shadow-[inset_0_0_24px_rgb(0_0_0/0.85)]"
            style={crtPanelSizeStyle}
          >
            <ShaderGlass stream={shaderGlass.stream} settings={crtTuning} />
          </div>
        )}
      </div>
    </div>
  )
}
