import { cva } from 'class-variance-authority'

import * as React from 'react'

import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { LayerPortal } from '../../primitives/layer-root/layer-portal'
import { useScrollbar } from '../../primitives/scrollbar/use-scrollbar'
import { useDismissable } from '../../primitives/use-dismissable'
import { useLayer } from '../../primitives/use-layer'
import { useRovingFocus } from '../../primitives/use-roving-focus'
import { useTypeahead } from '../../primitives/use-typeahead'
import {
  SelectContext,
  SelectGroupContext,
  useSelectContext,
  useSelectGroupContext,
} from './select-context'
import { ButtonDownActiveIcon, ButtonDownIcon } from './select-icons'

// ============================================================================
// Styles
// ============================================================================

const triggerVariants = cva([
  // Reset
  'appearance-none',
  'border-none',
  'rounded-none',
  // Layout
  'box-border',
  'h-5.25',
  'w-full',
  'flex',
  'items-center',
  'pl-1',
  'pr-4.5',
  // Colors
  'bg-(--window)',
  'text-(--window-text)',
  'text-left',
  'shadow-(--shadow-border-field)',
  // Positioning context for the arrow icon + group hook for its active swap
  'relative',
  'group',
  // Focus state
  'focus:outline-none',
  // Disabled state
  'disabled:bg-(--button-face)',
  'disabled:text-(--gray-text)',
  'disabled:cursor-not-allowed',
])

const valueVariants = cva([
  'flex-1',
  'min-w-0',
  'overflow-hidden',
  'whitespace-nowrap',
  'text-ellipsis',
  'leading-none',
])

const contentVariants = cva([
  'pointer-events-auto',
  'fixed',
  'z-[var(--react98-layer-popup-z-index)]',
  'overflow-hidden',
  'border',
  'border-(--button-shadow)',
  'bg-(--window)',
])

const listboxVariants = cva([
  'w-full',
  'max-h-40',
  'overflow-y-auto',
  'box-border',
  'bg-(--window)',
  'list-none',
  'm-0',
  'p-0',
])

const itemVariants = cva(
  [
    'box-border',
    'w-full',
    'flex',
    'items-center',
    'gap-1',
    'pl-2',
    'pr-1.5',
    'py-0.5',
    'outline-none',
    'whitespace-nowrap',
  ],
  {
    defaultVariants: {
      disabled: false,
    },
    variants: {
      disabled: {
        false: [
          'cursor-pointer',
          'bg-transparent',
          'text-(--window-text)',
          'hover:bg-(--menu-hilight)',
          'hover:text-(--hilight-text)',
          'focus:bg-(--menu-hilight)',
          'focus:text-(--hilight-text)',
        ],
        true: [
          'cursor-default',
          'text-(--gray-text)',
          '[text-shadow:1px_1px_0_var(--button-hilight)]',
        ],
      },
    },
  },
)

const groupLabelVariants = cva([
  'box-border',
  'w-full',
  'px-2',
  'py-0.5',
  'text-(--gray-text)',
  'select-none',
])

const separatorVariants = cva([
  'border-b',
  'border-(--button-hilight)',
  'border-t',
  'border-t-(--button-shadow)',
  'm-0.5',
])

// ============================================================================
// Label collection (for closed-state trigger display)
// ============================================================================

/**
 * Walk the root's children and record each direct `SelectItem`'s value → label
 * so `SelectValue` can show the selected label before the popup has ever been
 * opened. Recurses through wrappers such as `SelectGroup` and fragments.
 *
 * Items rendered by a custom wrapper component (whose `SelectItem` is produced
 * inside that component's own render) are not visible here; their label is
 * resolved at selection time instead.
 */
function collectItemLabels(children: React.ReactNode, map: Map<string, string>): void {
  if (Array.isArray(children)) {
    for (const child of children as React.ReactNode[])
      collectItemLabels(child, map)
    return
  }
  if (!React.isValidElement(children))
    return
  if (children.type === SelectItem) {
    const { value, textValue, children: itemChildren } = children.props as SelectItemProps
    const label = textValue ?? (typeof itemChildren === 'string' ? itemChildren : undefined)
    if (label !== undefined)
      map.set(value, label)
    return
  }
  const nested = (children.props as { children?: React.ReactNode } | undefined)?.children
  if (nested !== undefined && nested !== null)
    collectItemLabels(nested, map)
}

