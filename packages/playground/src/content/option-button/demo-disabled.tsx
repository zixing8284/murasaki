import { OptionButton, OptionGroup } from 'murasaki-react98'

export default function DemoDisabledOptionButton(): React.ReactElement {
  return (
    <OptionGroup name="disabled-demo" selectedValue="checked">
      <div className="flex flex-col gap-2">
        <OptionButton value="unchecked" disabled>Disabled unchecked</OptionButton>
        <OptionButton value="checked" disabled>Disabled checked</OptionButton>
      </div>
    </OptionGroup>
  )
}
