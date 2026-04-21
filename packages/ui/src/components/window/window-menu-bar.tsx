import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'
import * as React from 'react'

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
 * Pure presentational primitive. It does not know about window active/inactive
 * state. Activation-related interaction policy (for example, "first click on
 * an inactive window only activates the window and does not fire menu items")
 * belongs to the window shell in the consumer application.
 */
export function WindowMenuBar({
  className,
  children,
  ref,
  ...props
}: WindowMenuBarProps): React.ReactElement {
  return (
    <div
      ref={ref}
      role="menubar"
      className={cn(menuBarVariants(), className)}
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
