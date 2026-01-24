import { TextBox } from '../text-box'

export function LabelPositions(): React.ReactElement {
  return (
    <div className="bg-btn-face flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">Label Position: left (default)</p>
        <TextBox label="First Name" placeholder="John" />
        <TextBox label="Last Name" placeholder="Doe" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">Label Position: top</p>
        <div className="flex gap-4">
          <TextBox
            className="w-[200px]"
            label="Address (Line 1)"
            labelPosition="top"
            placeholder="123 Main St"
          />
          <TextBox
            className="w-[200px]"
            label="Address (Line 2)"
            labelPosition="top"
            placeholder="Apt 4B"
          />
        </div>
      </div>
    </div>
  )
}
