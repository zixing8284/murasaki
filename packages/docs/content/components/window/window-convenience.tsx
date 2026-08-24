'use client'

import { Button, Window } from '@murasaki-io/react98'
import { useState } from 'react'

export function WindowConvenienceDemo(): React.ReactElement {
  const [open, setOpen] = useState(true)

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>Reopen window</Button>
    )
  }

  return (
    <div className="relative h-64 w-full overflow-hidden">
      <Window
        title="My Document"
        defaultPosition={{ x: 16, y: 16 }}
        defaultSize={{ width: 320, height: 180 }}
        minWidth={200}
        minHeight={120}
        onClose={() => setOpen(false)}
      >
        <div className="flex size-full flex-col items-start gap-2 p-2">
          <p className="m-0">Drag the title bar. Resize from the bottom-right grip.</p>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </Window>
    </div>
  )
}
