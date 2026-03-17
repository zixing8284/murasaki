import { Dropdown } from 'murasaki-react98'

export default function DemoBasicDropdown(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <Dropdown
        name="color"
        label="Color:"
        options={[
          { value: 'red', label: 'Red' },
          { value: 'green', label: 'Green' },
          { value: 'blue', label: 'Blue' },
          { value: 'yellow', label: 'Yellow' },
        ]}
        defaultValue="red"
        width={200}
      />
      <Dropdown
        name="disabled-example"
        label="Disabled:"
        options={[{ value: 'none', label: 'No options' }]}
        disabled
        width={200}
      />
    </div>
  )
}
