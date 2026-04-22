import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '#/lib/utils'

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
  iconStepWidth?: number
}

const ICON_STEP_WIDTH_DEFAULT = 24
const DEFAULT_VISIBLE_COUNT_DEFAULT = 2

function ExpandArrowButton({ onClick }: { onClick: () => void }): React.ReactElement {
  return (
    <button
      type="button"
      className="flex items-start justify-center w-3 h-5 cursor-pointer bg-transparent border-none p-0 hover:bg-(--button-face) active:bg-(--button-shadow) text-(--button-text)"
      onClick={onClick}
      title="Show all Quick Launch icons"
      style={{ imageRendering: 'pixelated' }}
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
  iconStepWidth = ICON_STEP_WIDTH_DEFAULT,
  className,
  ref,
  ...props
}: TaskbarQuickLaunchProps): React.ReactElement {
  const [quickLaunchWidth, setQuickLaunchWidth] = useState(() => {
    return iconStepWidth * defaultVisibleCount
  })
  const [isDragging, setIsDragging] = useState(false)
  const quickLaunchRef = useRef<HTMLDivElement>(null)

  const maxQuickLaunchWidth = icons.length * iconStepWidth

  const visibleIconsCount = useMemo(() => {
    return Math.max(0, Math.floor(quickLaunchWidth / iconStepWidth))
  }, [quickLaunchWidth, iconStepWidth])

  const visibleIcons = useMemo(() => {
    return icons.slice(0, visibleIconsCount)
  }, [icons, visibleIconsCount])

  const hasHiddenIcons = visibleIconsCount < icons.length

  const handleExpandQuickLaunch = useCallback(() => {
    setQuickLaunchWidth(maxQuickLaunchWidth)
  }, [maxQuickLaunchWidth])

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
      const minQuickLaunchWidth = iconStepWidth * defaultVisibleCount
      const clampedWidth = Math.max(minQuickLaunchWidth, Math.min(snappedWidth, elasticMax))

      setQuickLaunchWidth(clampedWidth)
    }

    const handleMouseUp = (): void => {
      setQuickLaunchWidth(prev => Math.min(prev, maxQuickLaunchWidth))
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, maxQuickLaunchWidth, iconStepWidth, defaultVisibleCount])

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
        className="flex flex-row items-center overflow-hidden [&>img]:my-0 [&>img]:mx-0.5 [&>img]:cursor-pointer [&>img]:p-0.5 [&>img]:hover:shadow-[-1px_-1px_var(--button-light),1px_1px_var(--button-shadow)] [&>img]:active:shadow-[1px_1px_var(--button-light),-1px_-1px_var(--button-shadow)]"
        style={{ width: quickLaunchWidth, minWidth: 0 }}
      >
        {visibleIcons.map(icon => (
          <img
            key={icon.src}
            src={icon.src}
            alt={icon.alt}
            title={icon.title}
            onClick={icon.onClick}
            draggable={false}
          />
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
