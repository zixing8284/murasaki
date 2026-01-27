import type { OptionGroupProps } from './option-context'
import { OptionButton } from './option-button'
import {
  OptionButtonGroupContext,

} from './option-context'

export function OptionGroup(
  props: React.PropsWithChildren<OptionGroupProps>,
): React.ReactElement {
  const { children, name, onChange, selectedValue } = props

  return (
    <OptionButtonGroupContext value={{ name, onChange, selectedValue }}>
      {children}
    </OptionButtonGroupContext>
  )
}
OptionGroup.Option = OptionButton
