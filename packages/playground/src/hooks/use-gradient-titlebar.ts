import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'murasaki-gradient-titlebar'

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== 'false'
}

function getServerSnapshot(): boolean {
  return true
}

const listeners = new Set<() => void>()

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function notify(): void {
  for (const listener of listeners) listener()
}

export function useGradientTitlebar(): [boolean, (enabled: boolean) => void] {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setEnabled = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value))
    notify()
  }, [])

  return [enabled, setEnabled]
}
