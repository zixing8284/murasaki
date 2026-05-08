'use client'

import { OptionButton, OptionGroup } from '@murasaki/react98'
import { useState } from 'react'

export function OptionButtonBasicDemo(): React.ReactElement {
  const [choice, setChoice] = useState('compact')

  return (
    <OptionGroup name="density" value={choice} onValueChange={setChoice}>
      <div className="flex flex-col gap-2">
        <OptionButton value="compact">Compact</OptionButton>
        <OptionButton value="comfortable">Comfortable</OptionButton>
        <OptionButton value="disabled" disabled>Disabled</OptionButton>
      </div>
    </OptionGroup>
  )
}
