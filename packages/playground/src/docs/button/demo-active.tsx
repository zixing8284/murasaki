import { Button } from 'murasaki-react98'
import { useState } from 'react'

export default function DemoActiveButton(): React.ReactElement {
  const [active, setActive] = useState(false)

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <Button active={active} onClick={() => setActive(!active)}>
        {active ? 'Active (pressed)' : 'Inactive'}
      </Button>
      <Button active>Always Active</Button>
      <Button>Normal</Button>
    </div>
  )
}
