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
    <footer className="flex flex-row items-center bg-(--button-face) p-0.75 shadow-raised z-2 overflow-hidden mt-auto select-none">
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
        <div className="h-5.5 w-px border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
      </div>

      {/* Notification Area (System Tray) */}
      <NotificationArea />
    </footer>
  )
}
