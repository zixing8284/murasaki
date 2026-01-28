import { useState } from 'react'

import { OptionButton } from '#/components/option-button/option-button'
import { OptionGroup } from '#/components/option-button/option-group'

import { GroupBox } from '../group-box'

export function MultipleGroups(): React.ReactElement {
  const [alignment, setAlignment] = useState('left')
  const [size, setSize] = useState('medium')

  return (
    <div className="flex gap-4">
      <GroupBox label="Alignment">
        <OptionGroup
          name="alignment"
          onChange={setAlignment}
          selectedValue={alignment}
        >
          <div className="flex flex-col gap-2">
            <OptionButton value="left">Left</OptionButton>
            <OptionButton value="center">Center</OptionButton>
            <OptionButton value="right">Right</OptionButton>
          </div>
        </OptionGroup>
      </GroupBox>

      <GroupBox label="Size">
        <OptionGroup name="size" onChange={setSize} selectedValue={size}>
          <div className="flex flex-col gap-2">
            <OptionButton value="small">Small</OptionButton>
            <OptionButton value="medium">Medium</OptionButton>
            <OptionButton value="large">Large</OptionButton>
          </div>
        </OptionGroup>
      </GroupBox>
    </div>
  )
}
