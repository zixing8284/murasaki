import { useEffect, useState } from 'react'
import { DocsWindow } from './components/docs-window/docs-window'
import { MyComputerWindow } from './components/my-computer-window'
import { Taskbar } from './components/taskbar'
import { WindowRenderer } from './components/window-renderer'
import { registerApp } from './stores/app-registry'
import { useWindowManager } from './stores/window-manager'

// Register all application types
registerApp({ appId: 'mycomputer', component: MyComputerWindow, defaultTitle: 'My Computer', defaultIcon: '/img/desktop/MyComputer.png' })
registerApp({ appId: 'docs', component: DocsWindow, defaultTitle: 'Component Docs', defaultIcon: '/img/desktop/MyComputer.png' })

function formatTime(): string {
  return new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export function App(): React.ReactElement {
  const [time, setTime] = useState(formatTime)
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  const { openWindow, deactivateAll } = useWindowManager()

  // Open default windows on mount
  useEffect(() => {
    openWindow({ id: 'mycomputer', appId: 'mycomputer', title: 'My Computer', icon: '/img/desktop/MyComputer.png' })
    openWindow({ id: 'docs', appId: 'docs', title: 'Component Docs', icon: '/img/desktop/MyComputer.png' })
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
      {/* Window Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full relative" ref={setContainer} onPointerDown={handleDesktopClick}>
          {/* Desktop content goes here */}

          {/* All managed windows */}
          <WindowRenderer container={container} />
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
