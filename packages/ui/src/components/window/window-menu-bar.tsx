import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { useWindowContext } from './window-context'

// ─── WindowMenuBar ────────────────────────────────────────────────────────────

const menuBarVariants = cva([
  'h-4',
  'flex',
  'items-center',
  'gap-0',
  'px-px',
  'bg-(--menu-bar)',
  'text-(--menu-text)',
  'select-none',
])

export interface WindowMenuBarProps extends React.ComponentProps<'div'> {}

/**
 * Horizontal menu bar placed at the top of a window (e.g. File / Edit / View).
 *
 * Activation-aware behavior: when the host window is inactive, clicks inside
 * the menu bar are swallowed (capture-phase `click` and `mousedown` are
 * prevented and their propagation is stopped) so menu triggers do not react.
 * `pointerdown` is left untouched so it can still bubble up to `WindowFrame`
 * and bring the window to the foreground. A second click, on the now-active
 * window, performs the actual menu interaction.
 */
export function WindowMenuBar({
  className,
  onMouseDownCapture,
  onClickCapture,
  children,
  ref,
  ...props
}: WindowMenuBarProps): React.ReactElement {
  const { state } = useWindowContext()
  const inactive = !state.active

  const handleMouseDownCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (inactive) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onMouseDownCapture?.(e)
  }

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (inactive) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onClickCapture?.(e)
  }

  return (
    <div
      ref={ref}
      role="menubar"
      className={cn(menuBarVariants(), className)}
      onMouseDownCapture={handleMouseDownCapture}
      onClickCapture={handleClickCapture}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── WindowMenuBarItem ────────────────────────────────────────────────────────

const menuBarItemVariants = cva([
  'bg-transparent',
  'border-none',
  'px-1.5',
  'py-0.5',
  'text-(--menu-text)',
  'enabled:hover:bg-(--menu-hilight)',
  'enabled:hover:text-(--hilight-text)',
  'enabled:focus-visible:bg-(--menu-hilight)',
  'enabled:focus-visible:text-(--hilight-text)',
  'outline-none',
  'disabled:text-(--gray-text)',
])

export interface WindowMenuBarItemProps extends React.ComponentProps<'button'> {}

/**
 * A single trigger inside a `WindowMenuBar`. Renders as a flat button using
 * menu-bar theme tokens. Consumers can compose their own dropdown / menu
 * behavior via the standard `onClick`.
 */
export function WindowMenuBarItem({
  className,
  type = 'button',
  ref,
  ...props
}: WindowMenuBarItemProps): React.ReactElement {
  return (
    <button
      ref={ref}
      type={type}
      role="menuitem"
      className={cn(menuBarItemVariants(), className)}
      {...props}
    />
  )
}
