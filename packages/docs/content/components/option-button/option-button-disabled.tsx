'use client'

import { OptionButton, OptionGroup } from '@murasaki-io/react98'
import { useState } from 'react'

export function OptionButtonDisabledDemo(): React.ReactElement {
  const [choice, setChoice] = useState('selected-disabled')

  return (
    <OptionGroup name="disabled-demo" value={choice} onValueChange={setChoice}>
      <div className="flex flex-col gap-2">
        <OptionButton value="enabled">Enabled</OptionButton>
        <OptionButton value="selected-disabled" disabled>Disabled (selected)</OptionButton>
        <OptionButton value="unselected-disabled" disabled>Disabled (unselected)</OptionButton>
      </div>
    </OptionGroup>
  )
}
