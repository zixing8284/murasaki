import type { SelectOption } from './use-select-state'

import { cva } from 'class-variance-authority'

import * as React from 'react'

import { useId, useMemo, useRef } from 'react'
import { cn } from '../../lib/utils'
import { useDismissable } from '../../primitives'
import { useScrollbar } from '../scroll-area/use-scrollbar'
import { ButtonDownActiveIcon, ButtonDownIcon } from './select-icons'
import { useSelectState } from './use-select-state'

// Trigger button variants - styled like SelectNative's select
const triggerVariants = cva([
  // Reset
  'appearance-none',
  'border-none',
  'rounded-none',
  // Sizing
  'box-border',
  'h-5.25',
  'w-full',
  'py-0.75',
  'pl-2',
  'pr-4.5',
  // Colors
  'bg-(--window)',
  'text-(--window-text)',
  'text-left',
  // Border effect (on pseudo-element to prevent child overlap)
  'before:content-[\'\']',
  'before:absolute',
  'before:inset-0',
  'before:shadow-(--shadow-border-field)',
  'before:pointer-events-none',
  'before:z-1',
  // Position context for arrow icon
  'relative',
  'group',
  // Focus state
  'focus:outline-none',
  // Disabled state
  'disabled:bg-(--button-face)',
  'disabled:text-(--gray-text)',
  'disabled:cursor-not-allowed',
  // Text overflow
  'overflow-hidden',
  'whitespace-nowrap',
  'text-ellipsis',
])

// Select menu wrapper (positioning context for scrollbar)
const menuWrapperVariants = cva([
  'absolute',
  'left-0',
  'right-px',
  'z-50',
  'overflow-hidden',
  'border',
  'border-(--button-shadow)',
  'bg-(--window)',
])

// Select menu
const menuVariants = cva([
  'w-full',
  'max-h-40',
  'overflow-y-auto',
  'box-border',
  'bg-(--window)',
  'list-none',
  'm-0',
  'p-0',
])

// Menu item
const menuItemVariants = cva(
  [
    'box-border',
    'w-full',
    'pl-2',
    'pr-1.5',
    'py-0.5',
    'cursor-pointer',
    'outline-none',
    'whitespace-nowrap',
    'overflow-hidden',
    'text-ellipsis',
  ],
  {
    defaultVariants: {
      active: false,
    },
    variants: {
      active: {
        false: ['bg-transparent', 'text-(--window-text)'],
        true: ['bg-(--menu-hilight)', 'text-(--hilight-text)'],
      },
    },
  },
)

const labelVariants = cva(['inline-block', 'mr-2', 'leading-5.25'])

const wrapperVariants = cva(['relative', 'inline-block'])

export interface SelectProps<T = string>
  extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /**
   * Default selected value (uncontrolled mode).
   */
  defaultValue?: T
  /**
   * Whether the select is disabled.
   */
  disabled?: boolean
  /**
   * Custom display formatter for the selected option.
   */
  formatDisplay?: (option: SelectOption<T>) => string
  /**
   * Optional label text for accessibility.
   */
  label?: string
  /**
   * Additional className for the label element.
   */
  labelClassName?: string
  /**
   * Maximum height of the select menu.
   */
  menuMaxHeight?: number | string
  /**
   * The name attribute for form submission.
   */
  name: string
  /**
   * Callback fired when selection changes.
   */
  onChange?: (option: SelectOption<T>) => void
  /**
   * Callback fired when select closes.
   */
  onClose?: () => void
  /**
   * Callback fired when select opens.
   */
  onOpen?: () => void
  /**
   * Array of options to display in the select.
   */
  options: SelectOption<T>[]
  /**
   * Additional className for the trigger button.
   */
  triggerClassName?: string
  /**
   * Currently selected value (controlled mode).
   */
  value?: T
  /**
   * Width of the select.
   */
  width?: React.CSSProperties['width']
}

/**
 * A Windows 98 styled select component with custom rendered options.
 * Unlike SelectNative, this renders its own listbox for more styling control.
 */
