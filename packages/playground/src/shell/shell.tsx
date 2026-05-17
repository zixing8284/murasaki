import type { DragEvent } from 'react'
import { LayerProvider } from '@murasaki/react98'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupportedDesktopMediaFile, useDesktopFiles } from '../contexts/desktop-files'
import { getStartupAppIds, useProcessActions } from '../contexts/process'
import { useCrtEffect } from '../hooks/use-crt-effect'
import { useGradientTitlebar } from '../hooks/use-gradient-titlebar'
import { assetPath } from '../lib/asset-path'
import { DESKTOP_WALLPAPER_IMAGE } from '../lib/playground-assets'
import { warmServiceWorkerCache } from '../sw-register'
import { Desktop } from './desktop/desktop'
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

export function Shell(): React.ReactElement {
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const screenRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const dragDepthRef = useRef(0)
  const [crtEnabled] = useCrtEffect()
  const [gradientEnabled] = useGradientTitlebar()
  const { importFiles, loading: desktopFilesLoading } = useDesktopFiles()

  // const { open, deactivateAll, setContainer, linkElement } = useProcessActions()
  const { open, deactivateAll, setContainer } = useProcessActions()

  const preload = useStartupPreload()
  const isBooted = preload.ready && !desktopFilesLoading

  // Set container ref to store on mount
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el
    setContainer(el)
  }, [setContainer])

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

  const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!hasFilePayload(event.dataTransfer)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current += 1
    setIsDragActive(true)
  }, [])

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!hasFilePayload(event.dataTransfer)) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!hasFilePayload(event.dataTransfer)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setIsDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepthRef.current = 0
    setIsDragActive(false)

    if (!hasSupportedFiles(event.dataTransfer.files)) {
      return
    }
    void importFiles(event.dataTransfer.files)
  }, [importFiles])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#20242c] p-[clamp(0.5rem,2.5vw,1.25rem)] select-none selection:bg-(--hilight) selection:text-(--hilight-text)">
      {/* Monitor bezel — dark frame */}
      <div className="[--bezel:clamp(28px,2.5vw,36px)] relative isolate h-full w-full min-h-0 min-w-0 rounded-lg border-(length:--bezel) border-[#252627] bg-black before:pointer-events-none before:absolute before:z-0 before:-inset-[calc(var(--bezel)+2px)] before:rounded-lg before:border-2 before:border-t-[#3e3f42] before:border-r-[#19191a] before:border-b-[#0c0d0d] before:border-l-[#313235] before:content-[''] after:pointer-events-none after:absolute after:z-3 after:-inset-1 after:rounded-lg after:border-4 after:border-t-[#19191a] after:border-r-[#3e3f42] after:border-b-[#313235] after:border-l-[#0c0d0d] after:content-['']">
        {/* Bottom bezel strip — logo badge */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--bezel)*-1+6px)] z-4 flex h-[calc(var(--bezel)-12px)] items-center justify-center">
          <div className="relative grid h-8 w-9 place-items-center leading-none">
            <span className="relative text-[#fbfbfb] [text-shadow:0_1px_0_#000] font-bold">murasaki</span>
          </div>
        </div>

        {/* Screen surround — black with inset vignette, CRT overlay when enabled */}
        <div className={`relative z-1 h-full w-full overflow-hidden bg-black p-[clamp(0px,1.2vw,2px)] shadow-[inset_0_0_18px_rgb(0_0_0/0.75)]${crtEnabled ? ' crt-overlay' : ''}`}>
          {/* Desktop */}
          <div
            ref={screenRef}
            className={`relative z-0 flex h-full min-h-0 w-full flex-col overflow-hidden bg-size-[initial] bg-repeat bg-center bg-fixed${gradientEnabled ? '' : ' [--gradient-active-title:var(--active-title)] [--gradient-inactive-title:var(--inactive-title)]'}`}
            style={isBooted ? { backgroundImage: `url(${assetPath(DESKTOP_WALLPAPER_IMAGE)})` } : undefined}
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
                        <Desktop />

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
                    />
                  </LayerProvider>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}
