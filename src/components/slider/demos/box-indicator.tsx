import { useState } from 'react'

import { Slider } from '../slider'

export function BoxIndicator(): React.ReactElement {
  const [value1, setValue1] = useState(50)
  const [value2, setValue2] = useState(50)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="default-indicator">
          Default Indicator:
          {value1}
        </label>
        <Slider
          id="default-indicator"
          min={0}
          max={100}
          value={value1}
          onChange={(e) => {
            setValue1(Number(e.target.value))
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="box-indicator">
          Box Indicator:
          {value2}
        </label>
        <Slider
          id="box-indicator"
          min={0}
          max={100}
          value={value2}
          onChange={(e) => {
            setValue2(Number(e.target.value))
          }}
          boxIndicator
        />
      </div>
    </div>
  )
}