export function Select<T = string>({
  className,
  defaultValue,
  disabled = false,
  formatDisplay,
  id,
  label,
  labelClassName,
  menuMaxHeight,
  name,
  onChange,
  onClose,
  onOpen,
  options,
  style,
  triggerClassName,
  value,
  width,
  ...props
}: SelectProps<T>): React.ReactElement {
  const generatedId = useId()
  const triggerId = id ?? (label ? generatedId : undefined)
  const menuId = `${generatedId}-menu`

  const {
    activeIndex,
    closeSelect,
    handleOptionClick,
    handleOptionKeyDown,
    handleOptionMouseEnter,
    handleTriggerClick,
    handleTriggerKeyDown,
    listboxRef,
    open,
    optionRef,
    selectedOption,
    triggerRef,
  } = useSelectState({
    defaultValue,
    disabled,
    onChange,
    onClose,
    onOpen,
    options,
    value,
  })

  useScrollbar(listboxRef, { disabled: !open })

  const menuWrapperRef = useRef<HTMLDivElement>(null)

  // Outside pointerdown (anywhere outside the trigger or the menu wrapper —
  // the wrapper contains both the listbox and the custom scrollbar DOM) and
  // Escape close the select via the shared dismissable primitive.
  const layerRefs = useMemo(() => [triggerRef, menuWrapperRef], [triggerRef])
  useDismissable({
    enabled: open,
    onDismiss: closeSelect,
    outsidePointer: true,
    layerRefs,
  })

  // Display label
  const displayLabel = useMemo(() => {
    if (!selectedOption)
      return ''
    if (formatDisplay)
      return formatDisplay(selectedOption)
    return selectedOption.label ?? String(selectedOption.value)
  }, [selectedOption, formatDisplay])

  // Menu style with max height
  const menuStyle = useMemo(
    () => (menuMaxHeight ? { maxHeight: menuMaxHeight } : undefined),
    [menuMaxHeight],
  )

  const selectElement = (
    <div
      className={cn(wrapperVariants(), className)}
      style={{ ...style, width }}
      {...props}
    >
      {/* Hidden input for form submission */}
      <input
        name={name}
        type="hidden"
        value={selectedOption ? String(selectedOption.value) : ''}
      />

      {/* Trigger button - styled like native select */}
      <button
        aria-controls={open ? menuId : undefined}
        aria-disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(triggerVariants(), triggerClassName)}
        data-open={open || undefined}
        data-disabled={disabled || undefined}
        disabled={disabled}
        id={triggerId}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        role="combobox"
        type="button"
      >
        {displayLabel}
        <ButtonDownIcon
          className={cn(
            'absolute right-0.5 top-0.5 pointer-events-none',
            !disabled && 'group-active:hidden',
          )}
        />
        {!disabled && (
          <ButtonDownActiveIcon className="absolute right-0.5 top-0.5 pointer-events-none hidden group-active:block" />
        )}
      </button>

      {/* Select menu */}
      {open && (
        <div className={cn(menuWrapperVariants())} ref={menuWrapperRef}>
          <ul
            className={cn(menuVariants())}
            id={menuId}
            ref={listboxRef}
            role="listbox"
            style={menuStyle}
            tabIndex={-1}
          >
            {options.map((option, index) => {
              const isActive = index === activeIndex
              const isSelected = option.value === selectedOption?.value
              const optionLabel = option.label ?? String(option.value)

              return (
                <li
                  aria-selected={isSelected}
                  className={cn(menuItemVariants({ active: isActive }))}
                  key={`${String(option.value)}-${String(index)}`}
                  onClick={() => {
                    handleOptionClick(index)
                  }}
                  onKeyDown={(e) => {
                    handleOptionKeyDown(e)
                  }}
                  onMouseEnter={() => {
                    handleOptionMouseEnter(index)
                  }}
                  ref={(el) => {
                    optionRef.current[index] = el
                  }}
                  role="option"
                  tabIndex={isActive ? 0 : -1}
                >
                  {optionLabel}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )

  if (label) {
    return (
      <>
        <label
          className={cn(labelVariants(), labelClassName)}
          htmlFor={triggerId}
        >
          {label}
        </label>
        {selectElement}
      </>
    )
  }

  return selectElement
}

export type { SelectOption }
export type { SelectNativeProps } from './select-native'
export { SelectNative } from './select-native'
