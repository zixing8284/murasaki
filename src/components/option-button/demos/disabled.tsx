import { useState } from 'react'

import { OptionButton } from '../option-button'
import OptionGroup from '../option-group'

export function Disabled(): React.ReactElement {
  const [selected, setSelected] = useState('option1')

  return (
    <OptionGroup
      name="disabled-demo"
      onChange={setSelected}
      selectedValue={selected}
    >
      <div className="flex flex-col gap-2">
        <OptionButton value="option1">Enabled Option</OptionButton>
        <OptionButton disabled value="option2">
          Disabled Option
        </OptionButton>
        <OptionButton disabled value="option3">
          Another Disabled
        </OptionButton>
      </div>
    </OptionGroup>
  )
}
