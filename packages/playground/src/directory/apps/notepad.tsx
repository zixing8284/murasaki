import { TextBox } from '@murasaki-io/react98'

export function Notepad(): React.ReactElement {
  return (
    <TextBox
      multiline
      id="notepad-textarea"
      aria-label="Notepad text area"
      placeholder="Type here..."
      className="size-full"
    />
  )
}
