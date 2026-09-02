'use client'

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@murasaki-io/react98'

export function TooltipBasicDemo(): React.ReactElement {
  return (
    <div className="flex gap-3">
      <Tooltip delay={150}>
        <TooltipTrigger>
          <Button>Save</Button>
        </TooltipTrigger>
        <TooltipContent>Save changes</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button>Help</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Opens below the control</TooltipContent>
      </Tooltip>
    </div>
  )
}