// ============================================================================
// Select (root)
// ============================================================================

export interface SelectProps {
  /** Selected value (controlled). */
  value?: string
  /** Initial selected value (uncontrolled). */
  defaultValue?: string
  /** Called with the next value when the selection changes. */
  onValueChange?: (value: string) => void
  /** Open state of the listbox popup (controlled). */
  open?: boolean
  /** Initial open state of the listbox popup (uncontrolled). */
  defaultOpen?: boolean
  /** Called with the next open state when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Disables the trigger and prevents opening. */
  disabled?: boolean
  /**
   * Name for the hidden form input. Omit for UI-only selects that do not
   * participate in a form.
   */
  name?: string
  /** Marks the hidden form input as required. */
  required?: boolean
  /** Compound children: `SelectTrigger` and `SelectContent`. */
  children?: React.ReactNode
}

/**
 * A Windows 98 styled select built from composable parts, mirroring the
 * shadcn/ui structure. Compose `SelectTrigger` + `SelectValue` with a
 * `SelectContent` of `SelectItem`s (optionally grouped by `SelectGroup` /
 * `SelectLabel` and split by `SelectSeparator`).
 *
 * For a plain native `<select>` (e.g. real form semantics or native mobile
 * pickers) use `SelectNative` instead.
 *
 * @example
 * ```tsx
 * <Select defaultValue="apple" name="fruit">
 *   <SelectTrigger className="w-48">
 *     <SelectValue placeholder="Pick a fruit" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectGroup>
 *       <SelectLabel>Fruits</SelectLabel>
 *       <SelectItem value="apple">Apple</SelectItem>
 *       <SelectItem value="banana">Banana</SelectItem>
 *     </SelectGroup>
 *   </SelectContent>
 * </Select>
 * ```
 */
export function Select({
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  name,
  required,
  children,
}: SelectProps): React.ReactElement {
  const generatedId = useId()
  const triggerId = `${generatedId}-trigger`
  const listboxId = `${generatedId}-listbox`

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const listboxRef = useRef<HTMLUListElement | null>(null)

  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
  const isValueControlled = value !== undefined
  const currentValue = isValueControlled ? value : internalValue

  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpenControlled = openProp !== undefined
  const open = isOpenControlled ? openProp : internalOpen

  // Label learned when the user selects an item (covers items rendered by
  // wrapper components that `collectItemLabels` cannot see).
  const [selectedLabelState, setSelectedLabelState] = useState<{ value: string, label: string } | null>(null)

  const labelMap = new Map<string, string>()
  collectItemLabels(children, labelMap)

  const scannedLabel = currentValue !== undefined ? labelMap.get(currentValue) : undefined
  const selectedLabel = (selectedLabelState && selectedLabelState.value === currentValue
    ? selectedLabelState.label
    : undefined) ?? scannedLabel

  const setOpen = (next: boolean): void => {
    if (disabled && next)
      return
    if (!isOpenControlled)
      setInternalOpen(next)
    onOpenChange?.(next)
    if (!next)
      triggerRef.current?.focus()
  }

  const onItemSelect = (nextValue: string, label: string): void => {
    if (!isValueControlled)
      setInternalValue(nextValue)
    setSelectedLabelState({ value: nextValue, label })
    onValueChange?.(nextValue)
    setOpen(false)
  }

  const context = {
    value: currentValue,
    selectedLabel,
    open,
    disabled,
    onItemSelect,
    setOpen,
    triggerRef,
    contentRef,
    listboxRef,
    triggerId,
    listboxId,
  }

  return (
    <SelectContext value={context}>
      {name !== undefined && (
        <input
          type="hidden"
          name={name}
          value={currentValue ?? ''}
          required={required}
          disabled={disabled}
        />
      )}
      {children}
    </SelectContext>
  )
}

// ============================================================================
// SelectTrigger
// ============================================================================

export type SelectTriggerProps = Omit<React.ComponentProps<'button'>, 'type'>

/**
 * The button that opens the listbox. Renders the Windows 98 arrow affordance
 * and forwards keyboard interactions. Place a `SelectValue` inside it.
 */
