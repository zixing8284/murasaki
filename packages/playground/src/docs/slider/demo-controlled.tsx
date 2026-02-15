import { Slider } from 'murasaki-react98'
import { useState } from 'react'

export default function DemoControlledSlider(): React.ReactElement {
  const [value, setValue] = useState(30)

  return (
    <div className="flex flex-col gap-2">
      <p>
        Value:
        {value}
      </p>
      <Slider
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        boxIndicator
        ticks={[
          { value: 0, label: '0' },
          { value: 25 },
          { value: 50, label: '50' },
          { value: 75 },
          { value: 100, label: '100' },
        ]}
      />
    </div>
  )
}
