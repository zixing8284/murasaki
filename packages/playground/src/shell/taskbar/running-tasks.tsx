import { Button } from 'murasaki-react98'
import { useProcessActions, useProcesses, useProcessList } from '../../contexts/process'

export function RunningTasks(): React.ReactElement {
  const windows = useProcessList()
  const { foregroundId } = useProcesses()
  const { handleTaskbarClick } = useProcessActions()

  return (
    <div className="flex flex-1 overflow-hidden gap-0.5 px-0.5">
      {windows.map(win => (
        <Button
          key={win.id}
          active={foregroundId === win.id && !win.minimized}
          onClick={() => handleTaskbarClick(win.id)}
          className="max-w-40 min-w-10 w-full flex items-center gap-1 text-left px-1! truncate h-5.5! min-h-0!"
        >
          <img src={win.icon} alt="" className="w-4 h-4 shrink-0 pixelated" draggable={false} />
          <span className={`truncate text-[11px] ${win.minimized ? 'opacity-70' : ''}`}>{win.title}</span>
        </Button>
      ))}
    </div>
  )
}
