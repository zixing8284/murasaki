import { Button } from '@murasaki-io/react98'
import { useRef } from 'react'
import { useProcessActions, useProcesses, useProcessList } from '../../../contexts/process/hooks'
import { AppIcon } from '../../app-icon'

interface RunningTasksProps {
  isMobile?: boolean
}

export function RunningTasks({ isMobile = false }: RunningTasksProps): React.ReactElement {
  const windows = useProcessList()
  const { foregroundId } = useProcesses()
  const { handleTaskbarClick } = useProcessActions()
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)

  const foregroundIndex = windows.findIndex(win => win.id === foregroundId)
  const selectedIndex = foregroundIndex >= 0
    ? foregroundIndex
    : windows.length > 0
      ? 0
      : -1

  const selectedWindow = selectedIndex >= 0
    ? windows[selectedIndex]
    : null
  const selectedLabel = selectedIndex >= 0
    ? `${selectedIndex + 1}/${windows.length}`
    : `0/0`

  const stepSelection = (direction: -1 | 1): void => {
    if (windows.length <= 1 || selectedIndex < 0)
      return

    const nextIndex = selectedIndex + direction
    if (nextIndex < 0 || nextIndex >= windows.length)
      return
    const target = windows[nextIndex]
    if (target)
      handleTaskbarClick(target.id)
  }

  if (isMobile) {
    return (
      <div className="flex flex-1 min-w-0 items-center gap-1">
        <Button
          iconOnly
          aria-label="Step to previous app"
          onClick={() => stepSelection(-1)}
          disabled={selectedIndex <= 0}
          className="size-5! min-h-5! shrink-0 text-[11px]"
        >
          ‹
        </Button>

        <div aria-live="polite" className="min-w-6 text-center text-(--button-text) tabular-nums">
          {selectedLabel}
        </div>

        <div
          className="flex flex-1 min-w-0 items-center justify-center"
          onTouchStart={(event) => {
            touchStartXRef.current = event.changedTouches[0]?.clientX ?? null
            touchStartYRef.current = event.changedTouches[0]?.clientY ?? null
          }}
          onTouchEnd={(event) => {
            const startX = touchStartXRef.current
            const startY = touchStartYRef.current
            const endX = event.changedTouches[0]?.clientX
            const endY = event.changedTouches[0]?.clientY
            touchStartXRef.current = null
            touchStartYRef.current = null
            if (startX == null || startY == null || endX == null || endY == null)
              return
            const delta = endX - startX
            const deltaY = endY - startY
            if (Math.abs(delta) < 40 || Math.abs(delta) < Math.abs(deltaY))
              return
            if (delta > 0)
              stepSelection(-1)
            else
              stepSelection(1)
          }}
        >
          {!selectedWindow && (
            <div className="flex items-center px-2 text-(--gray-text)">Open apps</div>
          )}
          {selectedWindow && (
            <Button
              active={foregroundId === selectedWindow.id && !selectedWindow.minimized}
              onClick={() => {
                handleTaskbarClick(selectedWindow.id)
              }}
              className={[
                'h-7 w-full max-w-[clamp(4.5rem,30vw,9rem)] min-w-0! flex items-center gap-1.5 text-left px-2! rounded-none',
              ].join(' ')}
            >
              <AppIcon appId={selectedWindow.appId} size="sm" />
              <span className="truncate whitespace-nowrap text-[11px]">
                {selectedWindow.title}
              </span>
            </Button>
          )}
        </div>

        <Button
          iconOnly
          aria-label="Step to next app"
          onClick={() => stepSelection(1)}
          disabled={selectedIndex < 0 || selectedIndex >= windows.length - 1}
          className="size-5! min-h-5! shrink-0 text-[11px]"
        >
          ›
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden gap-0.5 px-0.5">
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
            <span className="truncate text-[11px]">{win.title}</span>
          </Button>
        )
      })}
    </div>
  )
}
