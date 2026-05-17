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
import { usePersistentQuickLaunchVisibleCount } from '../../hooks/use-persistent-quick-launch-visible-count'
import { assetPath } from '../../lib/asset-path'
import { TASKBAR_QUICK_LAUNCH_ICONS } from '../../lib/playground-assets'
import { DisplayPropertiesIcon } from './notification-area/display-properties-icon'
import { NetworkIcon } from './notification-area/network-icon'
import { SwUpdateBalloon } from './notification-area/sw-update-balloon'
import { RunningTasks } from './running-tasks/running-tasks'

const QUICK_LAUNCH_LABELS = [
  { alt: 'Show Desktop', title: 'Show Desktop' },
  { alt: 'Email Me', title: 'Outlook Express' },
  { alt: 'Internet', title: 'Internet Explorer' },
  { alt: 'Computer', title: 'My Computer' },
]

const QUICK_LAUNCH_ICONS: TaskbarQuickLaunchIcon[] = TASKBAR_QUICK_LAUNCH_ICONS.map((path, index) => ({
  src: assetPath(path),
  ...QUICK_LAUNCH_LABELS[index],
}))

interface TaskbarProps {
  startButtonRef: RefObject<HTMLButtonElement | null>
  showStartMenu: boolean
  onStartMenuToggle: () => void
}

export function Taskbar({ startButtonRef, showStartMenu, onStartMenuToggle }: TaskbarProps): React.ReactElement {
  const [quickLaunchVisibleCount, setQuickLaunchVisibleCount] = usePersistentQuickLaunchVisibleCount()

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
      <TaskbarQuickLaunch
        icons={QUICK_LAUNCH_ICONS}
        visibleCount={quickLaunchVisibleCount}
        onVisibleCountChange={setQuickLaunchVisibleCount}
      />

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
