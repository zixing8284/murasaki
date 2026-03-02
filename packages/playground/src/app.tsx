import { useCallback, useEffect, useRef, useState } from 'react'
import { DesktopIcon } from './components/desktop-icon'
import { Taskbar } from './components/taskbar'
import { WindowRenderer } from './components/window-renderer'
import { ProcessProvider, useProcessActions } from './contexts/process'

const DESKTOP_ICONS = [
  { appId: 'notepad', label: 'Notepad', icon: '/img/desktop/Notepad.png' },
]

function formatTime(): string {
  return new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

function AppInner(): React.ReactElement {
  const [time, setTime] = useState(formatTime)
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { open, deactivateAll, setContainer, linkElement } = useProcessActions()

  // Set container ref to store on mount
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el
    setContainer(el)
  }, [setContainer])

  const setDocsContainerRef = useCallback((el: HTMLDivElement | null) => {
    linkElement('docs', el)
  }, [linkElement])

  // Open default windows on mount
  useEffect(() => {
    open('mycomputer')
    open('docs')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDesktopClick = (): void => {
    deactivateAll()
    setShowStartMenu(false)
    setSelectedIconId(null)
  }

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen w-full flex flex-col bg-[#111] border-[3em] border-[#111] relative select-none selection:bg-[#0000a2] selection:text-white scanline-overlay bg-[url('/img/animspace.gif')] bg-size-[initial] bg-repeat bg-center bg-fixed">
      {/* Window Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full relative" ref={setContainerRef} onPointerDown={handleDesktopClick}>
          {/* Desktop Icons */}
          <div
            className="absolute top-2 left-2 flex flex-col gap-4"
            onPointerDown={e => e.stopPropagation()}
          >
            {DESKTOP_ICONS.map(iconConfig => (
              <DesktopIcon
                key={iconConfig.appId}
                {...iconConfig}
                selected={selectedIconId === iconConfig.appId}
                onSelect={setSelectedIconId}
                onOpen={appId => open(appId)}
              />
            ))}
          </div>
          {/* Desktop content goes here */}

          {/* Docs Window 专属容器（实验用） */}
          <div
            ref={setDocsContainerRef}
            className="absolute top-[60px] left-[60px] w-[900px] h-[600px] border-2 border-dashed border-white/25 overflow-hidden"
          />

          {/* All managed windows */}
          <WindowRenderer />
        </div>
      </div>

      {/* Manager Cover Overlay */}
      {showStartMenu && (
        <div
          className="absolute inset-0 z-246"
          onClick={() => setShowStartMenu(false)}
        />
      )}

      {/* Start Menu */}
      {showStartMenu && (
        <div className="absolute bottom-7.5 left-0 z-247">
          <div className="bg-[silver] min-h-25 w-43.5 shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] flex flex-row items-stretch p-0.5">
            {/* Stripe */}
            <div className="bg-linear-to-b from-[navy] to-[#1084d0] w-5.25 min-h-fit flex flex-col justify-end pb-4">
              <span className="text-white -rotate-90 origin-center whitespace-nowrap text-xs">
                murasaki-react98
              </span>
            </div>
            {/* Menu Items */}
            <div className="flex-1 flex flex-col-reverse items-stretch">
              <div className="flex flex-row items-center p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-[navy] hover:text-white">
                <span className="flex-1">Programs</span>
              </div>
              <div className="flex flex-row items-center p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-[navy] hover:text-white">
                <span className="flex-1">Documents</span>
              </div>
              <div className="flex flex-row items-center p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-[navy] hover:text-white">
                <span className="flex-1">Settings</span>
              </div>
              <div className="border-b border-white border-t border-t-gray-500 m-0.5" />
              <div className="flex flex-row items-center p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-[navy] hover:text-white">
                <span className="flex-1">Shut Down...</span>
              </div>
            </div>
          </div>
        </div>
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

export function App(): React.ReactElement {
  return (
    <ProcessProvider>
      <AppInner />
    </ProcessProvider>
  )
}
