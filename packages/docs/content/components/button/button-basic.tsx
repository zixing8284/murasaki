'use client'

import { Button } from '@murasaky/react98'

export function ButtonBasicDemo(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <Button primary>Click Me</Button>
      <Button>Cancel</Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}
