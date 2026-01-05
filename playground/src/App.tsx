import { Button } from '#/index'
import { useEffect, useState } from 'react'

function formatTime(): string {
  return new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export function App(): React.ReactElement {
  const [time, setTime] = useState(formatTime)
  const [showManager, setShowManager] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen w-full flex flex-col bg-[#111] border-[3em] border-[#111] relative select-none selection:bg-[#0000a2] selection:text-white scanline-overlay">
      {/* Window Area */}
      <div className="flex-1 overflow-hidden relative m-0.5">
        <div className="h-full relative">
          {/* Desktop content goes here */}
        </div>
      </div>

      {/* Manager Cover Overlay */}
      {showManager && (
        <div
          className="absolute inset-0 z-246"
          onClick={() => setShowManager(false)}
        />
      )}

      {/* Start Menu */}
      {showManager && (
        <div className="absolute bottom-7.5 left-0 z-247">
          <div className="bg-[silver] min-h-25 w-[174px] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] flex flex-row items-stretch p-0.5">
            {/* Stripe */}
            <div className="bg-linear-to-b from-[navy] to-[#1084d0] w-5.25 flex flex-col justify-end pb-4">
              <span className="text-white -rotate-90 origin-center whitespace-nowrap text-xs">
                React 98
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
      <footer className="flex flex-row items-center bg-[silver] p-0.75 shadow-[inset_-1px_-1px_#000,inset_1px_1px_#d4d0c8,inset_-2px_-2px_#808080,inset_2px_2px_#fff] z-2 overflow-hidden mt-auto select-none">
        {/* Start Button */}
        <div>
          <Button
            onClick={() => setShowManager(!showManager)}
            className={showManager ? 'outline outline-black -outline-offset-4 shadow-[inset_-1px_-1px_#fff,inset_1px_1px_#0a0a0a,inset_-2px_-2px_#dfdfdf,inset_2px_2px_grey]' : ''}
          >
            Start
          </Button>
        </div>

        {/* Divider */}
        <div className="shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] h-5.5 w-0.5 mx-0.5" />

        {/* Quick Launcher */}
        <div className="flex flex-row [&>img]:my-0 [&>img]:mx-0.5 [&>img]:cursor-pointer [&>img]:p-0.5 [&>img]:hover:shadow-[-1px_-1px_#dfdfdf,1px_1px_grey] [&>img]:active:shadow-[1px_1px_#dfdfdf,-1px_-1px_grey]">
          <img
            src="/img/desktop.png"
            alt="Show Desktop"
            title="Show Desktop"
          />
          <img
            src="/img/express.png"
            alt="Email Me"
            title="Outlook Express"
          />
        </div>

        {/* Divider */}
        <div className="shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] h-5.5 w-0.5 mx-0.5" />

        {/* Running Tasks */}
        <div className="flex flex-1 overflow-hidden">
          {/* Task buttons would go here */}
        </div>

        {/* Divider */}
        <div className="shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] h-5.5 w-0.5 mx-0.5" />

        {/* System Tray */}
        <div className="h-5.5 px-0.5 flex flex-row items-center border-l border-l-[#7b7b7b] border-t border-t-[#7b7b7b] border-r border-r-white border-b border-b-white mt-px pointer-events-none truncate">
          <img
            className="mx-px"
            src="/img/network.png"
            alt="network"
          />
          <img
            className="mx-px"
            src="/img/computer.png"
            alt="computer"
          />
          <span className="mx-1 antialiased">{time}</span>
        </div>
      </footer>
    </div>
  )
}
