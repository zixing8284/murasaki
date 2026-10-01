import type { GameMeta } from './catalog'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { gameFileUrl, loadCatalog } from './catalog'
import { listInstalledGames, putInstalledGame, removeInstalledGame } from './game-store'

/** A catalog game augmented with the viewer's local install state. */
export interface LibraryEntry extends GameMeta {
  installed: boolean
  installing: boolean
  byteLength?: number
}

export interface GameLibrary {
  status: 'loading' | 'ready' | 'error'
  error: string | null
  entries: LibraryEntry[]
  install: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

/**
 * Loads the bundled catalog, tracks which games are installed in IndexedDB,
 * and exposes install/remove actions. Downloading fetches a game's SWF from
 * the local resources and persists it for offline play.
 */
export function useGameLibrary(): GameLibrary {
  const [catalog, setCatalog] = useState<GameMeta[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [sizes, setSizes] = useState<Record<string, number>>({})
  const [installing, setInstalling] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    void (async () => {
      try {
        const [games, installed] = await Promise.all([
          loadCatalog(controller.signal),
          listInstalledGames(),
        ])
        if (!active)
          return
        setCatalog(games)
        setSizes(Object.fromEntries(installed.map(g => [g.id, g.byteLength])))
        setStatus('ready')
      }
      catch (cause) {
        if (!active || controller.signal.aborted)
          return
        setError(cause instanceof Error ? cause.message : String(cause))
        setStatus('error')
      }
    })()

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  const install = useCallback(async (id: string): Promise<void> => {
    const meta = catalog.find(game => game.id === id)
    if (!meta || installing[id])
      return
    setInstalling(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(gameFileUrl(meta.file))
      if (!res.ok)
        throw new Error(`Download failed (${res.status})`)
      const bytes = await res.arrayBuffer()
      await putInstalledGame({
        id: meta.id,
        title: meta.title,
        file: meta.file,
        bytes,
        byteLength: bytes.byteLength,
        installedAt: Date.now(),
      })
      setSizes(prev => ({ ...prev, [id]: bytes.byteLength }))
    }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
    finally {
      setInstalling((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }, [catalog, installing])

  const remove = useCallback(async (id: string): Promise<void> => {
    await removeInstalledGame(id)
    setSizes((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const entries = useMemo<LibraryEntry[]>(
    () => catalog.map(game => ({
      ...game,
      installed: game.id in sizes,
      installing: installing[game.id] ?? false,
      byteLength: sizes[game.id],
    })),
    [catalog, sizes, installing],
  )

  return { status, error, entries, install, remove }
}
