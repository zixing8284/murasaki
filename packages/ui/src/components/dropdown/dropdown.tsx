import type { DropdownOption } from './use-dropdown-state'

import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import * as React from 'react'
import { useId, useMemo } from 'react'
import { ButtonDownActiveIcon, ButtonDownIcon } from './dropdown-icons'
import { useDropdownState } from './use-dropdown-state'

// Trigger button variants - styled like DropdownNative's select
const triggerVariants = cva([
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
  'text-left',
  // Border effect
  'shadow-border-field',
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

// Dropdown menu
const menuVariants = cva([
  'absolute',
  'left-0',
  'z-50',
  'w-full',
  'max-h-40',
  'overflow-y-auto',
  'bg-(--button-hilight)',
  'border',
  'border-(--button-shadow)',
  'list-none',
  'm-0',
  'p-0',
])

// Menu item
const menuItemVariants = cva(
  [
    'box-border',
    'w-full',
    'px-1',
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

const labelVariants = cva(['inline-block', 'mr-2', 'leading-[21px]'])

const wrapperVariants = cva(['relative', 'inline-block'])

export interface DropdownProps<T = string>
  extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /**
   * Default selected value (uncontrolled mode).
   */
  defaultValue?: T
  /**
   * Whether the dropdown is disabled.
   */
  disabled?: boolean
  /**
   * Custom display formatter for the selected option.
   */
  formatDisplay?: (option: DropdownOption<T>) => string
  /**
   * Optional label text for accessibility.
   */
  label?: string
  /**
   * Additional className for the label element.
   */
  labelClassName?: string
  /**
   * Maximum height of the dropdown menu.
   */
  menuMaxHeight?: number | string
  /**
   * The name attribute for form submission.
   */
  name: string
  /**
   * Callback fired when selection changes.
   */
  onChange?: (option: DropdownOption<T>) => void
  /**
   * Callback fired when dropdown closes.
   */
  onClose?: () => void
  /**
   * Callback fired when dropdown opens.
   */
  onOpen?: () => void
  /**
   * Array of options to display in the dropdown.
   */
  options: DropdownOption<T>[]
  /**
   * Additional className for the trigger button.
   */
  triggerClassName?: string
  /**
   * Currently selected value (controlled mode).
   */
  value?: T
  /**
   * Width of the dropdown.
   */
  width?: React.CSSProperties['width']
}

/**
 * A Windows 98 styled dropdown component with custom rendered options.
 * Unlike DropdownNative, this renders its own dropdown list for more styling control.
 */
export function Dropdown<T = string>({
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
}: DropdownProps<T>): React.ReactElement {
  const generatedId = useId()
  const triggerId = id ?? (label ? generatedId : undefined)
  const menuId = `${generatedId}-menu`

  const {
    activeIndex,
    dropdownRef,
    handleOptionClick,
    handleOptionKeyDown,
    handleOptionMouseEnter,
    handleTriggerClick,
    handleTriggerKeyDown,
    open,
    optionRef,
    selectedOption,
    triggerRef,
  } = useDropdownState({
    defaultValue,
    disabled,
    onChange,
    onClose,
    onOpen,
    options,
    value,
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

  const dropdownElement = (
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
        disabled={disabled}
        id={triggerId}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        role="combobox"
        type="button"
      >
        {displayLabel}
        <ButtonDownIcon className="absolute right-[2px] top-[2px] pointer-events-none group-active:hidden" />
        <ButtonDownActiveIcon className="absolute right-[2px] top-[2px] pointer-events-none hidden group-active:block" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul
          className={cn(menuVariants())}
          id={menuId}
          ref={dropdownRef}
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
        {dropdownElement}
      </>
    )
  }

  return dropdownElement
}

export type { DropdownOption }
export { DropdownNative } from './dropdown-native'
