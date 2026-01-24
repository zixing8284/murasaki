import React, { useState } from 'react'

import { Slider } from '../slider'

export function WithStep(): React.ReactElement {
  const [value, setValue] = useState(50)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="step-slider">
          Step 10:
          {value}
        </label>
        <Slider
          id="step-slider"
          min={0}
          max={100}
          step={10}
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value))
          }}
        />
      </div>
    </div>
  )
}
