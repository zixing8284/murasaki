import { PLAYGROUND_STORAGE_KEYS } from '../lib/persistence'
import { useLocalStorageColor } from './use-local-storage-color'

const DEFAULT_ICON_LABEL_BG_COLOR = '#008080'

export function useIconLabelBgColor(): [string, (nextColor: string) => void] {
  return useLocalStorageColor(PLAYGROUND_STORAGE_KEYS.iconLabelBgColor, DEFAULT_ICON_LABEL_BG_COLOR)
}
