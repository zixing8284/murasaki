import { Slider } from 'murasaki-react98'

export default function DemoBasicSlider(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <p className="mb-1">Default slider:</p>
      <Slider min={0} max={100} defaultValue={50} />
      <p className="mb-1">With tick marks:</p>
      <Slider
        min={0}
        max={10}
        step={1}
        defaultValue={5}
        ticks={[
          { value: 0, label: '0' },
          { value: 5, label: '5' },
          { value: 10, label: '10' },
        ]}
      />
    </div>
  )
}
