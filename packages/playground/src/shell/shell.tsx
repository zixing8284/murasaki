import type { DragEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupportedDesktopMediaFile, useDesktopFiles } from '../contexts/desktop-files'
import { APP_ID, useProcessActions } from '../contexts/process'
import { useCrtEffect } from '../hooks/use-crt-effect'
import { useGradientTitlebar } from '../hooks/use-gradient-titlebar'
import { Desktop } from './desktop/desktop'
import { StartMenu } from './start-menu/start-menu'
import { Taskbar } from './taskbar/taskbar'
import { WindowRenderer } from './window/renderer'

const DEFAULT_STARTUP_APPS = [APP_ID.MY_COMPUTER, APP_ID.DOCS] as const

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
  const containerRef = useRef<HTMLDivElement>(null)
  const dragDepthRef = useRef(0)
  const [crtEnabled] = useCrtEffect()
  const [gradientEnabled] = useGradientTitlebar()
  const { importFiles } = useDesktopFiles()

  // const { open, deactivateAll, setContainer, linkElement } = useProcessActions()
  const { open, deactivateAll, setContainer } = useProcessActions()

  // Set container ref to store on mount
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el
    setContainer(el)
  }, [setContainer])

  // Open default windows on mount
  useEffect(() => {
    DEFAULT_STARTUP_APPS.forEach(appId => open(appId))
  }, [open])

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
    <div className={`h-screen w-full flex flex-col bg-[#111] border-[3em] border-[#111] relative select-none selection:bg-(--hilight) selection:text-(--hilight-text) bg-[url('/img/animspace.gif')] bg-size-[initial] bg-repeat bg-center bg-fixed ${crtEnabled ? 'scanline-overlay' : ''} ${gradientEnabled ? '' : 'no-gradient-titlebar'}`}>
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
        <StartMenu onClose={() => setShowStartMenu(false)} />
      )}

      {/* Taskbar */}
      <Taskbar
        showStartMenu={showStartMenu}
        onStartMenuToggle={() => setShowStartMenu(!showStartMenu)}
      />
    </div>
  )
}
