import { OptionButton, OptionGroup } from 'murasaki-react98'
import { useState } from 'react'

export default function DemoBasicOptionButton(): React.ReactElement {
  const [value, setValue] = useState('option1')

  return (
    <OptionGroup name="demo" selectedValue={value} onChange={setValue}>
      <div className="flex flex-col gap-2">
        <OptionButton value="option1">Option 1</OptionButton>
        <OptionButton value="option2">Option 2</OptionButton>
        <OptionButton value="option3">Option 3</OptionButton>
      </div>
    </OptionGroup>
  )
}
