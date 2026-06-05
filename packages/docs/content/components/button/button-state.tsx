'use client'

import { Button } from '@murasaki-io/react98'
import { useState } from 'react'

export function ButtonStateDemo(): React.ReactElement {
  const [active, setActive] = useState(false)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <Button active={active} onClick={() => setActive(value => !value)}>
        {active ? 'Pressed' : 'Press Me'}
      </Button>
      <Button active>Always Active</Button>
    </div>
  )
}
