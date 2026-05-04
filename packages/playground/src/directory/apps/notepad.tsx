export function Notepad(): React.ReactElement {
  return (
    <textarea
      className="w-full h-full resize-none border-none outline-none bg-(--window) p-1 font-mono text-xs"
      placeholder="Type here..."
    />
  )
}
