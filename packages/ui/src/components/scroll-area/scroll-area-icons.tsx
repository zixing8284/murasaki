/**
 * Inline SVG arrow icons for scrollbar buttons.
 * Uses `currentColor` fill so the arrow color follows the parent's `color`.
 * Paths match the win98-scrollbar.js arrow definitions.
 * `shape-rendering="crispEdges"` ensures pixel-perfect rendering.
 */

const ARROW_PATHS = {
  up: 'M8,6h-1v1h-1v1h-1v1h-1v1h7v-1h-1v-1h-1v-1h-1v-1Z',
  down: 'M11,6h-7v1h1v1h1v1h1v1h1v-1h1v-1h1v-1h1v-1Z',
  left: 'M9,4h-1v1h-1v1h-1v1h-1v1h1v1h1v1h1v1h1v-7Z',
  right: 'M7,4h-1v7h1v-1h1v-1h1v-1h1v-1h-1v-1h-1v-1h-1v-1Z',
} as const

export type ArrowDirection = keyof typeof ARROW_PATHS

export function ScrollbarArrow({
  direction,
  ...props
}: React.SVGProps<SVGSVGElement> & { direction: ArrowDirection }): React.ReactElement {
  const isVertical = direction === 'up' || direction === 'down'
  const h = isVertical ? 17 : 16
  return (
    <svg
      fill="none"
      height={h}
      shapeRendering="crispEdges"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        display: 'block',
        overflow: 'visible',
      }}
      viewBox={`0 0 16 ${h}`}
      width={16}
      {...props}
    >
      <path d={ARROW_PATHS[direction]} fill="currentColor" />
    </svg>
  )
}
