import { useLocalStorageBoolean } from './use-local-storage-boolean'

export function useGradientTitlebar(): [boolean, (enabled: boolean) => void] {
  return useLocalStorageBoolean('murasaki-gradient-titlebar')
}
