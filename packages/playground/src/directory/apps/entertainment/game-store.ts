/**
 * IndexedDB-backed store for downloaded games. Mirrors the "download once,
 * play offline" model: a game's SWF bytes are fetched from the bundled local
 * resources and persisted here, then replayed from storage without any network.
 */

/** A game persisted in the local library, including its SWF payload. */
export interface InstalledGame {
  id: string
  title: string
  file: string
  bytes: ArrayBuffer
  byteLength: number
  installedAt: number
}

/** Lightweight installed-game descriptor (no payload). */
export interface InstalledGameMeta {
  id: string
  byteLength: number
  installedAt: number
}

const DB_NAME = 'murasaki-entertainment'
const DB_VERSION = 1
const STORE = 'games'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE))
        db.createObjectStore(STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

function run<T>(mode: IDBTransactionMode, make: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(db => new Promise<T>((resolve, reject) => {
    const request = make(db.transaction(STORE, mode).objectStore(STORE))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }))
}

/** List installed games without loading their SWF payloads into memory. */
export async function listInstalledGames(): Promise<InstalledGameMeta[]> {
  const records = await run<InstalledGame[]>('readonly', store => store.getAll())
  return records.map(({ id, byteLength, installedAt }) => ({ id, byteLength, installedAt }))
}

/** Read a single installed game including its SWF bytes, for playback. */
export function getInstalledGame(id: string): Promise<InstalledGame | undefined> {
  return run<InstalledGame | undefined>('readonly', store => store.get(id))
}

/** Persist (or replace) an installed game. */
export function putInstalledGame(game: InstalledGame): Promise<IDBValidKey> {
  return run<IDBValidKey>('readwrite', store => store.put(game))
}

/** Remove an installed game from the library. */
export function removeInstalledGame(id: string): Promise<undefined> {
  return run<undefined>('readwrite', store => store.delete(id))
}
