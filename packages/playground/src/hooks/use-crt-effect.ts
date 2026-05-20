import { PLAYGROUND_STORAGE_KEYS } from '../lib/persistence'
import { useLocalStorageBoolean } from './use-local-storage-boolean'

export function useCrtEffect(): [boolean, (enabled: boolean) => void] {
  return useLocalStorageBoolean(PLAYGROUND_STORAGE_KEYS.crtEffect, false)
}
