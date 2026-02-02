import type { TickMark } from '../slider'

import * as React from 'react'
import { useState } from 'react'
import { Slider } from '../slider'

const volumeTicks: TickMark[] = [
  { value: 0, label: 'Low' },
  { value: 50 },
  { value: 100, label: 'High' },
]

const fineTicks: TickMark[] = [
  { value: 0 },
  { value: 25 },
  { value: 50 },
  { value: 75 },
  { value: 100 },
]

export function Vertical(): React.ReactElement {
  const [value1, setValue1] = useState(30)
  const [value2, setValue2] = useState(70)
  const [value3, setValue3] = useState(50)

  return (
    <div className="flex gap-16 p-4">
      <div className="flex flex-col items-center gap-2">
        <Slider
          id="v-slider-1"
          min={0}
          max={100}
          value={value1}
          onChange={(e) => {
            setValue1(Number(e.target.value))
          }}
          vertical
          className="h-[150px]"
        />
        <span className="w-24 text-center tabular-nums">
          Default:
          {value1}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Slider
          id="v-slider-2"
          min={0}
          max={100}
          value={value2}
          onChange={(e) => {
            setValue2(Number(e.target.value))
          }}
          vertical
          boxIndicator
          className="h-[150px]"
        />
        <span className="w-24 text-center tabular-nums">
          Box:
          {value2}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Slider
          id="v-slider-3"
          min={0}
          max={100}
          value={value3}
          onChange={(e) => {
            setValue3(Number(e.target.value))
          }}
          vertical
          ticks={volumeTicks}
          className="h-[150px]"
        />
        <span className="w-30 text-center tabular-nums">
          With Labels:
          {' '}
          {value3}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Slider
          id="v-slider-4"
          min={0}
          max={100}
          step={25}
          defaultValue={50}
          vertical
          boxIndicator
          ticks={fineTicks}
          className="h-[150px]"
        />
        <span className="w-24 text-center">Fine Ticks</span>
      </div>
    </div>
  )
}
