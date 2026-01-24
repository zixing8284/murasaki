import { Button } from '#/components/button/button'

import { useState } from 'react'

import { Window } from '../window'

export function Dialog(): React.ReactElement {
  const [showDialog, setShowDialog] = useState(false)

  const closeDialog = (): void => {
    setShowDialog(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        Modal dialog with backdrop overlay, click outside or close button to
        dismiss
      </p>
      <Button
        onClick={() => {
          setShowDialog(true)
        }}
      >
        Open Dialog
      </Button>
      {showDialog && (
        <Window
          onClose={closeDialog}
          onOverlayClick={closeDialog}
          overlay
          showMaximize={false}
          showMinimize={false}
          title="Confirm"
        >
          <div className="flex flex-col gap-4">
            <p>Are you sure you want to proceed?</p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeDialog}>Yes</Button>
              <Button onClick={closeDialog}>No</Button>
            </div>
          </div>
        </Window>
      )}
    </div>
  )
}
