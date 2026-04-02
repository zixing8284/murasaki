import { Dropdown } from 'murasaki-react98'

export default function DemoScrollbarDropdown(): React.ReactElement {
  return (
    <Dropdown
      name="country"
      label="Country:"
      defaultValue="cn"
      width={200}
      options={[
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
      ]}
    />
  )
}
