import { useCallback, useEffect, useRef, useState } from 'react'

export interface SelectOption<T = string> {
  label?: string
  value: T
}

interface UseSelectStateOptions<T> {
  defaultValue?: T | undefined
  disabled?: boolean | undefined
  onValueChange?: ((value: T, option: SelectOption<T>) => void) | undefined
  onClose?: (() => void) | undefined
  onOpen?: (() => void) | undefined
  options: SelectOption<T>[]
  value?: T | undefined
}

interface UseSelectStateReturn<T> {
  activeIndex: number
  closeSelect: () => void
  listboxRef: React.RefObject<HTMLUListElement | null>

  handleOptionClick: (index: number) => void
  handleOptionKeyDown: (e: React.KeyboardEvent, index: number) => void
  handleOptionMouseEnter: (index: number) => void

  // Handlers
  handleTriggerClick: () => void
  handleTriggerKeyDown: (e: React.KeyboardEvent) => void
  // State
  open: boolean
  optionRef: React.RefObject<(HTMLLIElement | null)[]>
  selectedOption: SelectOption<T> | undefined
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
  // Refs
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function useSelectState<T = string>({
  defaultValue,
  disabled = false,
  onValueChange,
  onClose,
  onOpen,
  options,
  value,
}: UseSelectStateOptions<T>): UseSelectStateReturn<T> {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const listboxRef = useRef<HTMLUListElement | null>(null)
  const optionRef = useRef<(HTMLLIElement | null)[]>([])

  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<T | undefined>(
    () => value ?? defaultValue ?? options[0]?.value,
  )

  // Controlled vs uncontrolled
  const currentValue = value ?? internalValue

  // Find current selected option. Plain render-time lookup: the array is short
  // and React Compiler will memoize when beneficial; an explicit useMemo here
  // only adds overhead without observable savings.
  const selectedOption = options.find(opt => opt.value === currentValue)

  // Active index for keyboard navigation
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = options.findIndex(opt => opt.value === currentValue)
    return idx >= 0 ? idx : 0
  })

  // Open select
  const openSelect = useCallback(() => {
    if (disabled)
      return
    setOpen(true)
    // Reset active index to selected option when opening
    const idx = options.findIndex(opt => opt.value === currentValue)
    setActiveIndex(idx >= 0 ? idx : 0)
    onOpen?.()
  }, [disabled, options, currentValue, onOpen])

  // Close select
  const closeSelect = useCallback(() => {
    setOpen(false)
    onClose?.()
    triggerRef.current?.focus()
  }, [onClose])

  // Select an option
  const selectOption = useCallback(
    (index: number) => {
      const option = options[index]

      if (!option)
        return

      if (value === undefined) {
        setInternalValue(option.value)
      }
      onValueChange?.(option.value, option)
      closeSelect()
    },
    [options, value, onValueChange, closeSelect],
  )

  // Toggle select
  const handleTriggerClick = useCallback(() => {
    if (disabled)
      return
    if (open) {
      closeSelect()
    }
    else {
      openSelect()
    }
  }, [disabled, open, closeSelect, openSelect])

  // Handle trigger keyboard events
  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled)
        return

      switch (e.key) {
        case ' ':
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
          e.preventDefault()
          if (!open) {
            openSelect()
          }
          break
        // Escape is handled centrally by `useDismissable` in the consumer.
      }
    },
    [disabled, open, openSelect],
  )

  // Handle option click
  const handleOptionClick = useCallback(
    (index: number) => {
      selectOption(index)
    },
    [selectOption],
  )

  // Handle option keyboard events. Arrow/Home/End navigation is owned by the
  // shared `useRovingFocus` primitive in the rendering component.
  const handleOptionKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault()
          selectOption(index)
          break
        // Escape is handled centrally by `useDismissable` in the consumer.
        case 'Tab':
          closeSelect()
          break
      }
    },
    [selectOption, closeSelect],
  )

  // Handle option hover
  const handleOptionMouseEnter = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  // Focus active option when select opens or active index changes
  useEffect(() => {
    if (open && optionRef.current[activeIndex]) {
      optionRef.current[activeIndex]?.focus()
    }
  }, [open, activeIndex])

  // Outside-click and Escape dismissal are owned by the consuming component
  // via the `useDismissable` primitive, scoped to the select layer refs.

  return {
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
  }
}
