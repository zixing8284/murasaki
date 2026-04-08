export function ExpandArrowIcon(props: React.ComponentProps<'svg'>): React.ReactElement {
  return (
    <svg
      width="6"
      height="8"
      viewBox="0 0 7 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      {...props}
    >
      {/* First arrow >> pixel style */}
      <rect x="0" y="0" width="1" height="1" fill="currentColor" />
      <rect x="1" y="1" width="1" height="1" fill="currentColor" />
      <rect x="2" y="2" width="1" height="1" fill="currentColor" />
      <rect x="3" y="3" width="1" height="1" fill="currentColor" />
      <rect x="4" y="4" width="1" height="1" fill="currentColor" />
      <rect x="3" y="5" width="1" height="1" fill="currentColor" />
      <rect x="2" y="6" width="1" height="1" fill="currentColor" />
      <rect x="1" y="7" width="1" height="1" fill="currentColor" />
      <rect x="0" y="8" width="1" height="1" fill="currentColor" />
      {/* Second arrow */}
      <rect x="3" y="0" width="1" height="1" fill="currentColor" />
      <rect x="4" y="1" width="1" height="1" fill="currentColor" />
      <rect x="5" y="2" width="1" height="1" fill="currentColor" />
      <rect x="6" y="3" width="1" height="1" fill="currentColor" />
      <rect x="6" y="5" width="1" height="1" fill="currentColor" />
      <rect x="5" y="6" width="1" height="1" fill="currentColor" />
      <rect x="4" y="7" width="1" height="1" fill="currentColor" />
      <rect x="3" y="8" width="1" height="1" fill="currentColor" />
    </svg>
  )
}
