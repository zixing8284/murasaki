import { createContext, use } from 'react'

/**
 * Shared state exposed by the `Select` root to every compound part
 * (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, ...).
 *
 * Consumed through {@link useSelectContext}; not part of the public component
 * API surface beyond the exported type.
 *
 * @internal
 */
export interface SelectContextValue {
  /** Currently selected value (`undefined` when nothing is selected). */
  value: string | undefined
  /** Resolved display label for the current value, if it is known. */
  selectedLabel: string | undefined
  /** Whether the listbox popup is open. */
  open: boolean
  /** Whether the whole control is disabled. */
  disabled: boolean
  /** Commit a selection: updates value, closes the popup, restores focus. */
  onItemSelect: (value: string, label: string) => void
  /** Open or close the listbox popup. */
  setOpen: (open: boolean) => void
  /** Anchor element for the popup and target of keyboard interactions. */
  triggerRef: React.RefObject<HTMLButtonElement | null>
  /** Portalled popup wrapper (used for outside-pointer dismissal). */
  contentRef: React.RefObject<HTMLDivElement | null>
  /** The `<ul role="listbox">` element inside the popup. */
  listboxRef: React.RefObject<HTMLUListElement | null>
  /** Stable id for the trigger button, used for `<label htmlFor>` wiring. */
  triggerId: string
  /** Stable id for the listbox, used for `aria-controls`. */
  listboxId: string
}

export const SelectContext = createContext<SelectContextValue | null>(null)

/**
 * Access the surrounding {@link SelectContextValue}.
 *
 * @throws If called outside of a `<Select>` root.
 */
export function useSelectContext(): SelectContextValue {
  const context = use(SelectContext)
  if (!context) {
    throw new Error('Select compound components must be used within <Select>')
  }
  return context
}

/**
 * Per-group context so `SelectLabel` can associate itself with the enclosing
 * `SelectGroup` via `aria-labelledby`.
 *
 * @internal
 */
export interface SelectGroupContextValue {
  /** Id applied to the group label and referenced by the group's `aria-labelledby`. */
  labelId: string
}

export const SelectGroupContext = createContext<SelectGroupContextValue | null>(null)

/** Access the enclosing {@link SelectGroupContextValue}, or `null` when ungrouped. */
export function useSelectGroupContext(): SelectGroupContextValue | null {
  return use(SelectGroupContext)
}
