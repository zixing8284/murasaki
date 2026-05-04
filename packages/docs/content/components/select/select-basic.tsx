'use client'

import { Select } from 'murasaki-react98'

const colorOptions = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'yellow', label: 'Yellow' },
]

export function SelectBasicDemo(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 260 }}>
      <Select name="color" label="Color:" options={colorOptions} defaultValue="red" width={220} />
      <Select
        name="disabled-example"
        label="Disabled:"
        options={[{ value: 'none', label: 'No options' }]}
        disabled
        width={220}
      />
    </div>
  )
}
