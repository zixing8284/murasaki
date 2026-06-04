'use client'

import { Checkbox } from '@murasaky/react98'
import { useState } from 'react'

export function CheckboxControlledDemo(): React.ReactElement {
  const [checked, setChecked] = useState(false)

  return (
    <Checkbox checked={checked} onCheckedChange={setChecked}>
      {checked ? 'Checked' : 'Unchecked'}
    </Checkbox>
  )
}
