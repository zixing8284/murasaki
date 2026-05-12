import { createContext, use } from 'react'

export interface OptionGroupProps {
  /**
   * Default selected value for uncontrolled groups.
   */
  defaultValue?: string | undefined
  /**
   * provides the name attribute for each option button in the group
   */
  name: string
  /**
   * callback fired with the next selected value.
   * @param value the value of the selected option button
   */
  onValueChange?: ((value: string) => void) | undefined
  /**
   * The currently selected value for controlled groups.
   */
  value?: string | undefined
}

export const OptionButtonGroupContext = createContext<
  OptionGroupProps | undefined
>(undefined)

export function useOptionButtonGroupContext(): OptionGroupProps {
  const context = use(OptionButtonGroupContext)
  if (!context) {
    throw new Error(
      'useOptionButtonGroupContext must be used within an OptionGroup',
    )
  }

  return context
}
