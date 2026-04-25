import { useLocalStorageBoolean } from './use-local-storage-boolean'

export function useCrtEffect(): [boolean, (enabled: boolean) => void] {
  return useLocalStorageBoolean('murasaki-crt-effect')
}