export function SelectTrigger({
  children,
  className,
  id,
  onClick,
  onKeyDown,
  ...props
}: SelectTriggerProps): React.ReactElement {
  const { open, disabled, setOpen, triggerRef, triggerId, listboxId } = useSelectContext()

  const setTriggerRef = (node: HTMLButtonElement | null): void => {
    triggerRef.current = node
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event)
    if (event.defaultPrevented || disabled)
      return
    setOpen(!open)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled)
      return
    switch (event.key) {
      case ' ':
      case 'Enter':
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault()
        if (!open)
          setOpen(true)
        break
      // Escape is handled centrally by `useDismissable` in SelectContent.
    }
  }

  return (
    <button
      ref={setTriggerRef}
      type="button"
      id={id ?? triggerId}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? listboxId : undefined}
      aria-disabled={disabled || undefined}
      data-open={open || undefined}
      data-disabled={disabled || undefined}
      disabled={disabled}
      className={cn(triggerVariants(), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
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
  )
}

// ============================================================================
// SelectValue
// ============================================================================

export interface SelectValueProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** Shown when no value is selected. */
  placeholder?: React.ReactNode
}

/**
 * Displays the selected item's label inside the trigger, or `placeholder`
 * when nothing is selected.
 */
export function SelectValue({ className, placeholder, ...props }: SelectValueProps): React.ReactElement {
  const { value, selectedLabel } = useSelectContext()
  const hasValue = value !== undefined && value !== ''
  const content = hasValue ? (selectedLabel ?? value) : placeholder

  return (
    <span
      className={cn(valueVariants(), className)}
      data-placeholder={hasValue ? undefined : ''}
      {...props}
    >
      {content}
    </span>
  )
}

// ============================================================================
// SelectContent
// ============================================================================

export interface SelectContentProps extends Omit<React.ComponentProps<'ul'>, 'children'> {
  /** Listbox children: `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`. */
  children?: React.ReactNode
  /** Upper bound for the listbox height before it scrolls. */
  maxHeight?: number | string
}

/**
 * The portalled popup that holds the options. Handles positioning, keyboard
 * navigation, typeahead, the custom scrollbar, and dismissal. Renders nothing
 * until the select is open.
 */
export function SelectContent({
  children,
  className,
  maxHeight,
  ...props
}: SelectContentProps): React.ReactElement | null {
  const {
    open,
    value,
    setOpen,
    triggerRef,
    contentRef,
    listboxRef,
    listboxId,
  } = useSelectContext()

  useScrollbar(listboxRef, { disabled: !open })

  useRovingFocus({
    enabled: open,
    containerRef: listboxRef,
    itemSelector: '[role="option"]',
    orientation: 'vertical',
    loop: false,
  })

  const handleTypeaheadMatch = (search: string): void => {
    const listbox = listboxRef.current
    if (!listbox)
      return
    const options = Array.from(
      listbox.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'),
    )
    if (options.length === 0)
      return

    const active = document.activeElement as HTMLElement | null
    const activeIndex = active ? options.indexOf(active) : -1
    const ordered = [
      ...options.slice(activeIndex + 1),
      ...options.slice(0, activeIndex + 1),
    ]
    const match = ordered.find(option => (option.getAttribute('data-label') ?? '').toLowerCase().startsWith(search))
    match?.focus()
  }

  const { onChar: handleTypeaheadChar } = useTypeahead({
    enabled: open,
    onMatch: handleTypeaheadMatch,
  })

  const handleListboxKeyDown = (event: React.KeyboardEvent<HTMLUListElement>): void => {
    if (event.key === 'Tab') {
      setOpen(false)
      return
    }
    if (event.defaultPrevented)
      return
    if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey)
      return
    handleTypeaheadChar(event.key)
  }

  const [position, ready] = useLayer({
    anchorRef: triggerRef,
    layerRef: contentRef,
    open,
    side: 'bottom',
    align: 'start',
    gap: 0,
  })

  // Outside pointerdown and Escape close the popup via the shared primitive.
  useDismissable({
    enabled: open,
    onDismiss: () => setOpen(false),
    outsidePointer: true,
    layerRefs: [triggerRef, contentRef],
  })

  // Focus the selected (or first enabled) option when the popup opens.
  useEffect(() => {
    if (!open)
      return
    const listbox = listboxRef.current
    if (!listbox)
      return
    const selected = value !== undefined
      ? listbox.querySelector<HTMLElement>(`[role="option"][data-value="${CSS.escape(value)}"]:not([aria-disabled="true"])`)
      : null
    const target = selected ?? listbox.querySelector<HTMLElement>('[role="option"]:not([aria-disabled="true"])')
    target?.focus()
  }, [open, value, listboxRef])

  if (!open)
    return null

  // The trigger is a rendered sibling by the time the popup opens, so reading
  // its width here keeps the popup aligned without a measurement round-trip.
  const triggerWidth = triggerRef.current?.offsetWidth

  const detected = position?.availableHeight
  const listboxStyle = (() => {
    if (!detected)
      return maxHeight ? { maxHeight } : undefined
    const capped = maxHeight
      ? Math.min(detected, typeof maxHeight === 'number' ? maxHeight : Number.POSITIVE_INFINITY)
      : detected
    return { maxHeight: capped }
  })()

  return (
    <LayerPortal>
      <div
        ref={contentRef}
        className={cn(contentVariants())}
        style={{
          left: ready && position ? position.x : -9999,
          top: ready && position ? position.y : -9999,
          opacity: ready ? undefined : 0,
          width: triggerWidth,
        }}
      >
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className={cn(listboxVariants(), className)}
          style={listboxStyle}
          onKeyDown={handleListboxKeyDown}
          {...props}
        >
          {children}
        </ul>
      </div>
    </LayerPortal>
  )
}

