import type { TaskbarQuickLaunchIcon } from '@murasaki-io/react98'
import type { RefObject } from 'react'
import {
  Button,
  TaskbarDivider,
  TaskbarNotificationArea,
  TaskbarQuickLaunch,
  Taskbar as TaskbarRoot,
  TaskbarSystemClock,
} from '@murasaki-io/react98'
import { getQuickLaunchApps } from '../../contexts/process/directory'
import { useProcessActions } from '../../contexts/process/hooks'
import { useQuickLaunchCount } from '../../hooks/use-quick-launch-count'
import { assetPath } from '../../lib/asset-path'
import { ICON } from '../../lib/icons'
import { DisplayPropertiesIcon } from './notification-area/display-properties-icon'
import { NetworkIcon } from './notification-area/network-icon'
import { SwUpdateBalloon } from './notification-area/sw-update-balloon'
import { VolumeIcon } from './notification-area/volume-icon'
import { RunningTasks } from './running-tasks/running-tasks'

interface TaskbarProps {
  startButtonRef: RefObject<HTMLButtonElement | null>
  showStartMenu: boolean
  onStartMenuToggle: () => void
  onShowDesktop: () => void
}

export function Taskbar({ startButtonRef, showStartMenu, onStartMenuToggle, onShowDesktop }: TaskbarProps): React.ReactElement {
  const [quickLaunchVisibleCount, setQuickLaunchVisibleCount] = useQuickLaunchCount()
  const { open } = useProcessActions()

  // "Show Desktop" is a shell action, not an app; the rest of the strip is
  // derived from apps that declare a `quickLaunch` placement in the registry.
  const quickLaunchIcons: TaskbarQuickLaunchIcon[] = [
    {
      src: assetPath(ICON.showDesktop.sm),
      alt: 'Show Desktop',
      title: 'Show Desktop',
      onClick: onShowDesktop,
    },
    ...getQuickLaunchApps().map(app => ({
      src: assetPath(app.icon.sm),
      alt: app.alt,
      title: app.title,
      onClick: () => open(app.appId),
    })),
  ]

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
        icons={quickLaunchIcons}
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
        <VolumeIcon />
        <NetworkIcon />
        <DisplayPropertiesIcon />
        <TaskbarSystemClock />
      </TaskbarNotificationArea>
    </TaskbarRoot>
  )
}
