import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '../../lib/utils'

import { ExpandArrowIcon } from './taskbar-icons'

export interface TaskbarQuickLaunchIcon {
  src: string
  alt: string
  title: string
  onClick?: () => void
}

export interface TaskbarQuickLaunchProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  icons: TaskbarQuickLaunchIcon[]
  defaultVisibleCount?: number
  visibleCount?: number
  onVisibleCountChange?: (visibleCount: number) => void
  iconStepWidth?: number
}

const ICON_STEP_WIDTH_DEFAULT = 24
const DEFAULT_VISIBLE_COUNT_DEFAULT = 2

function clampVisibleCount(value: number, max: number): number {
  if (!Number.isFinite(value))
    return 0
  return Math.max(0, Math.min(Math.round(value), max))
}

function ExpandArrowButton({ onClick }: { onClick: () => void }): React.ReactElement {
  return (
    <button
      type="button"
      className="flex items-start justify-center w-3 h-5 cursor-pointer bg-transparent border-none p-0 hover:bg-(--button-face) text-(--button-text)"
      onClick={onClick}
      title="Show all Quick Launch icons"
    >
      <ExpandArrowIcon />
    </button>
  )
}

function QuickLaunchDivider({
  isDragging,
  onMouseDown,
}: {
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
}): React.ReactElement {
  return (
    <div className="flex items-center mx-0.5 gap-px">
      <div className="h-5.5 w-px border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
      <div
        className={cn(
          'shadow-(--shadow-raised) h-5 cursor-ew-resize',
          isDragging
            ? 'w-1.5 bg-(--button-shadow) flex items-center justify-center'
            : 'w-1',
        )}
        onMouseDown={onMouseDown}
        title="Drag to resize Quick Launch"
      >
        {isDragging && (
          <div className="flex flex-col gap-0.5">
            <div className="w-px h-0.5 bg-(--button-shadow)" />
            <div className="w-px h-0.5 bg-(--button-shadow)" />
            <div className="w-px h-0.5 bg-(--button-shadow)" />
          </div>
        )}
      </div>
    </div>
  )
}

export function TaskbarQuickLaunch({
  icons,
  defaultVisibleCount = DEFAULT_VISIBLE_COUNT_DEFAULT,
  visibleCount,
  onVisibleCountChange,
  iconStepWidth = ICON_STEP_WIDTH_DEFAULT,
  className,
  ref,
  ...props
}: TaskbarQuickLaunchProps): React.ReactElement {
  const [uncontrolledVisibleCount, setUncontrolledVisibleCount] = useState(() => clampVisibleCount(defaultVisibleCount, icons.length))
  const [dragWidth, setDragWidth] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const quickLaunchRef = useRef<HTMLDivElement>(null)

  const maxQuickLaunchWidth = icons.length * iconStepWidth
  const minVisibleCount = Math.min(clampVisibleCount(defaultVisibleCount, icons.length), icons.length)
  const resolvedVisibleCount = clampVisibleCount(visibleCount ?? uncontrolledVisibleCount, icons.length)
  const quickLaunchWidth = dragWidth ?? resolvedVisibleCount * iconStepWidth

  const setVisibleIconCount = useCallback((nextCount: number) => {
    const clamped = clampVisibleCount(nextCount, icons.length)
    if (visibleCount === undefined) {
      setUncontrolledVisibleCount(clamped)
    }
    onVisibleCountChange?.(clamped)
  }, [icons.length, onVisibleCountChange, visibleCount])

  const visibleIconsCount = useMemo(() => {
    return Math.max(0, Math.floor(quickLaunchWidth / iconStepWidth))
  }, [quickLaunchWidth, iconStepWidth])

  const visibleIcons = useMemo(() => {
    return icons.slice(0, visibleIconsCount)
  }, [icons, visibleIconsCount])

  const hasHiddenIcons = visibleIconsCount < icons.length

  const handleExpandQuickLaunch = useCallback(() => {
    setDragWidth(null)
    setVisibleIconCount(icons.length)
  }, [icons.length, setVisibleIconCount])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging)
      return

    const handleMouseMove = (e: MouseEvent): void => {
      if (!quickLaunchRef.current)
        return

      const quickLaunchRect = quickLaunchRef.current.getBoundingClientRect()
      const newWidth = e.clientX - quickLaunchRect.left

      const snappedWidth = Math.round(newWidth / iconStepWidth) * iconStepWidth

      const elasticMax = maxQuickLaunchWidth + iconStepWidth
      const minQuickLaunchWidth = iconStepWidth * minVisibleCount
      const clampedWidth = Math.max(minQuickLaunchWidth, Math.min(snappedWidth, elasticMax))

      setDragWidth(clampedWidth)
      setVisibleIconCount(Math.min(Math.floor(clampedWidth / iconStepWidth), icons.length))
    }

    const handleMouseUp = (): void => {
      setDragWidth(null)
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [icons.length, isDragging, maxQuickLaunchWidth, iconStepWidth, minVisibleCount, setVisibleIconCount])

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'ew-resize'
    }
    else {
      document.body.style.cursor = ''
    }

    return () => {
      document.body.style.cursor = ''
    }
  }, [isDragging])

  return (
    <div ref={ref} className={cn('contents', className)} {...props}>
      {/* Quick Launch Icons */}
      <div
        ref={quickLaunchRef}
        className="flex flex-row items-center overflow-hidden"
        style={{ width: quickLaunchWidth, minWidth: 0 }}
      >
        {visibleIcons.map(icon => (
          <button
            key={icon.src}
            type="button"
            title={icon.title}
            onClick={icon.onClick}
            className="mx-0.5 p-0.5 cursor-pointer bg-transparent border-none hover:shadow-(--shadow-raised-outer) active:shadow-(--shadow-sunken-outer)"
          >
            <img
              src={icon.src}
              alt={icon.alt}
              draggable={false}
              className="block"
              style={{ imageRendering: 'pixelated' }}
            />
          </button>
        ))}
      </div>

      {/* Expand Arrow - shown when there are hidden icons */}
      {hasHiddenIcons && (
        <ExpandArrowButton onClick={handleExpandQuickLaunch} />
      )}

      {/* Draggable Divider */}
      <QuickLaunchDivider isDragging={isDragging} onMouseDown={handleMouseDown} />
    </div>
  )
}
