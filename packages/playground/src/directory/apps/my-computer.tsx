import type { ProcessComponentProps } from '../../contexts/process'
import { OptionButton, OptionGroup } from 'murasaki-react98'
import { useState } from 'react'
import { RndWindow } from '../../shell/window/rnd-window'

export function MyComputer({ windowId }: ProcessComponentProps): React.ReactElement | null {
  const [selected, setSelected] = useState('option1')

  return (
    <RndWindow windowId={windowId} className="top-[10%] left-[10%]">
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
    </RndWindow>
  )
}
