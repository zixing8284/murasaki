import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useWindowContext } from './window-context'
import { CloseIcon, HelpIcon, MaximizeIcon, MinimizeIcon, RestoreIcon } from './window-icons'

const buttonVariants = cva([
  'w-4',
  'h-3.5',
  'inline-flex',
  'items-center',
  'justify-center',
  'relative',
  'bg-(--button-face)',
  'text-(--button-text)',
  'shadow-raised',
  'active:shadow-sunken',
  'disabled:pointer-events-none',
  'disabled:cursor-not-allowed',
  'disabled:shadow-raised',
  'p-0',
  'border-none',
])

/** Container for title bar buttons */
export interface WindowButtonsProps extends React.ComponentProps<'div'> {}

export function WindowButtons({
  children,
  className,
  ...props
}: WindowButtonsProps): React.ReactElement {
  return (
    <div className={cn('flex gap-0.5', className)} {...props}>
      {children}
    </div>
  )
}

/** Close button */
export interface WindowCloseButtonProps extends React.ComponentProps<'button'> {}

export function WindowCloseButton({
  className,
  ...props
}: WindowCloseButtonProps): React.ReactElement {
  return (
    <button
      aria-label="Close"
      className={cn(buttonVariants(), className)}
      type="button"
      {...props}
    >
      <CloseIcon />
    </button>
  )
}

/** Minimize button */
export interface WindowMinimizeButtonProps extends React.ComponentProps<'button'> {}

export function WindowMinimizeButton({
  className,
  ...props
}: WindowMinimizeButtonProps): React.ReactElement {
  return (
    <button
      aria-label="Minimize"
      className={cn(buttonVariants(), className)}
      type="button"
      {...props}
    >
      <MinimizeIcon className="absolute bottom-[3px] left-[4px]" />
    </button>
  )
}

/** Maximize / Restore button. Toggles maximized state via WindowContext internally; `onClick` is forwarded as a notification after the state change. */
export interface WindowMaximizeButtonProps extends React.ComponentProps<'button'> {
  /** Disable the maximize button */
  disabled?: boolean
}

export function WindowMaximizeButton({
  className,
  disabled,
  onClick,
  ...props
}: WindowMaximizeButtonProps): React.ReactElement {
  const { state, actions } = useWindowContext()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    actions.toggleMaximized()
    onClick?.(e)
  }

  return (
    <button
      aria-label={state.maximized ? 'Restore' : 'Maximize'}
      className={cn(buttonVariants(), className)}
      disabled={disabled}
      onClick={handleClick}
      type="button"
      {...props}
    >
      {disabled
        ? <MaximizeIcon disabled />
        : state.maximized
          ? <RestoreIcon />
          : <MaximizeIcon />}
    </button>
  )
}

/** Help button */
export interface WindowHelpButtonProps extends React.ComponentProps<'button'> {}

export function WindowHelpButton({
  className,
  ...props
}: WindowHelpButtonProps): React.ReactElement {
  return (
    <button
      aria-label="Help"
      className={cn(buttonVariants(), className)}
      type="button"
      {...props}
    >
      <HelpIcon />
    </button>
  )
}
