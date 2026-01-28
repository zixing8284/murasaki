import { Button } from '#/components/button/button'

import { useState } from 'react'

import { Window } from '../window'

export function BoundedContainer(): React.ReactElement {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [showWindow, setShowWindow] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        appendTo container: absolute positioning, constrained to container
      </p>
      <Button
        onClick={() => {
          setShowWindow(v => !v)
        }}
      >
        {showWindow ? 'Close Window' : 'Open Window'}
      </Button>
      {showWindow && (
        <div
          className="border-window-frame bg-desktop/20 relative h-[300px]
            border-2 border-dashed p-4"
          ref={setContainer}
        >
          {container && (
            <Window
              appendTo={container}
              draggable
              onClose={() => {
                setShowWindow(false)
              }}
              overlay
              title="Bounded Window"
            >
              <p>Can&apos;t escape the container!</p>
            </Window>
          )}
        </div>
      )}
    </div>
  )
}
