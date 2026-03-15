import { DisplayPropertiesIcon } from './display-properties-icon'
import { NetworkIcon } from './network-icon'
import { SystemClock } from './system-clock'

export function NotificationArea(): React.ReactElement {
  return (
    <div className="h-5.5 px-0.5 flex flex-row items-center border-l border-l-(--button-shadow) border-t border-t-(--button-shadow) border-r border-r-(--button-hilight) border-b border-b-(--button-hilight) mt-px truncate">
      <NetworkIcon />
      <DisplayPropertiesIcon />
      <SystemClock />
    </div>
  )
}
