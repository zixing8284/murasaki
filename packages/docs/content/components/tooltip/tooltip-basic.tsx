'use client'

import { Button, Tooltip } from '@murasaki-io/react98'

export function TooltipBasicDemo(): React.ReactElement {
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
