import { APP_ID, useProcessActions } from '../../../contexts/process'
import { AppIcon } from '../../app-icon'

export function DisplayPropertiesIcon(): React.ReactElement {
  const { open } = useProcessActions()

  return (
    <span
      className="mx-px cursor-pointer"
      title="Display Properties"
      onClick={(e) => {
        e.stopPropagation()
        open(APP_ID.DISPLAY_PROPERTIES)
      }}
    >
      <AppIcon appId={APP_ID.DISPLAY_PROPERTIES} size="sm" />
    </span>
  )
}
