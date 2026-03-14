import { cnPure } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useId, useState } from 'react'

import { TabsContext } from './tabs-context'

// ============================================================================
// Styles
// ============================================================================

const tabsRootVariants = cva(['inline-flex', 'flex-col'])

// ============================================================================
// Component
// ============================================================================

export interface TabsProps extends React.ComponentProps<'div'> {
  /** The default selected tab value (uncontrolled mode) */
  defaultValue?: string
  /** The selected tab value (controlled mode) */
  value?: string
  /** Callback when the selected tab changes */
  onValueChange?: (value: string) => void
  /** Keep all panels mounted in the DOM to preserve a stable height */
  keepMounted?: boolean
}

export function Tabs({
  children,
  className,
  defaultValue = '',
  value,
  onValueChange,
  keepMounted = false,
  ...props
}: TabsProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const baseId = useId()

  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : internalValue

  const setSelectedValue = (newValue: string): void => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext value={{ selectedValue, setSelectedValue, baseId, keepMounted }}>
      <div
        className={cnPure(
          keepMounted ? 'grid grid-rows-[auto_1fr]' : tabsRootVariants(),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext>
  )
}
