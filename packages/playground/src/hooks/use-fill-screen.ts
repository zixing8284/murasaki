import { PLAYGROUND_STORAGE_KEYS } from '../lib/persistence'
import { useLocalStorageBoolean } from './use-local-storage-boolean'

/**
 * When enabled, the virtual desktop drops the letterbox margin and covers the
 * full viewport edge-to-edge. Defaults to off (letterboxed, like elternal.world).
 */
export function useFillScreen(): [boolean, (enabled: boolean) => void] {
  return useLocalStorageBoolean(PLAYGROUND_STORAGE_KEYS.fillScreen, false)
}
