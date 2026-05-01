'use client'

import { Button, Tooltip } from 'murasaki-react98'

export function TooltipBasicExample(): React.ReactElement {
  return (
    <div className="flex gap-3">
      <Tooltip text="Save changes" delay={150}>
        <Button>Save</Button>
      </Tooltip>
      <Tooltip text="Opens below the control" side="bottom">
        <Button>Help</Button>
      </Tooltip>
    </div>
  )
}
