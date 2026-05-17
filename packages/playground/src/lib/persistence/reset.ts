import {
  PLAYGROUND_CACHE_PREFIX,
  PLAYGROUND_INDEXED_DB,
  PLAYGROUND_LOCAL_STORAGE_KEYS,
  PLAYGROUND_SESSION_STORAGE_KEYS,
} from './schema'
import { removeStorageItem } from './storage'

export interface PlaygroundResetStepResult {
  ok: boolean
  error?: unknown
}

export interface PlaygroundResetResult {
  storage: PlaygroundResetStepResult
  indexedDb: PlaygroundResetStepResult
  caches: PlaygroundResetStepResult
}

function ok(): PlaygroundResetStepResult {
  return { ok: true }
}

function failed(error: unknown): PlaygroundResetStepResult {
  return { ok: false, error }
}

export function resetPlaygroundStorage(): PlaygroundResetStepResult {
  try {
    for (const key of PLAYGROUND_LOCAL_STORAGE_KEYS) {
      removeStorageItem('local', key)
    }
    for (const key of PLAYGROUND_SESSION_STORAGE_KEYS) {
      removeStorageItem('session', key)
    }
    return ok()
  }
  catch (error) {
    return failed(error)
  }
}

export function resetPlaygroundIndexedDb(): Promise<PlaygroundResetStepResult> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(ok())
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.deleteDatabase(PLAYGROUND_INDEXED_DB.name)
      request.onsuccess = () => resolve(ok())
      request.onerror = () => resolve(failed(request.error ?? new Error('Failed to delete playground IndexedDB')))
      request.onblocked = () => resolve(failed(new Error('Playground IndexedDB deletion was blocked')))
    }
    catch (error) {
      resolve(failed(error))
    }
  })
}

export async function resetPlaygroundCaches(): Promise<PlaygroundResetStepResult> {
  if (typeof caches === 'undefined') {
    return ok()
  }

  try {
    const names = await caches.keys()
    await Promise.all(
      names
        .filter(name => name.startsWith(PLAYGROUND_CACHE_PREFIX))
        .map(name => caches.delete(name)),
    )
    return ok()
  }
  catch (error) {
    return failed(error)
  }
}

export async function resetPlaygroundData(): Promise<PlaygroundResetResult> {
  const storage = resetPlaygroundStorage()
  const [indexedDb, cacheResult] = await Promise.all([
    resetPlaygroundIndexedDb(),
    resetPlaygroundCaches(),
  ])

  return {
    storage,
    indexedDb,
    caches: cacheResult,
  }
}

export function didResetComplete(result: PlaygroundResetResult): boolean {
  return result.storage.ok && result.indexedDb.ok && result.caches.ok
}
