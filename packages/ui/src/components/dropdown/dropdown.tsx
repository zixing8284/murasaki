import type { DropdownOption } from './use-dropdown-state'

import { cva } from 'class-variance-authority'

import * as React from 'react'

import { useEffect, useId, useMemo, useRef } from 'react'
import { cn } from '#/lib/utils'
import { useScrollbar } from '../scroll-area/use-scrollbar'
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
  'bg-(--window)',
  'text-(--window-text)',
  'text-left',
  // Border effect (on pseudo-element to prevent child overlap)
  'before:content-[\'\']',
  'before:absolute',
  'before:inset-0',
  'before:shadow-(--shadow-border-field)',
  'before:pointer-events-none',
  'before:z-[1]',
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

// Dropdown menu wrapper (positioning context for scrollbar)
const menuWrapperVariants = cva([
  'absolute',
  'left-0',
  'right-[1px]',
  'z-50',
  'border',
  'border-(--button-shadow)',
])

// Dropdown menu
const menuVariants = cva([
  'w-full',
  'max-h-40',
  'overflow-y-auto',
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

  useScrollbar(dropdownRef, { disabled: !open })

  const menuWrapperRef = useRef<HTMLDivElement>(null)

  // Prevent scrollbar clicks from closing the dropdown.
  // Scrollbar DOM is appended to the wrapper div (outside the <ul>),
  // so clicks on it would otherwise trigger the click-outside handler.
  useEffect(() => {
    if (!open)
      return
    const wrapper = menuWrapperRef.current
    if (!wrapper)
      return

    const handleMouseDown = (e: MouseEvent): void => {
      const target = e.target as Node
      if (!dropdownRef.current?.contains(target)) {
        e.stopPropagation()
      }
    }

    wrapper.addEventListener('mousedown', handleMouseDown)
    return () => wrapper.removeEventListener('mousedown', handleMouseDown)
  }, [open, dropdownRef])

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
        <ButtonDownIcon
          className={cn(
            'absolute right-[2px] top-[2px] pointer-events-none',
            !disabled && 'group-active:hidden',
          )}
        />
        {!disabled && (
          <ButtonDownActiveIcon className="absolute right-[2px] top-[2px] pointer-events-none hidden group-active:block" />
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className={cn(menuWrapperVariants())} ref={menuWrapperRef}>
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
        {dropdownElement}
      </>
    )
  }

  return dropdownElement
}

export type { DropdownOption }
export { DropdownNative } from './dropdown-native'
