import type { TaskbarQuickLaunchIcon } from '@murasaki/react98'
import type { RefObject } from 'react'
import {
  Button,
  TaskbarDivider,
  TaskbarNotificationArea,
  TaskbarQuickLaunch,
  Taskbar as TaskbarRoot,
  TaskbarSystemClock,
} from '@murasaki/react98'
import { assetPath } from '../../lib/asset-path'
import { DisplayPropertiesIcon } from './notification-area/display-properties-icon'
import { NetworkIcon } from './notification-area/network-icon'
import { SwUpdateBalloon } from './notification-area/sw-update-balloon'
import { RunningTasks } from './running-tasks/running-tasks'

const QUICK_LAUNCH_ICONS: TaskbarQuickLaunchIcon[] = [
  { src: assetPath('/icons/windows98-icons/ico/desktop.ico'), alt: 'Show Desktop', title: 'Show Desktop' },
  { src: assetPath('/icons/windows98-icons/ico/outlook_express.ico'), alt: 'Email Me', title: 'Outlook Express' },
  { src: assetPath('/icons/windows98-icons/ico/msie2.ico'), alt: 'Internet', title: 'Internet Explorer' },
  { src: assetPath('/icons/windows98-icons/ico/computer.ico'), alt: 'Computer', title: 'My Computer' },
]

interface TaskbarProps {
  startButtonRef: RefObject<HTMLButtonElement | null>
  showStartMenu: boolean
  onStartMenuToggle: () => void
}

export function Taskbar({ startButtonRef, showStartMenu, onStartMenuToggle }: TaskbarProps): React.ReactElement {
  return (
    <TaskbarRoot className="mt-auto">
      {/* Start Button */}
      <div>
        <Button
          ref={startButtonRef}
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
      <TaskbarNotificationArea className="relative">
        <SwUpdateBalloon />
        <NetworkIcon />
        <DisplayPropertiesIcon />
        <TaskbarSystemClock />
      </TaskbarNotificationArea>
    </TaskbarRoot>
  )
}
