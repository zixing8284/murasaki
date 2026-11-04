import { Button } from '@murasaki-io/react98'
import { useMemo, useRef, useState } from 'react'
import { useProcessActions, useProcesses, useProcessList } from '../../../contexts/process/hooks'
import { AppIcon } from '../../app-icon'

interface RunningTasksProps {
  isMobile?: boolean
}

export function RunningTasks({ isMobile = false }: RunningTasksProps): React.ReactElement {
  const windows = useProcessList()
  const { foregroundId, stackOrder } = useProcesses()
  const { handleTaskbarClick } = useProcessActions()
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const [selectedPid, setSelectedPid] = useState<string | null>(null)

  const orderedWindows = useMemo(() => {
    const windowsById = new Map(windows.map(win => [win.id, win]))
    return stackOrder
      .map(pid => windowsById.get(pid))
      .filter((win): win is (typeof windows)[number] => !!win)
  }, [stackOrder, windows])

  const selectedIndex = useMemo(() => {
    if (orderedWindows.length === 0)
      return -1
    if (selectedPid) {
      const index = orderedWindows.findIndex(win => win.id === selectedPid)
      if (index >= 0)
        return index
    }
    if (foregroundId) {
      const fgIndex = orderedWindows.findIndex(win => win.id === foregroundId)
      if (fgIndex >= 0)
        return fgIndex
    }
    return 0
  }, [orderedWindows, selectedPid, foregroundId])

  const selectedWindow = selectedIndex >= 0
    ? orderedWindows[selectedIndex]
    : null
  const selectedLabel = selectedIndex >= 0
    ? `${selectedIndex + 1}/${orderedWindows.length}`
    : `0/0`

  const stepSelection = (direction: -1 | 1): void => {
    if (orderedWindows.length <= 1)
      return

    const baseIndex = selectedIndex >= 0
      ? selectedIndex
      : 0
    const nextIndex = (baseIndex + direction + orderedWindows.length) % orderedWindows.length
    const target = orderedWindows[nextIndex]
    if (!target)
      return
    setSelectedPid(target.id)
  }

  if (isMobile) {
    return (
      <div className="flex flex-1 min-w-0 items-center gap-1">
        <button
          type="button"
          aria-label="Step to previous app"
          className="h-6 w-6 shrink-0 border border-(--button-shadow) bg-(--button-face) text-[11px] shadow-(--shadow-raised) active:shadow-(--shadow-sunken) disabled:opacity-40"
          onClick={() => stepSelection(-1)}
          disabled={orderedWindows.length <= 1}
        >
          ‹
        </button>

        <div className="min-w-8 text-center text-[10px] text-(--gray-text) tabular-nums">
          {selectedLabel}
        </div>

        <div
          className="flex flex-1 min-w-0 items-center"
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
            <div className="flex items-center px-2 text-[10px] text-(--gray-text) opacity-70">Open apps</div>
          )}
          {selectedWindow && (
            <Button
              active={foregroundId === selectedWindow.id && !selectedWindow.minimized}
              onClick={() => {
                handleTaskbarClick(selectedWindow.id)
              }}
              className={[
                'h-7 w-full min-w-0 flex items-center gap-1.5 text-left px-2! rounded-none',
                selectedWindow.minimized ? 'opacity-70' : '',
                'bg-(--button-face)',
              ].join(' ')}
            >
              <AppIcon appId={selectedWindow.appId} size="sm" />
              <span
                className={`truncate text-[11px] ${foregroundId === selectedWindow.id && !selectedWindow.minimized
                  ? ''
                  : 'opacity-80'}`}
              >
                {selectedWindow.title}
              </span>
            </Button>
          )}
        </div>

        <button
          type="button"
          aria-label="Step to next app"
          className="h-6 w-6 shrink-0 border border-(--button-shadow) bg-(--button-face) text-[11px] shadow-(--shadow-raised) active:shadow-(--shadow-sunken) disabled:opacity-40"
          onClick={() => stepSelection(1)}
          disabled={orderedWindows.length <= 1}
        >
          ›
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden gap-0.5 px-0.5">
      {windows.map((win) => {
        const minimized = !!win.minimized
        const isActive = foregroundId === win.id && !minimized
        return (
          <Button
            key={win.id}
            active={isActive}
            onClick={() => handleTaskbarClick(win.id)}
            className={`max-w-40 min-w-10 w-full flex items-center gap-1 text-left px-1! truncate h-5.5! min-h-0! ${minimized ? 'opacity-60' : ''}`}
          >
            <AppIcon appId={win.appId} size="sm" />
            <span className={`truncate text-[11px] ${isActive ? '' : 'opacity-70'}`}>{win.title}</span>
          </Button>
        )
      })}
    </div>
  )
}
