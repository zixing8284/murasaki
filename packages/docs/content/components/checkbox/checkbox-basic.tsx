'use client'

import { Checkbox } from 'murasaki-react98'

export function CheckboxBasicDemo(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Checkbox>Enable notifications</Checkbox>
      <Checkbox defaultChecked>Remember me</Checkbox>
      <Checkbox disabled>Unavailable option</Checkbox>
      <Checkbox disabled defaultChecked>Disabled checked</Checkbox>
    </div>
  )
}
