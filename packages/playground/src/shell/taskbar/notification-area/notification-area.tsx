import { DisplayPropertiesIcon } from './display-properties-icon'
import { NetworkIcon } from './network-icon'
import { SystemClock } from './system-clock'

export function NotificationArea(): React.ReactElement {
  return (
    <div className="h-5.5 px-0.5 flex flex-row items-center border-l border-l-[#7b7b7b] border-t border-t-[#7b7b7b] border-r border-r-white border-b border-b-white mt-px truncate">
      <NetworkIcon />
      <DisplayPropertiesIcon />
      <SystemClock />
    </div>
  )
}
