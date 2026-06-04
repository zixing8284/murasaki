'use client'

import { GroupBox, OptionButton, OptionGroup } from '@murasaky/react98'
import { useState } from 'react'

export function GroupBoxBasicDemo(): React.ReactElement {
  const [mode, setMode] = useState('window')

  return (
    <GroupBox label="Open mode" className="w-64">
      <OptionGroup name="open-mode" value={mode} onValueChange={setMode}>
        <div className="flex flex-col gap-2">
          <OptionButton value="window">Open in window</OptionButton>
          <OptionButton value="tab">Open in tab</OptionButton>
          <OptionButton value="disabled" disabled>Disabled option</OptionButton>
        </div>
      </OptionGroup>
    </GroupBox>
  )
}
