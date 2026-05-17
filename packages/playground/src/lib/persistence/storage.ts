export type StorageArea = 'local' | 'session'

export function getStorage(area: StorageArea): Storage | null {
  try {
    if (typeof window === 'undefined') {
      return null
    }
    return area === 'local' ? window.localStorage : window.sessionStorage
  }
  catch {
    return null
  }
}

export function readStorageItem(area: StorageArea, key: string): string | null {
  const storage = getStorage(area)
  if (!storage) {
    return null
  }

  try {
    return storage.getItem(key)
  }
  catch {
    return null
  }
}

export function writeStorageItem(area: StorageArea, key: string, value: string): void {
  const storage = getStorage(area)
  if (!storage) {
    return
  }

  try {
    storage.setItem(key, value)
  }
  catch {
    // Storage is best-effort in private mode / quota exhaustion.
  }
}

export function removeStorageItem(area: StorageArea, key: string): void {
  const storage = getStorage(area)
  if (!storage) {
    return
  }

  try {
    storage.removeItem(key)
  }
  catch {
    // ignore
  }
}

export function readJsonStorageItem<T>(
  area: StorageArea,
  key: string,
  validate: (value: unknown) => T | null,
): T | null {
  const raw = readStorageItem(area, key)
  if (!raw) {
    return null
  }

  try {
    return validate(JSON.parse(raw) as unknown)
  }
  catch {
    return null
  }
}

export function writeJsonStorageItem(area: StorageArea, key: string, value: unknown): void {
  try {
    writeStorageItem(area, key, JSON.stringify(value))
  }
  catch {
    // JSON serialization can fail for unexpected caller values.
  }
}

export function readBooleanStorageItem(area: StorageArea, key: string, fallback = true): boolean {
  const value = readStorageItem(area, key)
  return value === null ? fallback : value !== 'false'
}

export function writeBooleanStorageItem(area: StorageArea, key: string, value: boolean): void {
  writeStorageItem(area, key, String(value))
}
