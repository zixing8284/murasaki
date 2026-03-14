import { Button } from 'murasaki-react98'
import { NotificationArea } from './notification-area/notification-area'
import { QuickLaunch } from './quick-launch/quick-launch'
import { RunningTasks } from './running-tasks/running-tasks'
import { TaskbarDivider } from './taskbar-divider'

interface TaskbarProps {
  showStartMenu: boolean
  onStartMenuToggle: () => void
}

export function Taskbar({ showStartMenu, onStartMenuToggle }: TaskbarProps): React.ReactElement {
  return (
    <footer className="flex flex-row items-center bg-[silver] p-0.75 shadow-[inset_-1px_-1px_#000,inset_1px_1px_#d4d0c8,inset_-2px_-2px_#808080,inset_2px_2px_#fff] z-2 overflow-hidden mt-auto select-none">
      {/* Start Button */}
      <div>
        <Button
          active={showStartMenu}
          onClick={onStartMenuToggle}
        >
          Hello
        </Button>
      </div>

      {/* Divider */}
      <TaskbarDivider />

      {/* Quick Launch */}
      <QuickLaunch />

      {/* Running Tasks */}
      <RunningTasks />

      {/* Divider */}
      <div className="flex items-center mx-0.5 gap-px">
        <div className="h-5.5 w-px border-l border-l-[#808080] border-r border-r-white shadow-[1px_0_0_0_rgba(255,255,255,0.3)]" />
      </div>

      {/* Notification Area (System Tray) */}
      <NotificationArea />
    </footer>
  )
}
