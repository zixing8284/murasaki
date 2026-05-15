import { useEffect, useRef, useState } from 'react'
import { assetPath } from '../../../lib/asset-path'
import {
  NETWORK_OFFLINE_ICON as NETWORK_OFFLINE_ICON_PATH,
  NETWORK_ONLINE_ICONS as NETWORK_ONLINE_ICON_PATHS,
} from '../../../lib/playground-assets'
import { useNetworkStatus } from './use-network-status'

const NETWORK_ONLINE_ICONS = NETWORK_ONLINE_ICON_PATHS.map(path => assetPath(path))
const NETWORK_OFFLINE_ICON = assetPath(NETWORK_OFFLINE_ICON_PATH)

export function NetworkIcon(): React.ReactElement {
  const isOnline = useNetworkStatus()
  const [networkIconIndex, setNetworkIconIndex] = useState(0)
  const networkIconIndexRef = useRef(0)

  // Cycle through network icons when online
  useEffect(() => {
    if (!isOnline) {
      return
    }

    const interval = setInterval(() => {
      networkIconIndexRef.current = (networkIconIndexRef.current + 1) % NETWORK_ONLINE_ICONS.length
      setNetworkIconIndex(networkIconIndexRef.current)
    }, 3000)

    return () => clearInterval(interval)
  }, [isOnline])

  return (
    <>
      {NETWORK_ONLINE_ICONS.map((src, index) => (
        <img
          key={src}
          className={isOnline && networkIconIndex === index ? 'mx-px' : 'hidden'}
          src={src}
          alt="Network connected"
          title="Connected"
        />
      ))}
      <img
        className={isOnline ? 'hidden' : 'mx-px'}
        src={NETWORK_OFFLINE_ICON}
        alt="Network disconnected"
        title="Disconnected"
      />
    </>
  )
}
