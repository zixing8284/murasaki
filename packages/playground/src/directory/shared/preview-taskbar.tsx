import {
  Button,
  Taskbar,
  TaskbarNotificationArea,
  TaskbarSystemClock,
} from '@murasaki/react98'

interface PreviewTaskbarProps {
  startLabel?: string
}

export function PreviewTaskbar({ startLabel = 'Start' }: PreviewTaskbarProps): React.ReactElement {
  return (
    <div className="absolute bottom-0 left-0 right-0">
      <Taskbar className="h-5.5">
        <Button
          tabIndex={-1}
          className="h-4 min-h-0 min-w-0 px-1 py-0 leading-none"
        >
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
