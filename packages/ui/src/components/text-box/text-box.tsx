import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '../../lib/utils'

// Valid input types for TextBox
type TextBoxInputType
  = | 'email'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'url'

const textBoxWrapperVariants = cva(['flex'], {
  defaultVariants: {
    labelPosition: 'left',
  },
  variants: {
    labelPosition: {
      left: ['flex-row', 'items-center', 'gap-(--grouped-element-spacing)'],
      top: ['flex-col', 'gap-1'],
    },
  },
})

const labelVariants = cva([
  'text-(--button-text)',
  'select-none',
  'whitespace-nowrap',
])

// Shared base styles for both input and textarea
const baseFieldStyles = [
  'appearance-none',
  'rounded-none',
  'bg-(--window)',
  'text-(--window-text)',
  'outline-none',
  // Disabled & readonly states
  'disabled:bg-(--button-face)',
  'read-only:bg-(--button-face)',
  'read-only:text-(--gray-text)',
  'px-1',
  'py-[3px]',
]

const inputVariants = cva(
  [
    ...baseFieldStyles,
    'shadow-border-field',
    'border-none',
    'px-1',
    'leading-loose',
  ],
  {
    defaultVariants: {
      inputType: 'text',
    },
    variants: {
      inputType: {
        email: ['h-[21px]'],
        number: ['h-[22px]'],
        password: ['h-[21px]'],
        search: ['h-[21px]'],
        tel: ['h-[21px]'],
        text: ['h-[21px]'],
        url: ['h-[21px]'],
      },
    },
  },
)

const textareaVariants = cva([
  ...baseFieldStyles,
  'resize-y',
  'min-h-[60px]',
  'shadow-border-field',
  'overflow-auto',
])

interface TextBoxProps
  extends Omit<React.ComponentProps<'input'>, 'type'>,
  VariantProps<typeof textBoxWrapperVariants> {
  /** Label content (alternative to label prop) */
  children?: React.ReactNode
  /** Label text (alternative to children) */
  label?: React.ReactNode
  /** Render as multiline textarea */
  multiline?: boolean
  /** Number of visible text rows (only for multiline) */
  rows?: number
  /** Input type */
  type?: TextBoxInputType
  /** Additional class for wrapper */
  wrapperClassName?: string
}

export function TextBox({
  children,
  className,
  disabled,
  id,
  label,
  labelPosition = 'left',
  multiline = false,
  readOnly,
  rows,
  type = 'text',
  wrapperClassName,
  ...props
}: TextBoxProps): React.ReactElement {
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  // Label content: prefer children, fallback to label prop
  const labelContent = children ?? label

  const fieldElement = multiline
    ? (
        <textarea
          className={cn(textareaVariants({ className }))}
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
          rows={rows}
          {...(props as React.ComponentProps<'textarea'>)}
        />
      )
    : (
        <input
          className={cn(inputVariants({ className, inputType: type }))}
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
          type={type}
          {...props}
        />
      )

  // If no label, render input only
  if (!labelContent) {
    return fieldElement
  }

  return (
    <div
      className={cn(
        textBoxWrapperVariants({ className: wrapperClassName, labelPosition }),
      )}
    >
      <label
        className={cn(
          labelVariants(),
          (disabled ?? readOnly) && 'text-(--gray-text)',
        )}
        htmlFor={inputId}
      >
        {labelContent}
      </label>
      {fieldElement}
    </div>
  )
}
