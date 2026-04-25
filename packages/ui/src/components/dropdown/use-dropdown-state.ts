import { useCallback, useEffect, useRef, useState } from 'react'

export interface DropdownOption<T = string> {
  label?: string
  value: T
}

interface UseDropdownStateOptions<T> {
  defaultValue?: T | undefined
  disabled?: boolean | undefined
  onChange?: ((option: DropdownOption<T>) => void) | undefined
  onClose?: (() => void) | undefined
  onOpen?: (() => void) | undefined
  options: DropdownOption<T>[]
  value?: T | undefined
}

interface UseDropdownStateReturn<T> {
  activeIndex: number
  closeDropdown: () => void
  dropdownRef: React.RefObject<HTMLUListElement | null>

  handleOptionClick: (index: number) => void
  handleOptionKeyDown: (e: React.KeyboardEvent) => void
  handleOptionMouseEnter: (index: number) => void

  // Handlers
  handleTriggerClick: () => void
  handleTriggerKeyDown: (e: React.KeyboardEvent) => void
  // State
  open: boolean
  optionRef: React.RefObject<(HTMLLIElement | null)[]>
  selectedOption: DropdownOption<T> | undefined
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
  // Refs
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function useDropdownState<T = string>({
  defaultValue,
  disabled = false,
  onChange,
  onClose,
  onOpen,
  options,
  value,
}: UseDropdownStateOptions<T>): UseDropdownStateReturn<T> {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLUListElement | null>(null)
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

  // Open dropdown
  const openDropdown = useCallback(() => {
    if (disabled)
      return
    setOpen(true)
    // Reset active index to selected option when opening
    const idx = options.findIndex(opt => opt.value === currentValue)
    setActiveIndex(idx >= 0 ? idx : 0)
    onOpen?.()
  }, [disabled, options, currentValue, onOpen])

  // Close dropdown
  const closeDropdown = useCallback(() => {
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
      onChange?.(option)
      closeDropdown()
    },
    [options, value, onChange, closeDropdown],
  )

  // Toggle dropdown
  const handleTriggerClick = useCallback(() => {
    if (disabled)
      return
    if (open) {
      closeDropdown()
    }
    else {
      openDropdown()
    }
  }, [disabled, open, closeDropdown, openDropdown])

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
            openDropdown()
          }
          break
        case 'Escape':
          if (open) {
            e.preventDefault()
            closeDropdown()
          }
          break
      }
    },
    [disabled, open, openDropdown, closeDropdown],
  )

  // Handle option click
  const handleOptionClick = useCallback(
    (index: number) => {
      selectOption(index)
    },
    [selectOption],
  )

  // Handle option keyboard events
  const handleOptionKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault()
          selectOption(activeIndex)
          break
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex(prev => Math.min(prev + 1, options.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex(prev => Math.max(prev - 1, 0))
          break
        case 'End':
          e.preventDefault()
          setActiveIndex(options.length - 1)
          break
        case 'Escape':
          e.preventDefault()
          closeDropdown()
          break
        case 'Home':
          e.preventDefault()
          setActiveIndex(0)
          break
        case 'Tab':
          closeDropdown()
          break
      }
    },
    [options.length, activeIndex, selectOption, closeDropdown],
  )

  // Handle option hover
  const handleOptionMouseEnter = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  // Focus active option when dropdown opens or active index changes
  useEffect(() => {
    if (open && optionRef.current[activeIndex]) {
      optionRef.current[activeIndex]?.focus()
    }
  }, [open, activeIndex])

  // Close on click outside
  useEffect(() => {
    if (!open)
      return

    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as Node
      if (
        !triggerRef.current?.contains(target)
        && !dropdownRef.current?.contains(target)
      ) {
        closeDropdown()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, closeDropdown])

  return {
    activeIndex,
    closeDropdown,
    dropdownRef,
    handleOptionClick,
    handleOptionKeyDown,
    handleOptionMouseEnter,
    handleTriggerClick,
    handleTriggerKeyDown,
    open,
    optionRef,
    selectedOption,
    setActiveIndex,
    triggerRef,
  }
}
