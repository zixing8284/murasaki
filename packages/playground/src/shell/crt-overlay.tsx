import type { CSSProperties } from 'react'
import type { CrtTuningSettings } from '../hooks/use-crt-tuning'

interface CrtOverlayProps {
  settings: CrtTuningSettings
}

export function CrtOverlay({ settings }: CrtOverlayProps): React.ReactElement {
  const jitterNormalized = Math.min(1, Math.max(0, settings.jitterAmount / 2))
  const jitterAmplitude = jitterNormalized ** 2 * 2.2
  const shouldRenderRoll = settings.rollOpacity > 0.01

  const overlayVariables = {
    '--crt-jitter-amplitude': `${String(jitterAmplitude)}px`,
    '--crt-roll-duration': `${String(settings.rollDuration)}s`,
    '--crt-roll-opacity': String(settings.rollOpacity),
  } as CSSProperties

  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 z-1 crt-jitter" style={overlayVariables}>
        <div
          className="pointer-events-none absolute inset-0 crt-scanlines"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at center, transparent 0, transparent 60%, rgba(0,0,0,0.15) 100%)'
              + `, repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,${String(settings.scanlineOpacity)}) 3px)`,
            backgroundSize: '100% 100%, 1px 6px',
          }}
        />
      </div>
      {shouldRenderRoll && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-full z-2 crt-roll"
          style={overlayVariables}
        />
      )}
    </>
  )
}
