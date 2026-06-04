'use client'

import { Select } from '@murasaky/react98'

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

export function SelectScrollableDemo(): React.ReactElement {
  return (
    <Select name="country" label="Country:" options={countryOptions} defaultValue="cn" menuMaxHeight={96} width={220} />
  )
}
