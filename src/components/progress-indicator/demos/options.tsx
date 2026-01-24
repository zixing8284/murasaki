import { ProgressIndicator } from '../progress-indicator'

export function OptionsDemo(): React.ReactElement {
  return (
    <div className="flex w-80 flex-col gap-4">
      <p className="text-sm">With percentage label (default):</p>
      <ProgressIndicator value={65} />

      <p className="text-sm">Without percentage label:</p>
      <ProgressIndicator value={65} hideValue />

      <p className="text-sm">Without shadow:</p>
      <ProgressIndicator value={65} shadow={false} />

      <p className="text-sm">Tile without shadow:</p>
      <ProgressIndicator value={65} variant="tile" shadow={false} />
    </div>
  )
}
