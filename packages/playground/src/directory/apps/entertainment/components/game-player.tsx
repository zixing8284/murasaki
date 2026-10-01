import type { ReactElement } from 'react'
import type { GameMeta } from '../catalog'
import { Button } from '@murasaki-io/react98'
import { useEffect, useRef, useState } from 'react'
import { getInstalledGame } from '../game-store'
import { loadRuffle } from '../use-ruffle'

interface GamePlayerProps {
  game: GameMeta
  /** Bumped by the parent to force a fresh restart of the same game. */
  token: number
  onStop: () => void
  onRestart: () => void
}

export function GamePlayer({ game, token, onStop, onRestart }: GamePlayerProps): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    let playerEl: HTMLElement | null = null

    void (async () => {
      try {
        setError(null)
        const record = await getInstalledGame(game.id)
        if (!record)
          throw new Error('This game is not installed')
        const source = await loadRuffle()
        const host = hostRef.current
        if (cancelled || !host)
          return
        const player = source.createPlayer()
        player.style.width = '100%'
        player.style.height = '100%'
        player.config = {
          autoplay: 'on',
          unmuteOverlay: 'hidden',
          contextMenu: 'off',
          splashScreen: false,
          warnOnUnsupportedContent: false,
          logLevel: 'error',
        }
        host.appendChild(player)
        playerEl = player
        objectUrl = URL.createObjectURL(
          new Blob([record.bytes], { type: 'application/x-shockwave-flash' }),
        )
        player.load(objectUrl)
      }
      catch (cause) {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : String(cause))
      }
    })()

    return () => {
      cancelled = true
      playerEl?.remove()
      if (objectUrl)
        URL.revokeObjectURL(objectUrl)
    }
  }, [game.id, token])

  return (
    <div className="flex h-full flex-col bg-(--button-face)">
      <div className="flex shrink-0 items-center gap-2 border-b border-(--button-shadow) p-1">
        <Button onClick={onStop}>Stop</Button>
        <Button onClick={onRestart}>Restart</Button>
        <span className="ml-auto pr-1 text-(--button-shadow)">{game.controls}</span>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
        <div ref={hostRef} className="h-full w-full" />
        {error
          ? (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-(--desktop-text)">
                {error}
              </div>
            )
          : null}
      </div>
    </div>
  )
}
