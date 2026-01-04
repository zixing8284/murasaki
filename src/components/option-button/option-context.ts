import { createContext, use } from 'react'

export interface OptionGroupProps {
  /**
   * provides the name attribute for each option button in the group
   */
  name: string
  /**
   * callback fired when an option button is selected
   * @param value the value of the selected option button
   */
  onChange?: ((value: string) => void) | undefined
  /**
   * the currently selected value in the option button group
   */
  selectedValue?: string | undefined
}

export const OptionButtonGroupContext = createContext<
  OptionGroupProps | null
>(null)

export function useOptionButtonGroupContext(): OptionGroupProps {
  const context = use(OptionButtonGroupContext)
  if (!context) {
    throw new Error(
      'useOptionButtonGroupContext must be used within an OptionGroup',
    )
  }

  return context
}
