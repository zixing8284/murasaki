import { useState } from 'react'

import { NumberBox } from '../number-box'

export function WithConstraints(): React.ReactElement {
  const [quantity, setQuantity] = useState<number>(1)
  const [percentage, setPercentage] = useState<number>(50)
  const [temperature, setTemperature] = useState<number>(20)

  return (
    <div className="flex flex-col gap-4 p-4">
      <NumberBox
        label="Quantity (1-10):"
        max={10}
        min={1}
        onChange={setQuantity}
        value={quantity}
      />

      <NumberBox
        label="Percentage (0-100):"
        max={100}
        min={0}
        onChange={setPercentage}
        step={5}
        value={percentage}
      />

      <NumberBox
        label="Temperature (-50 to 50):"
        max={50}
        min={-50}
        onChange={setTemperature}
        step={0.5}
        value={temperature}
      />

      <div className="text-sm text-btn-text">
        <div>
          Quantity:
          {quantity}
        </div>
        <div>
          Percentage:
          {percentage}
          %
        </div>
        <div>
          Temperature:
          {temperature}
          °C
        </div>
      </div>
    </div>
  )
}
