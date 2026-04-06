import { APP_ID, useProcessActions } from '../../../contexts/process'

export function DisplayPropertiesIcon(): React.ReactElement {
  const { open } = useProcessActions()

  return (
    <img
      className="mx-px cursor-pointer"
      src="/img/display_16.png"
      alt="Display Properties"
      title="Display Properties"
      onClick={(e) => {
        e.stopPropagation()
        open(APP_ID.DISPLAY_PROPERTIES)
      }}
    />
  )
}
