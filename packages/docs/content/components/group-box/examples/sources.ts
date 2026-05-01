export const groupBoxBasicSource = String.raw`import { GroupBox, OptionButton, OptionGroup } from 'murasaki-react98'
import { useState } from 'react'

export function GroupBoxBasicExample(): React.ReactElement {
  const [mode, setMode] = useState('window')

  return (
    <GroupBox label="Open mode" className="w-64">
      <OptionGroup name="open-mode" selectedValue={mode} onChange={setMode}>
        <div className="flex flex-col gap-2">
          <OptionButton value="window">Open in window</OptionButton>
          <OptionButton value="tab">Open in tab</OptionButton>
          <OptionButton value="disabled" disabled>Disabled option</OptionButton>
        </div>
      </OptionGroup>
    </GroupBox>
  )
}`
