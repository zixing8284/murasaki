import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useWindowContext } from './window-context'

const buttonVariants = cva([
  'w-4',
  'h-3.5',
  'flex-center',
  'bg-btn-face',
  'shadow-raised',
  'active:shadow-sunken',
  'disabled:pointer-events-none',
  'disabled:cursor-not-allowed',
  'disabled:shadow-raised',
  'p-0',
  'border-none',
])

// Icon classes using custom utilities defined in globals.css
const buttonIcons = {
  close: 'bgi-icon-close',
  help: 'bgi-icon-help',
  maximize: 'bgi-icon-maximize',
  maximizeDisabled: 'bgi-icon-maximize-disabled',
  minimize: 'bgi-icon-minimize',
  restore: 'bgi-icon-restore',
}

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
      className={cn(buttonVariants(), buttonIcons.close, className)}
      type="button"
      {...props}
    />
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
      className={cn(buttonVariants(), buttonIcons.minimize, className)}
      type="button"
      {...props}
    />
  )
}

/** Maximize button */
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

  const icon = disabled
    ? buttonIcons.maximizeDisabled
    : state.maximized
      ? buttonIcons.restore
      : buttonIcons.maximize

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    actions.toggleMaximized()
    onClick?.(e)
  }

  return (
    <button
      aria-label={state.maximized ? 'Restore' : 'Maximize'}
      className={cn(buttonVariants(), icon, className)}
      disabled={disabled}
      onClick={handleClick}
      type="button"
      {...props}
    />
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
      className={cn(buttonVariants(), buttonIcons.help, className)}
      type="button"
      {...props}
    />
  )
}
