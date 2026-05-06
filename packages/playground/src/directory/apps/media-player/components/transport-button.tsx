import type { ComponentProps, JSX, ReactNode } from 'react'

interface TransportButtonProps extends ComponentProps<'button'> {
  children: ReactNode
  active?: boolean
}

export function TransportButton({
  children,
  disabled,
  active,
  className,
  ...buttonProps
}: TransportButtonProps): JSX.Element {
  const buttonClassName = [
    'min-w-6 h-5.5 flex items-center justify-center bg-(--button-face) shadow-(--shadow-raised) active:not-disabled:shadow-(--shadow-sunken) active:not-disabled:*:translate-x-px active:not-disabled:*:translate-y-px disabled:opacity-40 border-none box-border px-0.5',
    active ? 'shadow-(--shadow-sunken) bg-[url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAG0lEQVQYV2M8cODAf3t7ewbG/////z948CADAFuqCj64BtLKAAAAAElFTkSuQmCC")]' : null,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={buttonClassName}
      disabled={disabled}
      aria-pressed={active}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
