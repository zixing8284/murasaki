export const sliderBasicSource = String.raw`import { Slider } from 'murasaki-react98'
import { useState } from 'react'

export function SliderBasicExample(): React.ReactElement {
  const [value, setValue] = useState(45)

  return (
    <div className="flex w-72 flex-col gap-6">
      <Slider
        value={value}
        onChange={event => setValue(Number(event.target.value))}
        ticks={[{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100, label: '100' }]}
      />
      <div className="flex h-40 items-center gap-6">
        <Slider vertical defaultValue={35} />
        <Slider boxIndicator defaultValue={70} />
      </div>
    </div>
  )
}`
