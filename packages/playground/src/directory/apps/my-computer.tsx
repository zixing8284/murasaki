import { Checkbox, OptionButton, OptionGroup } from '@murasaki/react98'
import { useState } from 'react'

export function MyComputer(): React.ReactElement {
  const [selected, setSelected] = useState('option1')

  const [checked, setChecked] = useState(false)

  return (
    <>
      <p>Window content here...</p>
      <OptionGroup name="demo" value={selected} onValueChange={setSelected}>
        <div className="flex flex-col gap-2">
          <OptionButton value="option1">Option 1</OptionButton>
          <OptionButton value="option2">Option 2</OptionButton>
          <OptionButton value="option3">Option 3</OptionButton>
        </div>
      </OptionGroup>
      <div className="mt-4">
        <Checkbox checked={checked} onCheckedChange={setChecked}>
          Check me:
          {' '}
          {checked ? 'Checked' : 'Unchecked'}
        </Checkbox>
      </div>
    </>
  )
}
