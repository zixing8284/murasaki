'use client'

import { Slider } from '@murasaki-io/react98'
import { useState } from 'react'

export function SliderFillDemo(): React.ReactElement {
  const [value, setValue] = useState(40)

  return (
    <div className="flex w-72 flex-col gap-6">
      <Slider fill value={value} onValueChange={setValue} />
      <div className="flex h-40 items-center gap-6">
        <Slider fill vertical defaultValue={60} />
      </div>
    </div>
  )
}
