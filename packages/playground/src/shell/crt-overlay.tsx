export function CrtOverlay(): React.ReactElement {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-1 crt-overlay"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at center, transparent 0, transparent 60%, rgba(0,0,0,0.15) 100%)'
          + ', repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.35) 3px)',
        backgroundSize: '100% 100%, 1px 6px',
        animation: 'crt-flicker 0.3s linear infinite',
      }}
    />
  )
}