// ============================================================================
// SelectItem
// ============================================================================

export interface SelectItemProps extends Omit<React.ComponentProps<'li'>, 'value' | 'role'> {
  /** The value committed when this item is chosen. */
  value: string
  /** Disables selection of this item. */
  disabled?: boolean
  /**
   * Text used for typeahead matching and trigger display. Required when
   * `children` is not a plain string (e.g. contains an icon).
   */
  textValue?: string
}

/**
 * A selectable option. Its plain-text `children` double as the typeahead and
 * trigger label; pass `textValue` when the children are not a string.
 */
export function SelectItem({
  children,
  className,
  value,
  disabled = false,
  textValue,
  onClick,
  onKeyDown,
  ...props
}: SelectItemProps): React.ReactElement {
  const { value: selectedValue, onItemSelect } = useSelectContext()
  const isSelected = selectedValue === value
  const label = textValue ?? (typeof children === 'string' ? children : '')

  const commit = (): void => {
    if (!disabled)
      onItemSelect(value, label)
  }

  const handleClick = (event: React.MouseEvent<HTMLLIElement>): void => {
    onClick?.(event)
    if (event.defaultPrevented)
      return
    commit()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented)
      return
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      commit()
    }
  }

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      data-value={value}
      data-label={label}
      data-disabled={disabled || undefined}
      data-selected={isSelected || undefined}
      tabIndex={-1}
      className={cn(itemVariants({ disabled }), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </li>
  )
}

// ============================================================================
// SelectGroup / SelectLabel / SelectSeparator
// ============================================================================

export type SelectGroupProps = Omit<React.ComponentProps<'li'>, 'role'>

/**
 * Groups related options under an optional `SelectLabel`. Rendered as a
 * `role="group"` region associated with its label for assistive technology.
 */
export function SelectGroup({ children, className, ...props }: SelectGroupProps): React.ReactElement {
  const labelId = useId()
  return (
    <SelectGroupContext value={{ labelId }}>
      <li
        role="group"
        aria-labelledby={labelId}
        className={cn('block', className)}
        {...props}
      >
        <ul role="presentation" className="list-none m-0 p-0">
          {children}
        </ul>
      </li>
    </SelectGroupContext>
  )
}

export type SelectLabelProps = React.ComponentProps<'li'>

/** A non-interactive heading for a `SelectGroup`. */
export function SelectLabel({ children, className, id, ...props }: SelectLabelProps): React.ReactElement {
  const group = useSelectGroupContext()
  return (
    <li
      id={id ?? group?.labelId}
      role="presentation"
      className={cn(groupLabelVariants(), className)}
      {...props}
    >
      {children}
    </li>
  )
}

export type SelectSeparatorProps = React.ComponentProps<'li'>

/** A horizontal divider between options or groups. */
export function SelectSeparator({ className, ...props }: SelectSeparatorProps): React.ReactElement {
  return (
    <li
      role="separator"
      aria-hidden="true"
      className={cn(separatorVariants(), className)}
      {...props}
    />
  )
}

export type { SelectNativeProps } from './select-native'
export { SelectNative } from './select-native'
