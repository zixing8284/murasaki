'use client'

import { Slider } from '@murasaki-io/react98'

export function SliderDisabledDemo(): React.ReactElement {
  return (
    <div className="flex w-72 flex-col gap-6">
      <Slider
        disabled
        defaultValue={45}
        ticks={[{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100, label: '100' }]}
      />
      <div className="flex h-40 items-center gap-6">
        <Slider disabled vertical defaultValue={35} />
        <Slider disabled boxIndicator className="w-40" defaultValue={70} />
      </div>
    </div>
  )
}
