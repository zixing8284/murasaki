import { Slider } from 'murasaki-react98'

export default function DemoDisabledSlider(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <p className="mb-1">Disabled slider:</p>
      <Slider min={0} max={100} defaultValue={50} disabled />
      <p className="mb-1">Disabled with tick marks:</p>
      <Slider
        min={0}
        max={10}
        step={1}
        defaultValue={5}
        disabled
        ticks={[
          { value: 0, label: '0' },
          { value: 5, label: '5' },
          { value: 10, label: '10' },
        ]}
      />
      <p className="mb-1">Disabled box indicator:</p>
      <Slider min={0} max={100} defaultValue={30} disabled boxIndicator />
    </div>
  )
}
