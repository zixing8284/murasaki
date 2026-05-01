'use client'

import { Checkbox } from 'murasaki-react98'
import { useState } from 'react'

export function CheckboxBasicExample(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Checkbox>Enable notifications</Checkbox>
      <Checkbox defaultChecked>Remember me</Checkbox>
      <Checkbox disabled>Unavailable option</Checkbox>
      <Checkbox disabled defaultChecked>Disabled checked</Checkbox>
    </div>
  )
}

export function CheckboxControlledExample(): React.ReactElement {
  const [checked, setChecked] = useState(false)

  return (
    <Checkbox checked={checked} onChange={event => setChecked(event.target.checked)}>
      {checked ? 'Checked' : 'Unchecked'}
    </Checkbox>
  )
}
