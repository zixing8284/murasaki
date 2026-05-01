export const optionButtonBasicSource = String.raw`import { OptionButton, OptionGroup } from 'murasaki-react98'
import { useState } from 'react'

export function OptionButtonBasicExample(): React.ReactElement {
  const [choice, setChoice] = useState('compact')

  return (
    <OptionGroup name="density" selectedValue={choice} onChange={setChoice}>
      <div className="flex flex-col gap-2">
        <OptionButton value="compact">Compact</OptionButton>
        <OptionButton value="comfortable">Comfortable</OptionButton>
        <OptionButton value="disabled" disabled>Disabled</OptionButton>
      </div>
    </OptionGroup>
  )
}`
