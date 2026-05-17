export function Notepad(): React.ReactElement {
  return (
    <textarea
      id="notepad-textarea"
      className="w-full h-full resize-none border-none outline-none bg-(--window) p-1"
      placeholder="Type here..."
    />
  )
}
