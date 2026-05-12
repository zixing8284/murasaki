'use client'

import type { ReactNode, Ref } from 'react'

interface EdgeTestSlot {
  id: string
  label: string
  className: string
}

interface EdgeTestStageProps {
  height?: number
  containerRef?: Ref<HTMLDivElement>
  renderSlot: (slot: Pick<EdgeTestSlot, 'id' | 'label'>) => ReactNode
}

const SLOTS: EdgeTestSlot[] = [
  { id: 'top-left', label: 'TL', className: 'left-2 top-2' },
  { id: 'top', label: 'T', className: 'left-1/2 top-2 -translate-x-1/2' },
  { id: 'top-right', label: 'TR', className: 'right-2 top-2' },
  { id: 'left', label: 'L', className: 'left-2 top-1/2 -translate-y-1/2' },
  { id: 'center', label: 'C', className: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' },
  { id: 'right', label: 'R', className: 'right-2 top-1/2 -translate-y-1/2' },
  { id: 'bottom-left', label: 'BL', className: 'bottom-2 left-2' },
  { id: 'bottom', label: 'B', className: 'bottom-2 left-1/2 -translate-x-1/2' },
  { id: 'bottom-right', label: 'BR', className: 'bottom-2 right-2' },
]

export function EdgeTestStage({
  height = 360,
  containerRef,
  renderSlot,
}: EdgeTestStageProps): React.ReactElement {
  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[680px] overflow-visible bg-(--window) shadow-(--shadow-border-field)"
      style={{ minHeight: height }}
    >
      {SLOTS.map(slot => (
        <div key={slot.id} className={`absolute ${slot.className}`}>
          {renderSlot({ id: slot.id, label: slot.label })}
        </div>
      ))}
    </div>
  )
}
