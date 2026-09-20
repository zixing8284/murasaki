interface AppLaunchSplashProps {
  /** App display name shown under the icon. */
  name: string
  /** Resolved large-icon asset path. */
  iconSrc?: string
}

/**
 * Honest "app is starting" splash for windows whose content is still loading —
 * external iframe apps and cold-opened system chunks. Uses an indeterminate
 * marquee rather than a fabricated percentage, because iframe / remote loads
 * expose no real progress signal.
 */
export function AppLaunchSplash({ name, iconSrc }: AppLaunchSplashProps): React.ReactElement {
  return (
    <div className="flex size-full min-h-40 flex-col items-center justify-center gap-3 bg-(--button-face) p-4 text-(--window-text)">
      {iconSrc && (
        <img
          src={iconSrc}
          alt=""
          width={32}
          height={32}
          className="pixelated"
          draggable={false}
        />
      )}
      <div className="font-bold">{name}</div>
      <div className="h-4 w-40 max-w-full overflow-hidden p-0.5 shadow-(--shadow-sunken-inner)">
        <div className="animate-app-launch-marquee h-full w-1/3 bg-(--hilight) will-change-transform" />
      </div>
      <div className="text-(--gray-text)">Starting…</div>
    </div>
  )
}
