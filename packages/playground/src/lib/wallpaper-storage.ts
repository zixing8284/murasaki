/**
 * IndexedDB storage for custom wallpaper images.
 *
 * Custom wallpapers are stored as Blobs in a dedicated object store so
 * they survive page refreshes.  The wallpaper settings in localStorage
 * reference them by a `custom:<uuid>` id.
 */

import { PLAYGROUND_INDEXED_DB } from './persistence'
import { openPlaygroundDatabase } from './persistence/database'

export interface WallpaperImageEntry {
  id: string
  name: string
  mimeType: string
  createdAt: number
}

interface StoredWallpaperImage extends WallpaperImageEntry {
  blob: Blob
}

const STORE_NAME = PLAYGROUND_INDEXED_DB.stores.wallpaperImages

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openPlaygroundDatabase().then(database => new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    const request = run(store)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))

    transaction.oncomplete = () => {
      database.close()
    }
    transaction.onerror = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction failed'))
    }
    transaction.onabort = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
    }
  }))
}

const IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
])

export function isSupportedWallpaperImage(file: File): boolean {
  return IMAGE_MIME_TYPES.has(file.type)
}

export function isCustomWallpaperId(id: string): boolean {
  return id.startsWith('custom:')
}

export async function listWallpaperImages(): Promise<WallpaperImageEntry[]> {
  const records = await withStore<StoredWallpaperImage[]>('readonly', store => store.getAll())

  return records
    .map(({ blob: _blob, ...entry }) => entry)
    .toSorted((left, right) => left.createdAt - right.createdAt)
}

export async function saveWallpaperImage(file: File): Promise<WallpaperImageEntry> {
  const timestamp = Date.now()
  const record: StoredWallpaperImage = {
    id: `custom:${crypto.randomUUID()}`,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    createdAt: timestamp,
    blob: file,
  }

  await withStore('readwrite', store => store.put(record))

  const { blob: _blob, ...entry } = record
  return entry
}

export async function getWallpaperImageBlob(id: string): Promise<Blob | null> {
  const record = await withStore<StoredWallpaperImage | undefined>('readonly', store => store.get(id))
  return record?.blob ?? null
}

export async function deleteWallpaperImage(id: string): Promise<void> {
  await withStore('readwrite', store => store.delete(id))
}
