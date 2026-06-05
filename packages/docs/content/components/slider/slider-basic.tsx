'use client'

import { Slider } from '@murasaki-io/react98'
import { useState } from 'react'

export function SliderBasicDemo(): React.ReactElement {
  const [value, setValue] = useState(45)

  return (
    <div className="flex w-72 flex-col gap-6">
      <Slider
        value={value}
        onValueChange={setValue}
        ticks={[{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100, label: '100' }]}
      />
      <div className="flex h-40 items-center gap-6">
        <Slider vertical defaultValue={35} />
        <Slider boxIndicator className="w-40" defaultValue={70} />
      </div>
    </div>
  )
}
