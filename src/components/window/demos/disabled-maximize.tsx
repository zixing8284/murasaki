import { useState } from 'react'

import { Button } from '@/components/button/button'

import { Window } from '../window'

export function DisabledMaximize(): React.ReactElement {
  const [showWindow, setShowWindow] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        Window with disabled maximize button (common for fixed-size dialogs)
      </p>
      <Button
        onClick={() => {
          setShowWindow(v => !v)
        }}
      >
        {showWindow ? 'Close Window' : 'Open Window'}
      </Button>
      {showWindow && (
        <Window
          disableMaximize
          draggable
          onClose={() => {
            setShowWindow(false)
          }}
          title="Fixed Size Window"
        >
          <p>This window cannot be maximized.</p>
          <p className="text-btn-shadow mt-2 text-xs">
            The maximize button is disabled and shows a grayed icon.
          </p>
        </Window>
      )}
    </div>
  )
}
