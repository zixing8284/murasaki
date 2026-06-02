import { APP_ID } from '../../../contexts/process/directory'
import { useProcessActions } from '../../../contexts/process/hooks'
import { AppIcon } from '../../app-icon'

export function DisplayPropertiesIcon(): React.ReactElement {
  const { open } = useProcessActions()

  return (
    <span
      role="button"
      tabIndex={0}
      className="mx-px cursor-pointer"
      title="Display Properties"
      onClick={(e) => {
        e.stopPropagation()
        open(APP_ID.DISPLAY_PROPERTIES)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          open(APP_ID.DISPLAY_PROPERTIES)
        }
      }}
    >
      <AppIcon appId={APP_ID.DISPLAY_PROPERTIES} size="sm" />
    </span>
  )
}
