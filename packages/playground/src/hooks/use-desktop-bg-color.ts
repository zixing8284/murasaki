import { PLAYGROUND_STORAGE_KEYS } from '../lib/persistence'
import { useLocalStorageColor } from './use-local-storage-color'

const DEFAULT_DESKTOP_BG_COLOR = '#008080'

export function useDesktopBgColor(): [string, (nextColor: string) => void] {
  return useLocalStorageColor(PLAYGROUND_STORAGE_KEYS.desktopBgColor, DEFAULT_DESKTOP_BG_COLOR)
}
