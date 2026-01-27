import { Button } from '../button'

export function States(): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <Button>Normal</Button>
        <span className="text-xs">default</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Button active>Active</Button>
        <span className="text-xs">active (pressed)</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Button disabled>Disabled</Button>
        <span className="text-xs">disabled</span>
      </div>
    </div>
  )
}
