'use client'

import { Dropdown, DropdownNative } from 'murasaki-react98'

const colorOptions = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'yellow', label: 'Yellow' },
]

const countryOptions = [
  { value: 'cn', label: 'China' },
  { value: 'us', label: 'United States' },
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'kr', label: 'South Korea' },
  { value: 'br', label: 'Brazil' },
]

export function DropdownBasicExample(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 260 }}>
      <Dropdown name="color" label="Color:" options={colorOptions} defaultValue="red" width={220} />
      <Dropdown
        name="disabled-example"
        label="Disabled:"
        options={[{ value: 'none', label: 'No options' }]}
        disabled
        width={220}
      />
    </div>
  )
}

export function DropdownNativeExample(): React.ReactElement {
  return (
    <DropdownNative name="size" label="Size:" defaultValue="medium">
      <option value="small">Small</option>
      <option value="medium">Medium</option>
      <option value="large">Large</option>
    </DropdownNative>
  )
}

export function DropdownScrollableExample(): React.ReactElement {
  return (
    <Dropdown name="country" label="Country:" options={countryOptions} defaultValue="cn" width={220} />
  )
}
