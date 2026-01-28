import { Button } from '#/components/button/button'

import { useState } from 'react'

import { Window } from '../window'

export function ActiveInactive(): React.ReactElement {
  const [showActive, setShowActive] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        Compare active (blue title bar) and inactive (gray title bar) states
      </p>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            setShowActive(v => !v)
          }}
        >
          {showActive ? 'Close Active' : 'Open Active'}
        </Button>
        <Button
          onClick={() => {
            setShowInactive(v => !v)
          }}
        >
          {showInactive ? 'Close Inactive' : 'Open Inactive'}
        </Button>
      </div>
      {showActive && (
        <Window
          active
          draggable
          onClose={() => {
            setShowActive(false)
          }}
          title="Active Window"
        >
          <p>Blue title bar (focused)</p>
        </Window>
      )}
      {showInactive && (
        <Window
          active={false}
          draggable
          onClose={() => {
            setShowInactive(false)
          }}
          title="Inactive Window"
        >
          <p>Gray title bar (unfocused)</p>
        </Window>
      )}
    </div>
  )
}
