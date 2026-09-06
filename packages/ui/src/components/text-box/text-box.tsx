import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { useScrollbar } from '../../primitives/scrollbar/use-scrollbar'
import { Label } from '../label/label'

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

// Shared base styles for both input and textarea
const baseFieldStyles = [
  'appearance-none',
  'rounded-none',
  'bg-(--window)',
  'text-(--window-text)',
  'outline-none',
  'not-disabled:cursor-text',
  // Disabled & readonly states
  'disabled:bg-(--button-face)',
  'read-only:bg-(--button-face)',
  'read-only:text-(--gray-text)',
  'pl-2',
  'pr-1.5',
  'py-0.75',
]

const inputVariants = cva(
  [
    ...baseFieldStyles,
    'shadow-(--shadow-border-field)',
    'border-none',
    'leading-loose',
  ],
  {
    defaultVariants: {
      inputType: 'text',
    },
    variants: {
      inputType: {
        email: ['h-5.25'],
        number: ['h-5.5'],
        password: ['h-5.25'],
        search: ['h-5.25'],
        tel: ['h-5.25'],
        text: ['h-5.25'],
        url: ['h-5.25'],
      },
    },
  },
)

const textareaVariants = cva([
  ...baseFieldStyles,
  'resize-none',
  'overflow-auto',
  'w-full',
])

export interface TextBoxProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'type'>,
  VariantProps<typeof textBoxWrapperVariants> {
  /** Label content (alternative to label prop) */
  children?: React.ReactNode
  /** Label text (alternative to children) */
  label?: React.ReactNode
  /** Render as multiline textarea */
  multiline?: boolean
  /** Number of visible text rows (only for multiline) */
  rows?: number
  /** Callback fired with the next text value. */
  onValueChange?: (value: string) => void
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
  onValueChange,
  readOnly,
  rows,
  type = 'text',
  wrapperClassName,
  ...props
}: TextBoxProps): React.ReactElement {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  useScrollbar(textareaRef, { disabled: !multiline })

  // Label content: prefer children, fallback to label prop
  const labelContent = children ?? label

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onValueChange?.(event.target.value)
  }

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onValueChange?.(event.target.value)
  }

  const fieldElement = multiline
    ? (
        <div className={cn('relative bg-(--window) before:content-[\'\'] before:absolute before:inset-0 before:shadow-(--shadow-border-field) before:pointer-events-none before:z-1 p-0.5 size-full flex flex-col min-h-15', className)}>
          <div className="relative flex-1 flex flex-col overflow-hidden">
            <textarea
              ref={textareaRef}
              className={cn(textareaVariants(), 'flex-1')}
              data-disabled={disabled || undefined}
              data-read-only={readOnly || undefined}
              disabled={disabled}
              id={inputId}
              readOnly={readOnly}
              rows={rows}
              {...(props as React.ComponentProps<'textarea'>)}
              onChange={handleTextareaChange}
            />
          </div>
        </div>
      )
    : (
        <input
          className={cn(inputVariants({ className, inputType: type }))}
          data-disabled={disabled || undefined}
          data-read-only={readOnly || undefined}
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
          type={type}
          {...props}
          onChange={handleInputChange}
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
      <Label
        className="whitespace-nowrap"
        disabled={(disabled ?? readOnly) || undefined}
        htmlFor={inputId}
      >
        {labelContent}
      </Label>
      {fieldElement}
    </div>
  )
}
