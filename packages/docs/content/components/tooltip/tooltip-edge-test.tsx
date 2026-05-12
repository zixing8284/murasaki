'use client'

import { Button, Tooltip } from '@murasaki/react98'

const TOOLTIPS = [
  {
    id: 'top',
    label: 'Top',
    side: 'top' as const,
    text: 'Tooltip prefers the top edge and flips when space runs out.',
    style: { gridColumn: 2, gridRow: 1, justifySelf: 'center' },
  },
  {
    id: 'left',
    label: 'Left',
    side: 'left' as const,
    text: 'Tooltip prefers the left edge and repositions if needed.',
    style: { gridColumn: 1, gridRow: 2, justifySelf: 'start' },
  },
  {
    id: 'right',
    label: 'Right',
    side: 'right' as const,
    text: 'Tooltip prefers the right edge and stays within the viewport.',
    style: { gridColumn: 3, gridRow: 2, justifySelf: 'end' },
  },
  {
    id: 'bottom',
    label: 'Bottom',
    side: 'bottom' as const,
    text: 'Tooltip prefers the bottom edge and flips upward near the boundary.',
    style: { gridColumn: 2, gridRow: 3, justifySelf: 'center' },
  },
]

export function TooltipEdgeTestDemo(): React.ReactElement {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gap: 12,
        height: '100%',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
        minHeight: 0,
        padding: 12,
        width: '100%',
      }}
    >
      {TOOLTIPS.map(tooltip => (
        <div key={tooltip.id} style={tooltip.style}>
          <Tooltip text={tooltip.text} side={tooltip.side} delay={100}>
            <Button>{tooltip.label}</Button>
          </Tooltip>
        </div>
      ))}
    </div>
  )
}
