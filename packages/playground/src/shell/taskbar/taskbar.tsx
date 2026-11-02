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
  isMobile?: boolean
}

export function Taskbar({ startButtonRef, showStartMenu, onStartMenuToggle, onShowDesktop, isMobile = false }: TaskbarProps): React.ReactElement {
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
    <TaskbarRoot className={`mt-auto ${isMobile ? 'h-[34px] min-h-[34px] shrink-0 gap-1 px-1' : ''}`}>
      {/* Start Button */}
      <div>
        <Button
          ref={startButtonRef}
          active={showStartMenu}
          onClick={onStartMenuToggle}
          className={isMobile ? 'h-7 min-h-7 min-w-[46px] px-2 text-[11px]' : ''}
        >
          {isMobile ? 'Start' : 'Hello'}
        </Button>
      </div>

      {!isMobile && (
        <>
          {/* Divider */}
          <TaskbarDivider />

          {/* Quick Launch */}
          <TaskbarQuickLaunch
            icons={quickLaunchIcons}
            visibleCount={quickLaunchVisibleCount}
            onVisibleCountChange={setQuickLaunchVisibleCount}
          />
        </>
      )}

      {/* Running Tasks */}
      <RunningTasks isMobile={isMobile} />

      <>
        <div className={`flex items-center gap-px ${isMobile ? 'mx-0' : 'mx-0.5'}`}>
          <div className={`${isMobile ? 'h-4.5' : 'h-5.5'} w-px border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)`} />
        </div>

        {/* Notification Area (System Tray) */}
        <TaskbarNotificationArea className={`relative ${isMobile ? 'h-7 min-h-7 gap-1 px-1.5 leading-none items-center' : ''}`}>
          <SwUpdateBalloon />
          <VolumeIcon />
          <NetworkIcon />
          <DisplayPropertiesIcon />
          <TaskbarSystemClock className={isMobile ? 'text-[10px] leading-none' : ''} />
        </TaskbarNotificationArea>
      </>
    </TaskbarRoot>
  )
}
