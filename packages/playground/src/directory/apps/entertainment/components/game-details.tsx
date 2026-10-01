import type { ReactElement } from 'react'
import type { LibraryEntry } from '../use-game-library'
import { Button } from '@murasaki-io/react98'

function formatBytes(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

interface GameDetailsProps {
  game: LibraryEntry
  onInstall: (id: string) => void
  onRemove: (id: string) => void
  onPlay: (id: string) => void
}

export function GameDetails({ game, onInstall, onRemove, onPlay }: GameDetailsProps): ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-(--button-face) p-6 text-center">
      <div className="font-bold text-(--window-text)">{game.title}</div>
      <div className="text-(--button-shadow)">
        {game.genre}
        {' · '}
        {game.controls}
      </div>
      <p className="max-w-xs text-(--window-text)">{game.description}</p>

      <div className="flex items-center gap-2 pt-1">
        {game.installed
          ? (
              <>
                <Button onClick={() => onPlay(game.id)}>Play</Button>
                <Button onClick={() => onRemove(game.id)}>Remove</Button>
              </>
            )
          : (
              <Button disabled={game.installing} onClick={() => onInstall(game.id)}>
                {game.installing ? 'Downloading…' : 'Download'}
              </Button>
            )}
      </div>

      <div className="text-(--button-shadow)">
        {game.installed && game.byteLength != null
          ? `Installed · ${formatBytes(game.byteLength)}`
          : 'Not installed — download to play offline'}
      </div>
    </div>
  )
}
