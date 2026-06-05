import { Button } from '@murasaki-io/react98'
import { useProcessActions, useProcesses, useProcessList } from '../../../contexts/process/hooks'
import { AppIcon } from '../../app-icon'

export function RunningTasks(): React.ReactElement {
  const windows = useProcessList()
  const { foregroundId } = useProcesses()
  const { handleTaskbarClick } = useProcessActions()

  return (
    <div className="flex flex-1 overflow-hidden gap-0.5 px-0.5">
      {windows.map((win) => {
        const isActive = foregroundId === win.id && !win.minimized
        return (
          <Button
            key={win.id}
            active={isActive}
            onClick={() => handleTaskbarClick(win.id)}
            className="max-w-40 min-w-10 w-full flex items-center gap-1 text-left px-1! truncate h-5.5! min-h-0!"
          >
            <AppIcon appId={win.appId} size="sm" />
            <span className={`truncate text-[11px] ${isActive ? '' : 'opacity-70'}`}>{win.title}</span>
          </Button>
        )
      })}
    </div>
  )
}
