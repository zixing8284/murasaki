import { OptionButton, OptionGroup, Window } from 'murasaki-react98'
import { useEffect, useRef, useState } from 'react'
import { Taskbar } from './components/Taskbar'

function formatTime(): string {
  return new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export function App(): React.ReactElement {
  const [time, setTime] = useState(formatTime)
  const [showStartMenu, setShowStartMenu] = useState(false)

  const [selected, setSelected] = useState('option1')
  // const windowContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen w-full flex flex-col bg-[#111] border-[3em] border-[#111] relative select-none selection:bg-[#0000a2] selection:text-white scanline-overlay bg-[url('/img/animspace.gif')] bg-size-[initial] bg-repeat bg-center bg-fixed">
      {/* Window Area */}
      <div className="flex-1 overflow-hidden relative m-0.5">
        {/* <div className="h-full relative" ref={windowContainerRef}> */}
        <div className="h-full relative">
          {/* Desktop content goes here */}
          <Window
            title="My Computer"
            active={true}
            className="w-[520px]"
            // appendTo={windowContainerRef}
            draggable
          >
            <div className="p-2">
              <p>Window content here...</p>
              <OptionGroup name="demo" onChange={setSelected} selectedValue={selected}>
                <div className="flex flex-col gap-2">
                  <OptionButton value="option1">Option 1</OptionButton>
                  <OptionButton value="option2">Option 2</OptionButton>
                  <OptionButton value="option3">Option 3</OptionButton>
                </div>
              </OptionGroup>
            </div>
          </Window>
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
      <Taskbar
        showStartMenu={showStartMenu}
        onStartMenuToggle={() => setShowStartMenu(!showStartMenu)}
        time={time}
      />
    </div>
  )
}
