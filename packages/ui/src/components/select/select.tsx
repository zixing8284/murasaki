import type { SelectOption } from './use-select-state'

import { cva } from 'class-variance-authority'

import * as React from 'react'

import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { cn } from '../../lib/utils'
import { useCollection, useDismissable, useRovingFocus, useTypeahead } from '../../primitives'
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
  'p-0',
  // Colors
  'bg-(--window)',
  'text-(--window-text)',
  'text-left',
  'shadow-(--shadow-border-field)',
  // Position context for arrow icon
  'relative',
  'group',
  // Focus state
  'focus:outline-none',
  // Disabled state
  'disabled:bg-(--button-face)',
  'disabled:text-(--gray-text)',
  'disabled:cursor-not-allowed',
])

// Mirrors win99.dev: a single element owns padding + overflow + ellipsis,
// so the clip rect never lands on the glyph's left stem column. Avoids
// pixel-font left-edge clipping when AA is disabled and the layout box
// falls on a fractional device pixel.
const triggerLabelVariants = cva([
  'flex',
  'box-border',
  'h-full',
  'w-full',
  'items-center',
  'overflow-hidden',
  'whitespace-nowrap',
  'text-ellipsis',
  'leading-none',
  'py-0.5',
  'pl-1',
  'pr-4.5',
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

interface SelectCollectionData {
  index: number
  label: string
}

interface SelectOptionItemProps<T> {
  active: boolean
  index: number
  label: string
  option: SelectOption<T>
  optionRef: React.RefObject<(HTMLLIElement | null)[]>
  register: (ref: React.RefObject<HTMLElement | null>, data: SelectCollectionData) => () => void
  selected: boolean
  onClick: (index: number) => void
  onKeyDown: (event: React.KeyboardEvent, index: number) => void
  onMouseEnter: (index: number) => void
}

function SelectOptionItem<T>({
  active,
  index,
  label,
  option,
  optionRef,
  register,
  selected,
  onClick,
  onKeyDown,
  onMouseEnter,
}: SelectOptionItemProps<T>): React.ReactElement {
  const itemRef = useRef<HTMLLIElement | null>(null)
  const setItemRef = useCallback((node: HTMLLIElement | null) => {
    itemRef.current = node
    optionRef.current[index] = node
  }, [index, optionRef])

  useEffect(() => {
    return register(itemRef, { index, label })
  }, [index, label, register])

  return (
    <li
      aria-selected={selected}
      className={cn(menuItemVariants({ active }))}
      data-index={index}
      key={`${String(option.value)}-${String(index)}`}
      onClick={() => {
        onClick(index)
      }}
      onKeyDown={(event) => {
        onKeyDown(event, index)
      }}
      onMouseEnter={() => {
        onMouseEnter(index)
      }}
      ref={setItemRef}
      role="option"
      tabIndex={active ? 0 : -1}
    >
      {label}
    </li>
  )
}

export interface SelectProps<T = string>
  extends Omit<React.ComponentProps<'div'>, 'defaultValue'> {
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
   * Callback fired with the next selected value and option.
   */
  onValueChange?: (value: T, option: SelectOption<T>) => void
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
  onValueChange,
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
    setActiveIndex,
    triggerRef,
  } = useSelectState({
    defaultValue,
    disabled,
    onValueChange,
    onClose,
    onOpen,
    options,
    value,
  })

  useScrollbar(listboxRef, { disabled: !open })

  const collection = useCollection<SelectCollectionData>()

  const handleOptionFocus = useCallback((item: HTMLElement) => {
    const index = Number(item.getAttribute('data-index'))
    if (Number.isInteger(index))
      setActiveIndex(index)
  }, [setActiveIndex])

  useRovingFocus({
    enabled: open,
    containerRef: listboxRef,
    itemSelector: '[role="option"]',
    orientation: 'vertical',
    loop: false,
    onFocus: handleOptionFocus,
  })

  const handleTypeaheadMatch = useCallback((search: string) => {
    const items = collection.getItems()
    if (items.length === 0)
      return

    const activeOptionIndex = Math.max(0, activeIndex)
    const activeCollectionIndex = Math.max(0, items.findIndex(item => item.data.index === activeOptionIndex))
    const orderedItems = [
      ...items.slice(activeCollectionIndex + 1),
      ...items.slice(0, activeCollectionIndex + 1),
    ]
    const match = orderedItems.find(({ data }) => {
      return data.label.toLowerCase().startsWith(search)
    })
    if (!match)
      return

    setActiveIndex(match.data.index)
    match.ref.current?.focus()
  }, [activeIndex, collection, setActiveIndex])

  const { onChar: handleTypeaheadChar } = useTypeahead({
    enabled: open,
    onMatch: handleTypeaheadMatch,
  })

  const handleListboxKeyDown = useCallback((event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.defaultPrevented)
      return
    if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey)
      return

    handleTypeaheadChar(event.key)
  }, [handleTypeaheadChar])

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
        <span className={cn(triggerLabelVariants())}>{displayLabel}</span>
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
            onKeyDown={handleListboxKeyDown}
          >
            {options.map((option, index) => {
              const isActive = index === activeIndex
              const isSelected = option.value === selectedOption?.value
              const optionLabel = option.label ?? String(option.value)

              return (
                <SelectOptionItem
                  active={isActive}
                  index={index}
                  key={`${String(option.value)}-${String(index)}`}
                  label={optionLabel}
                  option={option}
                  optionRef={optionRef}
                  register={collection.register}
                  selected={isSelected}
                  onClick={handleOptionClick}
                  onKeyDown={handleOptionKeyDown}
                  onMouseEnter={handleOptionMouseEnter}
                />
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
