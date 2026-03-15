interface ExpandArrowButtonProps {
  onClick: () => void
}

export function ExpandArrowButton({ onClick }: ExpandArrowButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className="flex items-start justify-center w-3 h-5 cursor-pointer bg-transparent border-none p-0 hover:bg-(--button-face) active:bg-(--button-shadow) text-(--button-text)"
      onClick={onClick}
      title="Show all Quick Launch icons"
      style={{ imageRendering: 'pixelated' }}
    >
      <svg
        width="6"
        height="8"
        viewBox="0 0 7 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: 'pixelated' }}
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
    </button>
  )
}
