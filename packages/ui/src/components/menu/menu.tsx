import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'
import * as React from 'react'

// ─── Menu ─────────────────────────────────────────────────────────────────────

const menuVariants = cva([
  'bg-(--menu)',
  'shadow-raised',
  'flex',
  'flex-col',
  'items-stretch',
  'p-0.5',
  'list-none',
  'm-0',
])

export interface MenuProps extends React.ComponentProps<'menu'> {}

export function Menu({ className, ref, ...props }: MenuProps): React.ReactElement {
  return (
    <menu
      ref={ref}
      role="menu"
      className={cn(menuVariants(), className)}
      {...props}
    />
  )
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────

const menuItemVariants = cva(
  [
    'flex',
    'flex-row',
    'items-center',
    'gap-2',
    'p-[4px_6px]',
    'm-[1px_0]',
    'list-none',
  ],
  {
    variants: {
      disabled: {
        true: ['text-(--gray-text)', 'cursor-default'],
        false: ['cursor-pointer', 'hover:bg-(--hilight)', 'hover:text-(--hilight-text)'],
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
)

export interface MenuItemProps extends React.ComponentProps<'li'> {
  icon?: React.ReactNode
  disabled?: boolean
}

export function MenuItem({
  className,
  icon,
  disabled = false,
  children,
  ref,
  ...props
}: MenuItemProps): React.ReactElement {
  return (
    <li
      ref={ref}
      role="menuitem"
      aria-disabled={disabled || undefined}
      className={cn(menuItemVariants({ disabled }), className)}
      {...props}
    >
      {icon && <span className="w-4 h-4 shrink-0 flex-center">{icon}</span>}
      <span className="flex-1">{children}</span>
    </li>
  )
}

// ─── MenuSeparator ────────────────────────────────────────────────────────────

const menuSeparatorVariants = cva([
  'border-b',
  'border-(--button-hilight)',
  'border-t',
  'border-t-(--button-shadow)',
  'm-0.5',
  'list-none',
])

export interface MenuSeparatorProps extends React.ComponentProps<'li'> {}

export function MenuSeparator({ className, ref, ...props }: MenuSeparatorProps): React.ReactElement {
  return (
    <li
      ref={ref}
      role="separator"
      className={cn(menuSeparatorVariants(), className)}
      {...props}
    />
  )
}
