import { OptionButton, OptionGroup } from 'murasaki-react98'
import { useState } from 'react'

export function MyComputer(): React.ReactElement {
  const [selected, setSelected] = useState('option1')

  return (
    <div className="p-2">
      <p>Window content here...</p>
      <OptionGroup name="demo" onChange={setSelected} selectedValue={selected}>
        <div className="flex flex-col gap-2">
          <OptionButton value="option1">Option 1</OptionButton>
          <OptionButton value="option2">Option 2</OptionButton>
          <OptionButton value="option3">Option 3</OptionButton>
        </div>
      </OptionGroup>
    </div>
  )
}
