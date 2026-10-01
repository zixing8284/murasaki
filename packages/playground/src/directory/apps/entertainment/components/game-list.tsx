import type { ReactElement } from 'react'
import type { LibraryEntry } from '../use-game-library'
import { ScrollArea } from '@murasaki-io/react98'

interface GameListProps {
  entries: LibraryEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function GameList({ entries, selectedId, onSelect }: GameListProps): ReactElement {
  return (
    <div className="flex w-52 shrink-0 flex-col bg-(--button-face) p-1">
      <div className="mb-1 px-1 font-bold text-(--window-text)">Game Library</div>
      <ScrollArea className="min-h-0 flex-1 bg-(--window) shadow-(--shadow-sunken)">
        <ul className="p-0.5">
          {entries.map((game) => {
            const selected = game.id === selectedId
            return (
              <li key={game.id}>
                <button
                  type="button"
                  onClick={() => onSelect(game.id)}
                  className={`flex w-full items-center gap-1 py-1 pr-2 text-left ${
                    selected ? 'bg-(--hilight) text-(--hilight-text)' : 'text-(--window-text)'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate pl-2">{game.title}</span>
                  {game.installed
                    ? (
                        <span
                          aria-label="Installed"
                          className={`shrink-0 leading-none ${selected ? 'text-(--hilight-text)' : 'text-(--button-shadow)'}`}
                        >
                          ●
                        </span>
                      )
                    : null}
                </button>
              </li>
            )
          })}
        </ul>
      </ScrollArea>
    </div>
  )
}
