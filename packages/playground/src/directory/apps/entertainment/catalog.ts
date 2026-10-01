import { assetPath } from '../../../lib/asset-path'

/** A single entry in the local Entertainment Center catalog. */
export interface GameMeta {
  id: string
  title: string
  genre: string
  controls: string
  description: string
  /** SWF filename relative to the games folder. */
  file: string
  /** Native stage width in px. */
  width: number
  /** Native stage height in px. */
  height: number
}

const GAMES_ROOT = '/programs/entertainment/games'

/** Public URL of a game's SWF, resolved against Vite's deploy base. */
export function gameFileUrl(file: string): string {
  return assetPath(`${GAMES_ROOT}/${file}`)
}

/** Fetch the bundled catalog manifest. */
export async function loadCatalog(signal?: AbortSignal): Promise<GameMeta[]> {
  const res = await fetch(assetPath(`${GAMES_ROOT}/catalog.json`), { signal })
  if (!res.ok)
    throw new Error(`Failed to load catalog (${res.status})`)
  const data = (await res.json()) as { games?: GameMeta[] }
  return data.games ?? []
}
