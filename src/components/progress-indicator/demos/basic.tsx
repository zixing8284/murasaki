import { ProgressIndicator } from '../progress-indicator'

export function BasicDemo(): React.ReactElement {
  return (
    <div className="flex w-80 flex-col gap-4">
      <ProgressIndicator value={0} />
      <ProgressIndicator value={25} />
      <ProgressIndicator value={50} />
      <ProgressIndicator value={75} />
      <ProgressIndicator value={100} />
    </div>
  )
}
