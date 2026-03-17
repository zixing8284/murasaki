import { Checkbox } from 'murasaki-react98'
import { useState } from 'react'

export default function DemoControlledCheckbox(): React.ReactElement {
  const [checked, setChecked] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <Checkbox
        checked={checked}
        onChange={e => setChecked(e.target.checked)}
      >
        {checked ? 'Checked' : 'Unchecked'}
      </Checkbox>
    </div>
  )
}
