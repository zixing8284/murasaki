export function TaskbarDivider(): React.ReactElement {
  return (
    <div className="flex items-center mx-0.5 gap-px">
      <div className="h-5.5 w-px border-l border-l-[#808080] border-r border-r-white shadow-[1px_0_0_0_rgba(255,255,255,0.3)]" />
      <div className="shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] h-5 w-1" />
    </div>
  )
}
