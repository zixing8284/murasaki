import { useRef } from 'react'

interface QuickLaunchDividerProps {
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

export function QuickLaunchDivider({ isDragging, onMouseDown }: QuickLaunchDividerProps): React.ReactElement {
  const dividerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex items-center mx-0.5 gap-px">
      <div className="h-5.5 w-px border-l border-l-[#808080] border-r border-r-white shadow-[1px_0_0_0_rgba(255,255,255,0.3)]" />
      <div
        ref={dividerRef}
        className={`shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] h-5 cursor-ew-resize ${
          isDragging
            ? 'w-1.5 bg-[#a0a0a0] flex items-center justify-center'
            : 'w-1'
        }`}
        onMouseDown={onMouseDown}
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
  )
}
