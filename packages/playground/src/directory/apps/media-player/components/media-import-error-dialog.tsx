import type { JSX } from 'react'
import { Button, Divider } from '@murasaki-io/react98'
import { DialogWindow } from '../../../shared/dialog-window'

interface MediaImportErrorDialogProps {
  fileName: string
  message: string
  onClose: () => void
}

export function MediaImportErrorDialog({
  fileName,
  message,
  onClose,
}: MediaImportErrorDialogProps): JSX.Element {
  return (
    <DialogWindow title="Media Import Error" onClose={onClose}>
      <div className="flex w-80 max-w-[90vw] flex-col gap-3 p-4">
        <div className="space-y-1">
          <p className="font-bold">Could not open local media file</p>
          <p className="truncate text-(--gray-text)">{fileName}</p>
        </div>

        <Divider />

        <p>{message}</p>

        <div className="flex justify-end">
          <Button className="px-6" onClick={onClose}>Close</Button>
        </div>
      </div>
    </DialogWindow>
  )
}
