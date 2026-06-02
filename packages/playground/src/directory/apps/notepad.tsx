export function Notepad(): React.ReactElement {
  return (
    <textarea
      id="notepad-textarea"
      aria-label="Notepad text area"
      className="size-full resize-none border-none outline-none bg-(--window) p-1"
      placeholder="Type here..."
    />
  )
}
