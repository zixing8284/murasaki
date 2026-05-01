'use client'

import { NumberBox } from 'murasaki-react98'
import { useState } from 'react'

export function NumberBoxBasicExample(): React.ReactElement {
  const [quantity, setQuantity] = useState(3)

  return (
    <div className="flex flex-col gap-3">
      <NumberBox label="Copies" min={1} max={10} value={quantity} onChange={setQuantity} />
      <NumberBox label="Disabled" defaultValue={5} disabled />
    </div>
  )
}
