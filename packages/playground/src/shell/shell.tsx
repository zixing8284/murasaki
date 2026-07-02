import type { CSSProperties, DragEvent } from 'react'
import type { DesktopHandle } from './desktop/desktop'
import { LayerProvider } from '@murasaki-io/react98'
import { useEffect, useRef, useState } from 'react'
import { useDesktopFiles } from '../contexts/desktop-files/hooks'
import { isSupportedDesktopMediaFile } from '../contexts/desktop-files/storage'
import { getStartupAppIds } from '../contexts/process/directory'
import { useProcessActions } from '../contexts/process/hooks'
import { useCrtEffect } from '../hooks/use-crt-effect'
import { useCrtTuning } from '../hooks/use-crt-tuning'
import { useCustomWallpaperUrl } from '../hooks/use-custom-wallpaper-url'
import { useDesktopBgColor } from '../hooks/use-desktop-bg-color'
import { useGradientTitlebar } from '../hooks/use-gradient-titlebar'
import { useIconLabelBgColor } from '../hooks/use-icon-label-bg-color'
import { SCREEN_SCALE_OPTIONS, useScreenScale } from '../hooks/use-screen-scale'
import { SCREEN_SIZE_PRESETS, useScreenSize } from '../hooks/use-screen-size'
import { useShaderGlass } from '../hooks/use-shader-glass'
import { useWallpaper } from '../hooks/use-wallpaper'
import { assetPath } from '../lib/asset-path'
import { isCustomWallpaperId } from '../lib/wallpaper-storage'
import { getWallpaperEntry } from '../lib/wallpapers'
import { warmServiceWorkerCache } from '../sw-register'
import { CrtOverlay } from './crt-overlay'
import { Desktop } from './desktop/desktop'
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
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const desktopRef = useRef<DesktopHandle>(null)
  const dragDepthRef = useRef(0)
  const [crtEnabled] = useCrtEffect()
  const [crtTuning] = useCrtTuning()
  const shaderGlass = useShaderGlass(screenRef)
  const [gradientEnabled] = useGradientTitlebar()
  const [wallpaperSettings] = useWallpaper()
  const [desktopBgColor] = useDesktopBgColor()
  const [iconLabelBgColor] = useIconLabelBgColor()
  const [screenSize, setScreenSize] = useScreenSize()
  const [screenScale, setScreenScale] = useScreenScale()
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
  const wallpaperBgClasses = wallpaperSrc
    ? wallpaperSettings.mode === 'stretch'
      ? 'bg-no-repeat bg-center bg-cover'
      : wallpaperSettings.mode === 'fill'
        ? 'bg-no-repeat bg-center bg-size-[100%_100%] bg-fixed'
        : wallpaperSettings.mode === 'centered'
          ? 'bg-no-repeat bg-center bg-contain'
          : 'bg-size-[initial] bg-repeat bg-center bg-fixed'
    : ''

  const screenStyle = {
    ...(isBooted ? { backgroundColor: desktopBgColor } : {}),
    ...(isBooted && wallpaperSrc ? { backgroundImage: `url(${isCustom ? wallpaperSrc : assetPath(wallpaperSrc)})` } : {}),
    '--desktop-icon-label-bg': isNoneWallpaper ? 'transparent' : iconLabelBgColor,
  } as CSSProperties

  // Monitor sizing — three distinct modes:
  //
  // 1. fit + single monitor: bezel uses native resolution with CSS max-h/w-full
  //    so the element tries to be screenSize.width × screenSize.height but is
  //    capped by the viewport. A larger preset (e.g. 1600×1200) fills more of
  //    the viewport than a smaller one (640×480), restoring the original visual
  //    differentiation between resolution choices.
  //
  // 2. fit + CRT glass: each panel is computed to half the available viewport
  //    so both always fit side-by-side without overflow.
  //
  // 3. numeric scale: explicit px sizes derived from native × scale factor.
  //    The outer container scrolls so nothing is clipped.
  //
  // All sizes are real CSS pixels — not a transform — so window drag/resize
  // coordinate math stays correct.
  const aspect = screenSize.width / screenSize.height
  const pad = 'clamp(0.5rem,2.5vw,1.25rem)'
  const glassActive = shaderGlass.active
  const isFit = screenScale === 'fit'

  // Half-viewport formula used when both panels must fit side-by-side in Fit mode
  const glassFitW = `min(calc((100vw - ${pad} * 2 - 0.75rem) / 2), calc((100vh - ${pad} * 2) * ${String(aspect)}))`
  const glassFitH = `min(calc((100vw - ${pad} * 2 - 0.75rem) / 2 / ${String(aspect)}), calc(100vh - ${pad} * 2))`

  // Explicit px for numeric scale
  const numericW = isFit ? 0 : Math.round(screenSize.width * (screenScale as number))
  const numericH = isFit ? 0 : Math.round(screenSize.height * (screenScale as number))

  // Bezel inline size style — each mode sets different properties
  const bezelSizeStyle: CSSProperties = isFit && !glassActive
    ? { width: screenSize.width, height: screenSize.height, aspectRatio: `${screenSize.width} / ${screenSize.height}` }
    : isFit
      ? { width: glassFitW, height: glassFitH }
      : { width: numericW, height: numericH }

  // CRT output panel size style
  const crtPanelSizeStyle: CSSProperties = isFit
    ? { width: glassFitW, height: glassFitH }
    : { width: numericW, height: numericH }

  return (
    <div className={`flex h-screen w-full bg-[#20242c] p-[clamp(0.5rem,2.5vw,1.25rem)] select-none selection:bg-(--hilight) selection:text-(--hilight-text) ${isFit ? 'items-center justify-center overflow-hidden' : 'overflow-auto'}`}>
      {/* Side-by-side wrapper:
           fit + single : `contents` — transparent, bezel participates in parent flex directly
           fit + glass  : capped flex row so both panels stay in-viewport
           numeric      : m-auto flex row inside the scrollable outer container          */}
      <div className={isFit && !glassActive ? 'contents' : isFit ? 'flex items-center gap-3 max-h-full max-w-full' : 'm-auto flex items-center gap-3'}>
        {/* Monitor bezel — Win98-style 3D border */}
        <div
          className={`relative isolate box-border min-h-0 min-w-0 overflow-hidden bg-(--button-face) p-[clamp(20px,3.5vw,40px)] shadow-[2px_2px_0_1px_var(--button-dk-shadow)]${isFit && !glassActive ? ' max-h-full max-w-full' : ''}`}
          style={{
            ...bezelSizeStyle,
            borderTop: '6px solid var(--button-hilight)',
            borderLeft: '6px solid var(--button-hilight)',
            borderRight: '6px solid var(--button-shadow)',
            borderBottom: '6px solid var(--button-shadow)',
            outline: '1px dotted var(--button-face)',
            outlineOffset: '-5px',
          }}
        >
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

          {/* Screen surround — black with inset vignette, CRT overlay when enabled */}
          <div className="relative z-1 size-full overflow-hidden bg-gray-950 p-[clamp(2px,0.4vw,4px)] shadow-[inset_0_0_24px_rgb(0_0_0/0.85)]">
            {crtEnabled && <CrtOverlay settings={crtTuning} />}
            {/* Desktop */}
            <div
              ref={screenRef}
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
                      {/* Desktop Area */}
                      <div className="flex-1 overflow-hidden relative">
                        <div
                          className="h-full relative"
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
                    </LayerProvider>
                  )}
            </div>
          </div>

          {/* Display controls: resolution + scale + CRT Glass */}
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
            <select
              aria-label="Display scale"
              title="Scale the monitor — enlarge so tall windows fit, or use Fit for both panels"
              className="cursor-pointer appearance-none bg-(--button-face) px-1.5 py-0.5 text-[10px] text-(--button-text) shadow-(--shadow-raised)"
              value={String(screenScale)}
              onChange={(e) => {
                const option = SCREEN_SCALE_OPTIONS.find(o => String(o.value) === e.target.value)
                if (option)
                  setScreenScale(option.value)
              }}
            >
              {SCREEN_SCALE_OPTIONS.map(option => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
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
        </div>

        {/* CRT output panel — ShaderGlass side-by-side view */}
        {shaderGlass.active && shaderGlass.stream && (
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
