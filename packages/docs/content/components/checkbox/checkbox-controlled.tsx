'use client'

import { Checkbox } from '@murasaki/react98'
import { useState } from 'react'

export function CheckboxControlledDemo(): React.ReactElement {
  const [checked, setChecked] = useState(false)

  return (
    <Checkbox checked={checked} onChange={event => setChecked(event.target.checked)}>
      {checked ? 'Checked' : 'Unchecked'}
    </Checkbox>
  )
}
