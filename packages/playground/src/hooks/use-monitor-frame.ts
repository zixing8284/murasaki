import { PLAYGROUND_STORAGE_KEYS } from '../lib/persistence'
import { useLocalStorageBoolean } from './use-local-storage-boolean'

export function useMonitorFrame(): [boolean, (enabled: boolean) => void] {
  return useLocalStorageBoolean(PLAYGROUND_STORAGE_KEYS.monitorFrame, false)
}
