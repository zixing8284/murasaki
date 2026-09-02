'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@murasaki-io/react98'

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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label htmlFor="select-country">Country:</label>
      <Select name="country" defaultValue="cn">
        <SelectTrigger id="select-country" className="w-[220px]">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent maxHeight={96}>
          {countryOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
