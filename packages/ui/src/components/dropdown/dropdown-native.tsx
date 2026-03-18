import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import * as React from 'react'

import { ButtonDownIcon } from './dropdown-icons'

const selectVariants = cva([
  // Reset
  'appearance-none',
  'border-none',
  'rounded-none',
  // Sizing
  'box-border',
  'h-[21px]',
  'w-full',
  'py-[3px]',
  'pl-1',
  'pr-[18px]',
  // Colors
  'bg-(--button-hilight)',
  'text-(--window-text)',
  // Border effect
  'shadow-border-field',
  // Focus state
  'focus:outline-none',
  'focus:text-(--button-hilight)',
  'focus:bg-(--menu-hilight)',
  // Disabled state
  'disabled:bg-(--button-face)',
  'disabled:text-(--gray-text)',
  'disabled:cursor-not-allowed',
])

const selectWrapperVariants = cva([
  'relative',
  'inline-block',
])

const labelVariants = cva(['inline-block', 'mr-2', 'leading-[21px]'])

interface DropdownNativeProps
  extends React.ComponentProps<'select'>,
  VariantProps<typeof selectVariants> {
  /**
   * Optional label text for accessibility.
   * When provided, renders a <label> element and uses this as the select's id.
   */
  label?: string
  /**
   * Additional className for the label element.
   */
  labelClassName?: string
  /**
   * The name attribute for the select element.
   * Used as the key when form data is submitted.
   */
  name: string
}

/**
 * A Windows 98 styled native dropdown/select component.
 * Uses the browser's native select element for the dropdown list.
 * Supports forwarding ref to the internal select element.
 */
export function DropdownNative({
  children,
  className,
  id,
  label,
  labelClassName,
  name,
  ref,
  ...props
}: {
  ref?: React.RefObject<HTMLSelectElement | null>
} & DropdownNativeProps): React.ReactElement {
  const generatedId = React.useId()
  const selectId = id ?? (label ? generatedId : undefined)

  const selectElement = (
    <div className={cn(selectWrapperVariants())}>
      <select
        className={cn(selectVariants({ className }))}
        id={selectId}
        name={name}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ButtonDownIcon className="absolute right-[2px] top-[2px] pointer-events-none" />
    </div>
  )

  if (label) {
    return (
      <>
        <label
          className={cn(labelVariants(), labelClassName)}
          htmlFor={selectId}
        >
          {label}
        </label>
        {selectElement}
      </>
    )
  }

  return selectElement
}
