'use client'

import { Select, SelectNative } from 'murasaki-react98'

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
  { value: 'in', label: 'India' },
  { value: 'ru', label: 'Russia' },
  { value: 'it', label: 'Italy' },
  { value: 'mx', label: 'Mexico' },
]

export function SelectBasicExample(): React.ReactElement {
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

export function SelectNativeExample(): React.ReactElement {
  return (
    <SelectNative name="size" label="Size:" defaultValue="medium">
      <option value="small">Small</option>
      <option value="medium">Medium</option>
      <option value="large">Large</option>
    </SelectNative>
  )
}

export function SelectScrollableExample(): React.ReactElement {
  return (
    <Select name="country" label="Country:" options={countryOptions} defaultValue="cn" menuMaxHeight={96} width={220} />
  )
}
