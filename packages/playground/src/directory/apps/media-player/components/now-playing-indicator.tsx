import type { JSX } from 'react'

const NOW_PLAYING_BAR_CLASS = 'h-full w-0.5 origin-bottom scale-y-[var(--now-playing-bar-max)] animate-now-playing-bar bg-current motion-reduce:animate-none'

export function NowPlayingIndicator(): JSX.Element {
  return (
    <span className="flex h-2.5 w-3 items-end justify-center gap-px" aria-hidden="true">
      <span className={`${NOW_PLAYING_BAR_CLASS} [--now-playing-bar-min:0.32] [--now-playing-bar-max:0.8]`} />
      <span className={`${NOW_PLAYING_BAR_CLASS} [--now-playing-bar-min:0.4] [--now-playing-bar-max:0.88] [animation-delay:200ms] animation-duration-[1s]`} />
      <span className={`${NOW_PLAYING_BAR_CLASS} [--now-playing-bar-min:0.48] [--now-playing-bar-max:0.96] [animation-delay:400ms] animation-duration-[1.2s]`} />
    </span>
  )
}
