import {
  Button,
  Taskbar,
  TaskbarNotificationArea,
  TaskbarSystemClock,
} from '@murasaki/react98'
import { assetPath } from '../../lib/asset-path'

interface PreviewTaskbarProps {
  startLabel?: string
}

export function PreviewTaskbar({ startLabel = 'Start' }: PreviewTaskbarProps): React.ReactElement {
  return (
    <div className="absolute bottom-0 left-0 right-0">
      <Taskbar className="h-5.5">
        <Button
          tabIndex={-1}
          className="inline-flex items-center gap-0.5 h-4 min-h-0 min-w-0 px-1 py-0 leading-none"
        >
          <img
            src={assetPath('/icons/windows98-icons/ico/windows.ico')}
            alt=""
            className="h-3 w-3 shrink-0"
            aria-hidden="true"
          />
          <span className="font-bold">{startLabel}</span>
        </Button>
        <div className="flex-1" />
        <TaskbarNotificationArea className="h-4 px-1 mt-0">
          <TaskbarSystemClock className="mx-0" />
        </TaskbarNotificationArea>
      </Taskbar>
    </div>
  )
}
