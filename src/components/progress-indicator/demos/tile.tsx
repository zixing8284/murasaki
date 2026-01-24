import { ProgressIndicator } from '../progress-indicator'

export function TileDemo(): React.ReactElement {
  return (
    <div className="flex w-80 flex-col gap-4">
      <ProgressIndicator value={0} variant="tile" />
      <ProgressIndicator value={25} variant="tile" />
      <ProgressIndicator value={50} variant="tile" />
      <ProgressIndicator value={75} variant="tile" />
      <ProgressIndicator value={100} variant="tile" />
    </div>
  )
}
