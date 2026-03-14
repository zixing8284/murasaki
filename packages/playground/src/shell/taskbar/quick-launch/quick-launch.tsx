import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ExpandArrowButton } from './expand-arrow-button'
import { QuickLaunchDivider } from './quick-launch-divider'

interface QuickLaunchIcon {
  src: string
  alt: string
  title: string
  onClick?: () => void
}

// Quick Launch icons configuration
const QUICK_LAUNCH_ICONS: QuickLaunchIcon[] = [
  { src: '/img/desktop.png', alt: 'Show Desktop', title: 'Show Desktop' },
  { src: '/img/express.png', alt: 'Email Me', title: 'Outlook Express' },
  { src: '/img/world.png', alt: 'Internet', title: 'Internet Explorer' },
  { src: '/img/computer.png', alt: 'Computer', title: 'My Computer' },
]

// Icon width including margin (icon ~16px + margins ~4px)
const ICON_STEP_WIDTH = 24
const DEFAULT_VISIBLE_COUNT = 2

export function QuickLaunch(): React.ReactElement {
  const [quickLaunchWidth, setQuickLaunchWidth] = useState(() => {
    return ICON_STEP_WIDTH * DEFAULT_VISIBLE_COUNT
  })
  const [isDragging, setIsDragging] = useState(false)
  const quickLaunchRef = useRef<HTMLDivElement>(null)

  // Calculate max width based on number of icons
  const maxQuickLaunchWidth = QUICK_LAUNCH_ICONS.length * ICON_STEP_WIDTH

  // Calculate visible icons count based on current width
  const visibleIconsCount = useMemo(() => {
    return Math.max(0, Math.floor(quickLaunchWidth / ICON_STEP_WIDTH))
  }, [quickLaunchWidth])

  // Get visible icons
  const visibleIcons = useMemo(() => {
    return QUICK_LAUNCH_ICONS.slice(0, visibleIconsCount)
  }, [visibleIconsCount])

  // Check if there are hidden icons
  const hasHiddenIcons = visibleIconsCount < QUICK_LAUNCH_ICONS.length

  // Expand to show all icons
  const handleExpandQuickLaunch = useCallback(() => {
    setQuickLaunchWidth(maxQuickLaunchWidth)
  }, [maxQuickLaunchWidth])

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  // Handle drag move
  useEffect(() => {
    if (!isDragging)
      return

    const handleMouseMove = (e: MouseEvent): void => {
      if (!quickLaunchRef.current)
        return

      const quickLaunchRect = quickLaunchRef.current.getBoundingClientRect()
      const newWidth = e.clientX - quickLaunchRect.left

      // Snap to icon steps
      const snappedWidth = Math.round(newWidth / ICON_STEP_WIDTH) * ICON_STEP_WIDTH

      // Allow dragging beyond max width by a small amount (elastic effect)
      const elasticMax = maxQuickLaunchWidth + ICON_STEP_WIDTH
      const minQuickLaunchWidth = ICON_STEP_WIDTH * DEFAULT_VISIBLE_COUNT
      const clampedWidth = Math.max(minQuickLaunchWidth, Math.min(snappedWidth, elasticMax))

      setQuickLaunchWidth(clampedWidth)
    }

    const handleMouseUp = (): void => {
      // Snap back to max width if exceeded
      setQuickLaunchWidth(prev => Math.min(prev, maxQuickLaunchWidth))
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, maxQuickLaunchWidth])

  // Change cursor during drag
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
    <>
      {/* Quick Launch Icons */}
      <div
        ref={quickLaunchRef}
        className="flex flex-row items-center overflow-hidden [&>img]:my-0 [&>img]:mx-0.5 [&>img]:cursor-pointer [&>img]:p-0.5 [&>img]:hover:shadow-[-1px_-1px_#dfdfdf,1px_1px_grey] [&>img]:active:shadow-[1px_1px_#dfdfdf,-1px_-1px_grey]"
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
    </>
  )
}
