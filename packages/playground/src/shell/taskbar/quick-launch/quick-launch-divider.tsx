import { useRef } from 'react'

interface QuickLaunchDividerProps {
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

export function QuickLaunchDivider({ isDragging, onMouseDown }: QuickLaunchDividerProps): React.ReactElement {
  const dividerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex items-center mx-0.5 gap-px">
      <div className="h-5.5 w-px border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
      <div
        ref={dividerRef}
        className={`shadow-raised h-5 cursor-ew-resize ${
          isDragging
            ? 'w-1.5 bg-(--button-shadow) flex items-center justify-center'
            : 'w-1'
        }`}
        onMouseDown={onMouseDown}
        title="Drag to resize Quick Launch"
      >
        {/* Grip dots pattern - only visible when dragging */}
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
