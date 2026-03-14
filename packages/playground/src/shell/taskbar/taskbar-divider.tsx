export function TaskbarDivider(): React.ReactElement {
  return (
    <div className="flex items-center mx-0.5 gap-px">
      <div className="h-5.5 w-px border-l border-l-btn-shadow border-r border-r-btn-hilight" />
      <div className="shadow-raised h-5 w-1" />
    </div>
  )
}
