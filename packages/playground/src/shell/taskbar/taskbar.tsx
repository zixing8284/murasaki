import type { TaskbarQuickLaunchIcon } from 'murasaki-react98'
import {
  Button,
  Taskbar as TaskbarRoot,
  TaskbarDivider,
  TaskbarNotificationArea,
  TaskbarQuickLaunch,
  TaskbarSystemClock,
} from 'murasaki-react98'
import { DisplayPropertiesIcon } from './notification-area/display-properties-icon'
import { NetworkIcon } from './notification-area/network-icon'
import { RunningTasks } from './running-tasks/running-tasks'

const QUICK_LAUNCH_ICONS: TaskbarQuickLaunchIcon[] = [
  { src: '/img/desktop.png', alt: 'Show Desktop', title: 'Show Desktop' },
  { src: '/img/express.png', alt: 'Email Me', title: 'Outlook Express' },
  { src: '/img/world.png', alt: 'Internet', title: 'Internet Explorer' },
  { src: '/img/computer.png', alt: 'Computer', title: 'My Computer' },
]

interface TaskbarProps {
  showStartMenu: boolean
  onStartMenuToggle: () => void
}

export function Taskbar({ showStartMenu, onStartMenuToggle }: TaskbarProps): React.ReactElement {
  return (
    <TaskbarRoot className="mt-auto">
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
      <TaskbarQuickLaunch icons={QUICK_LAUNCH_ICONS} />

      {/* Running Tasks */}
      <RunningTasks />

      {/* Divider */}
      <div className="flex items-center mx-0.5 gap-px">
        <div className="h-5.5 w-px border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
      </div>

      {/* Notification Area (System Tray) */}
      <TaskbarNotificationArea>
        <NetworkIcon />
        <DisplayPropertiesIcon />
        <TaskbarSystemClock />
      </TaskbarNotificationArea>
    </TaskbarRoot>
  )
}
