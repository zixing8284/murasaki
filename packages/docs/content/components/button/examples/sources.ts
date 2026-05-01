export const buttonBasicSource = `import { Button } from 'murasaki-react98'

export function ButtonBasicExample(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <Button primary>Click Me</Button>
      <Button>Cancel</Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}`

export const buttonStateSource = `import { Button } from 'murasaki-react98'
import { useState } from 'react'

export function ButtonStateExample(): React.ReactElement {
  const [active, setActive] = useState(false)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <Button active={active} onClick={() => setActive(value => !value)}>
        {active ? 'Pressed' : 'Press Me'}
      </Button>
      <Button active>Always Active</Button>
    </div>
  )
}`
