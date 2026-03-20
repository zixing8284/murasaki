import { GroupBox, OptionButton, OptionGroup } from 'murasaki-react98'
import { useState } from 'react'

export default function DemoBasicOptionButton(): React.ReactElement {
  const [value, setValue] = useState('option1')

  return (
    <div className="flex gap-4">
      <GroupBox label="Basic">
        <OptionGroup name="demo" selectedValue={value} onChange={setValue}>
          <div className="flex flex-col gap-2">
            <OptionButton value="option1">Option 1</OptionButton>
            <OptionButton value="option2">Option 2</OptionButton>
            <OptionButton value="option3">Option 3</OptionButton>
          </div>
        </OptionGroup>
      </GroupBox>
      <GroupBox label="Disabled">
        <OptionGroup name="disabled-demo" selectedValue="checked">
          <div className="flex flex-col gap-2">
            <OptionButton value="unchecked" disabled>Disabled unchecked</OptionButton>
            <OptionButton value="checked" disabled>Disabled checked</OptionButton>
          </div>
        </OptionGroup>
      </GroupBox>
    </div>
  )
}
