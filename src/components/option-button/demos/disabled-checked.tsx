import { OptionButton } from '../option-button'
import OptionGroup from '../option-group'

export function DisabledChecked(): React.ReactElement {
  return (
    <OptionGroup name="disabled-checked" selectedValue="option2">
      <div className="flex flex-col gap-2">
        <OptionButton disabled value="option1">
          Disabled Unchecked
        </OptionButton>
        <OptionButton disabled value="option2">
          Disabled Checked
        </OptionButton>
      </div>
    </OptionGroup>
  )
}
