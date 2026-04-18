export type DesktopMediaKind = 'audio' | 'video'

export interface DesktopMediaFileEntry {
  id: string
  name: string
  mimeType: string
  size: number
  createdAt: number
  updatedAt: number
  kind: DesktopMediaKind
}

interface StoredDesktopMediaFile extends DesktopMediaFileEntry {
  blob: Blob
}

const DATABASE_NAME = 'murasaki-playground'
const DATABASE_VERSION = 1
const STORE_NAME = 'desktop-media-files'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open desktop media database'))
  })
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(database => new Promise((resolve, reject) => {
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

export function isSupportedDesktopMediaFile(file: File): boolean {
  return file.type.startsWith('audio/') || file.type.startsWith('video/')
}

export async function requestPersistentStorage(): Promise<void> {
  if (!('storage' in navigator) || typeof navigator.storage.persist !== 'function') {
    return
  }

  try {
    await navigator.storage.persist()
  }
  catch {
    // Best effort only.
  }
}

export async function listDesktopMediaFiles(): Promise<DesktopMediaFileEntry[]> {
  const records = await withStore<StoredDesktopMediaFile[]>('readonly', store => store.getAll())

  return records
    .map(({ blob: _blob, ...entry }) => entry)
    .toSorted((left, right) => left.createdAt - right.createdAt)
}

export async function saveDesktopMediaFile(file: File): Promise<DesktopMediaFileEntry> {
  const timestamp = Date.now()
  const record: StoredDesktopMediaFile = {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    createdAt: timestamp,
    updatedAt: timestamp,
    kind: file.type.startsWith('video/') ? 'video' : 'audio',
    blob: file,
  }

  await withStore('readwrite', store => store.put(record))

  const { blob: _blob, ...entry } = record
  return entry
}

export async function getDesktopMediaFile(id: string): Promise<File | null> {
  const record = await withStore<StoredDesktopMediaFile | undefined>('readonly', store => store.get(id))
  if (!record) {
    return null
  }

  return new File([record.blob], record.name, {
    type: record.mimeType,
    lastModified: record.updatedAt,
  })
}
