import { Checkbox, Slider } from '@murasaki/react98'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useClickAway } from '../../../hooks/use-click-away'
import { assetPath } from '../../../lib/asset-path'
import { VOLUME_ICON, VOLUME_MUTED_ICON } from '../../../lib/playground-assets'
import { getGlobalAudio } from './global-audio'

const VOLUME_ICON_SRC = assetPath(VOLUME_ICON)
const VOLUME_MUTED_ICON_SRC = assetPath(VOLUME_MUTED_ICON)

export function VolumeIcon(): React.ReactElement {
  const audio = getGlobalAudio()
  const [isOpen, setIsOpen] = useState(false)
  const [volume, setVolume] = useState(() => audio.getVolume())
  const [muted, setMuted] = useState(() => audio.getMuted())
  const [position, setPosition] = useState<{ bottom: number, right: number } | null>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)

  // Boot the DOM observer once on mount
  useEffect(() => {
    audio.init()
  }, [audio])

  // Keep local state in sync if another caller mutates the singleton
  useEffect(() => {
    return audio.subscribe(({ volume: v, muted: m }) => {
      setVolume(v)
      setMuted(m)
    })
  }, [audio])

  const handleVolumeChange = useCallback((v: number) => {
    audio.setVolume(v)
  }, [audio])

  const handleMutedChange = useCallback((m: boolean) => {
    audio.setMuted(m)
  }, [audio])

  const popupRef = useClickAway<HTMLDivElement>(useCallback(() => {
    setIsOpen(false)
  }, []))

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor)
      return
    const rect = anchor.getBoundingClientRect()
    setPosition({
      bottom: window.innerHeight - rect.top + 4,
      right: window.innerWidth - rect.right,
    })
  }, [])

  const handleIconClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOpen) {
      updatePosition()
    }
    setIsOpen(prev => !prev)
  }, [isOpen, updatePosition])

  // Recompute position on resize
  useEffect(() => {
    if (!isOpen)
      return
    const handler = (): void => updatePosition()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [isOpen, updatePosition])

  const iconSrc = muted || volume === 0 ? VOLUME_MUTED_ICON_SRC : VOLUME_ICON_SRC
  const iconAlt = muted ? 'Volume muted' : `Volume: ${volume}%`
  const iconTitle = muted ? 'Volume: Muted' : `Volume: ${volume}%`

  return (
    <>
      <span
        ref={anchorRef}
        className="mx-px cursor-pointer"
        title={iconTitle}
        onClick={handleIconClick}
      >
        <img src={iconSrc} alt={iconAlt} />
      </span>

      {isOpen && position && createPortal(
        <div
          ref={popupRef}
          className="fixed z-9999 w-18 flex flex-col bg-(--button-face) shadow-(--shadow-raised)"
          style={{ bottom: position.bottom, right: position.right }}
        >
          {/* Header */}
          <div className="text-center px-1 pt-1 pb-0.5 leading-tight">
            Volume
          </div>

          {/* Slider area */}
          <div className="flex justify-center flex-1 py-2">
            <Slider
              className="h-22.5"
              vertical
              boxIndicator
              min={0}
              max={100}
              step={1}
              value={volume}
              disabled={muted}
              onValueChange={handleVolumeChange}
            />
          </div>

          {/* Mute checkbox */}
          <div className="flex items-center px-2 pb-2 gap-1.5">
            <Checkbox
              checked={muted}
              onCheckedChange={handleMutedChange}
            >
              Mute
            </Checkbox>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
