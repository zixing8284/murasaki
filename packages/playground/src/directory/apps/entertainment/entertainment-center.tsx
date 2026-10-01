import type { ReactElement } from 'react'
import type { AppId } from '../../../contexts/process/directory'
import { useState } from 'react'
import { IconTile } from '../../../components/icon-tile'
import { APP_ID } from '../../../contexts/process/directory'
import { useProcessActions } from '../../../contexts/process/hooks'
import { assetPath } from '../../../lib/asset-path'
import { ICON } from '../../../lib/icons'

interface GameEntry {
  appId: AppId
  label: string
  icon: string
}

const GAMES: GameEntry[] = [
  { appId: APP_ID.GAME_MINESWEEPER, label: 'Minesweeper', icon: ICON.minesweeper.lg },
  { appId: APP_ID.GAME_SOLITAIRE, label: 'Solitaire', icon: ICON.solitaire.lg },
  { appId: APP_ID.GAME_FREECELL, label: 'FreeCell', icon: ICON.freecell.lg },
  { appId: APP_ID.GAME_SKIFREE, label: 'SkiFree', icon: ICON.skifree.lg },
]

export function EntertainmentCenter(): ReactElement {
  const { open } = useProcessActions()
  const [selectedId, setSelectedId] = useState<AppId | null>(null)

  const selected = GAMES.find(game => game.appId === selectedId)

  return (
    <div className="flex h-full flex-col bg-(--button-face)">
      <div
        className="min-h-0 flex-1 overflow-auto bg-(--window) text-(--window-text) shadow-(--shadow-sunken)"
        onPointerDown={() => setSelectedId(null)}
      >
        <div className="flex flex-wrap content-start gap-1 p-2">
          {GAMES.map(game => (
            <button
              key={game.appId}
              type="button"
              className="pointer-events-none w-18 outline-none"
              onPointerDown={event => event.stopPropagation()}
              onClick={() => setSelectedId(game.appId)}
              onDoubleClick={() => open(game.appId)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  open(game.appId)
                }
              }}
            >
              <IconTile
                icon={<img src={assetPath(game.icon)} alt="" className="size-8 shrink-0 pixelated" />}
                label={game.label}
                selected={selectedId === game.appId}
                variant="tile"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-0.5 flex shrink-0 gap-0.5">
        <div className="flex-1 px-2 py-0.5 text-(--window-text) shadow-(--shadow-status-field)">
          {selected ? `${selected.label} — double-click to play` : `${GAMES.length} games`}
        </div>
      </div>
    </div>
  )
}
