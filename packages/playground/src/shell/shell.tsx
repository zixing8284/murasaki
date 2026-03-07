import { useCallback, useEffect, useRef, useState } from 'react'
import { useProcessActions } from '../contexts/process'
import { Desktop } from './desktop/desktop'
import { StartMenu } from './start-menu/start-menu'
import { Taskbar } from './taskbar/taskbar'
import { WindowRenderer } from './window/renderer'

function formatTime(): string {
  return new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export function Shell(): React.ReactElement {
  const [time, setTime] = useState(formatTime)
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
    open('mycomputer')
    open('docs')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDesktopClick = (): void => {
    deactivateAll()
    setShowStartMenu(false)
  }

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen w-full flex flex-col bg-[#111] border-[3em] border-[#111] relative select-none selection:bg-[#0000a2] selection:text-white scanline-overlay bg-[url('/img/animspace.gif')] bg-size-[initial] bg-repeat bg-center bg-fixed">
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
        time={time}
      />
    </div>
  )
}
