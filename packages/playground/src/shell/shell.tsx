import { useCallback, useEffect, useRef, useState } from 'react'
import { APP_ID, useProcessActions } from '../contexts/process'
import { Desktop } from './desktop/desktop'
import { StartMenu } from './start-menu/start-menu'
import { Taskbar } from './taskbar/taskbar'
import { WindowRenderer } from './window/renderer'

const DEFAULT_STARTUP_APPS = [APP_ID.MY_COMPUTER, APP_ID.DOCS] as const

export function Shell(): React.ReactElement {
  const [showStartMenu, setShowStartMenu] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // const { open, deactivateAll, setContainer, linkElement } = useProcessActions()
  const { open, deactivateAll, setContainer } = useProcessActions()

  // Set container ref to store on mount
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el
    setContainer(el)
  }, [setContainer])

  // const setDocsContainerRef = useCallback((el: HTMLDivElement | null) => {
  //   linkElement('docs', el)
  // }, [linkElement])

  // Open default windows on mount
  useEffect(() => {
    DEFAULT_STARTUP_APPS.forEach(appId => open(appId))
  }, [open])

  const handleDesktopClick = (): void => {
    deactivateAll()
    setShowStartMenu(false)
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#111] border-[3em] border-[#111] relative select-none selection:bg-selection selection:text-selection-text scanline-overlay bg-[url('/img/animspace.gif')] bg-size-[initial] bg-repeat bg-center bg-fixed">
      {/* Desktop Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full relative" ref={setContainerRef} onPointerDown={handleDesktopClick}>
          {/* Desktop Icons */}
          <Desktop onOpen={open} />

          {/* Docs Window 专属容器（实验用） */}
          {/* <div
            ref={setDocsContainerRef}
            className="absolute top-[60px] left-[60px] w-[900px] h-[600px] border-2 border-dashed border-white/25 overflow-hidden"
          /> */}

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
