import { Button } from '#/index'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface QuickLaunchIcon {
  src: string
  alt: string
  title: string
  onClick?: () => void
}

interface TaskbarProps {
  showStartMenu: boolean
  onStartMenuToggle: () => void
  time: string
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

export function Taskbar({ showStartMenu, onStartMenuToggle, time }: TaskbarProps): React.ReactElement {
  const [quickLaunchWidth, setQuickLaunchWidth] = useState(() => {
    // Default to showing 2 icons
    return ICON_STEP_WIDTH * 2
  })
  const [isDragging, setIsDragging] = useState(false)
  const dividerRef = useRef<HTMLDivElement>(null)
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
      const clampedWidth = Math.max(0, Math.min(snappedWidth, elasticMax))

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
    <footer className="flex flex-row items-center bg-[silver] p-0.75 shadow-[inset_-1px_-1px_#000,inset_1px_1px_#d4d0c8,inset_-2px_-2px_#808080,inset_2px_2px_#fff] z-2 overflow-hidden mt-auto select-none">
      {/* Start Button */}
      <div>
        <Button
          active={showStartMenu}
          onClick={onStartMenuToggle}
        >
          Hello
        </Button>
      </div>

      {/* Divider (static) */}
      <div className="flex items-center mx-0.5 gap-px">
        <div className="h-5.5 w-px border-l border-l-[#808080] border-r border-r-white shadow-[1px_0_0_0_rgba(255,255,255,0.3)]" />
        <div className="shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] h-5 w-1" />
      </div>

      {/* Quick Launcher */}
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
        <button
          type="button"
          className="flex items-center justify-center w-3 h-5 cursor-pointer bg-transparent border-none p-0 hover:bg-[#d4d0c8] active:bg-[#a0a0a0]"
          onClick={handleExpandQuickLaunch}
          title="Show all Quick Launch icons"
          style={{ imageRendering: 'pixelated' }}
        >
          <svg
            width="6"
            height="8"
            viewBox="0 0 7 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ imageRendering: 'pixelated' }}
          >
            {/* First arrow >> pixel style */}
            <rect x="0" y="0" width="1" height="1" fill="#000" />
            <rect x="1" y="1" width="1" height="1" fill="#000" />
            <rect x="2" y="2" width="1" height="1" fill="#000" />
            <rect x="3" y="3" width="1" height="1" fill="#000" />
            <rect x="4" y="4" width="1" height="1" fill="#000" />
            <rect x="3" y="5" width="1" height="1" fill="#000" />
            <rect x="2" y="6" width="1" height="1" fill="#000" />
            <rect x="1" y="7" width="1" height="1" fill="#000" />
            <rect x="0" y="8" width="1" height="1" fill="#000" />
            {/* Second arrow */}
            <rect x="3" y="0" width="1" height="1" fill="#000" />
            <rect x="4" y="1" width="1" height="1" fill="#000" />
            <rect x="5" y="2" width="1" height="1" fill="#000" />
            <rect x="6" y="3" width="1" height="1" fill="#000" />
            <rect x="6" y="5" width="1" height="1" fill="#000" />
            <rect x="5" y="6" width="1" height="1" fill="#000" />
            <rect x="4" y="7" width="1" height="1" fill="#000" />
            <rect x="3" y="8" width="1" height="1" fill="#000" />
          </svg>
        </button>
      )}

      {/* Draggable Divider */}
      <div className="flex items-center mx-0.5 gap-px">
        <div className="h-5.5 w-px border-l border-l-[#808080] border-r border-r-white shadow-[1px_0_0_0_rgba(255,255,255,0.3)]" />
        <div
          ref={dividerRef}
          className={`shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] h-5 cursor-ew-resize ${
            isDragging
              ? 'w-1.5 bg-[#a0a0a0] flex items-center justify-center'
              : 'w-1'
          }`}
          onMouseDown={handleMouseDown}
          title="Drag to resize Quick Launch"
        >
          {/* Grip dots pattern - only visible when dragging */}
          {isDragging && (
            <div className="flex flex-col gap-0.5">
              <div className="w-px h-0.5 bg-[#808080]" />
              <div className="w-px h-0.5 bg-[#808080]" />
              <div className="w-px h-0.5 bg-[#808080]" />
            </div>
          )}
        </div>
      </div>

      {/* Running Tasks */}
      <div className="flex flex-1 overflow-hidden">
        {/* Task buttons would go here */}
      </div>

      {/* Divider */}
      <div className="flex items-center mx-0.5 gap-px">
        <div className="h-5.5 w-px border-l border-l-[#808080] border-r border-r-white shadow-[1px_0_0_0_rgba(255,255,255,0.3)]" />
      </div>

      {/* System Tray */}
      <div className="h-5.5 px-0.5 flex flex-row items-center border-l border-l-[#7b7b7b] border-t border-t-[#7b7b7b] border-r border-r-white border-b border-b-white mt-px pointer-events-none truncate">
        <img
          className="mx-px"
          src="/img/network.png"
          alt="network"
        />
        <img
          className="mx-px"
          src="/img/computer.png"
          alt="computer"
        />
        <span className="mx-1 antialiased">{time}</span>
      </div>
    </footer>
  )
}
