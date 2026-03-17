import { DropdownNative } from 'murasaki-react98'

export default function DemoNativeDropdown(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <DropdownNative name="size" label="Size:" defaultValue="medium">
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </DropdownNative>
    </div>
  )
}
