import type { ReactNode } from 'react'

/**
 * Shared Windows 98 icon tile used by the desktop and the Explorer content
 * pane so both obey the same rules:
 *
 * - Only the icon and label are pointer targets. The interactive parent must
 *   set `pointer-events-none`; clicks beside the glyph then fall through to the
 *   surface behind (desktop / content pane) and deselect.
 * - Long labels truncate with an ellipsis; the selected tile shows the full
 *   label (it wraps to as many lines as needed).
 * - The selected icon is tinted and the label gets the highlight + dotted focus
 *   ring, matching classic Explorer selection.
 *
 * The unselected label colour is inherited, so the caller sets it for its
 * surface (`--desktop-text` on the desktop, `--window-text` in a window).
 */

const LABEL_MAX_CHARS = 20

function truncateLabel(label: string, selected: boolean): string {
  if (selected || label.length <= LABEL_MAX_CHARS)
    return label
  return `${label.slice(0, LABEL_MAX_CHARS - 1).trimEnd()}…`
}

// Approximates the Win98 selected-icon blue blend without a second asset.
const SELECTED_ICON_FILTER = 'brightness-50 sepia hue-rotate-180 saturate-200'

export interface IconTileProps {
  /** Rendered icon (an `<img>` or icon component), 32px for tiles, 16px for rows. */
  icon: ReactNode
  label: string
  selected: boolean
  /**
   * `tile` = icon above a centered, wrapping label (desktop, Large Icons).
   * `row` = icon beside a single-line truncated label (Small Icons, List).
   */
  variant?: 'tile' | 'row'
  /** Extra classes on the tile container (e.g. drag opacity). */
  className?: string
}

export function IconTile({ icon, label, selected, variant = 'tile', className }: IconTileProps): React.ReactElement {
  const tile = variant === 'tile'
  const container = tile
    ? 'flex w-full flex-col items-center gap-0.5'
    : 'flex w-full min-w-0 items-center gap-1'
  const labelLayout = tile
    ? 'max-w-18 text-center leading-[1.2] wrap-break-word'
    : 'min-w-0 truncate'
  const labelState = selected
    ? 'bg-(--hilight) text-(--hilight-text) outline-dotted outline-1 outline-(--hilight-text)'
    : ''

  return (
    <div className={`${container}${className ? ` ${className}` : ''}`}>
      <span className={`pointer-events-auto shrink-0${selected ? ` ${SELECTED_ICON_FILTER}` : ''}`}>
        {icon}
      </span>
      <span
        className={`pointer-events-auto my-px px-0.5 py-px ${labelLayout} ${labelState}`}
        title={label}
      >
        {truncateLabel(label, selected)}
      </span>
    </div>
  )
}
