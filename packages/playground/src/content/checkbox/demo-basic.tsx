import { Checkbox } from 'murasaki-react98'

export default function DemoBasicCheckbox(): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <Checkbox>Enable notifications</Checkbox>
      <Checkbox defaultChecked>Remember me</Checkbox>
      <Checkbox disabled>Unavailable option</Checkbox>
      <Checkbox disabled defaultChecked>Disabled checked</Checkbox>
    </div>
  )
}
