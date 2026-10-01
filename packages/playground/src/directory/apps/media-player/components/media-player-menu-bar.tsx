import type { ReactElement } from 'react'
import {
  MenuCheckboxItem,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarItem,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
} from '@murasaki-io/react98'
import { useProcessActions } from '../../../../contexts/process/hooks'
import { InactiveClickGuard } from '../../../../shell/window/inactive-click-guard'

interface MediaPlayerMenuBarProps {
  windowId: string
  // File
  onOpenFile: () => void
  // Play menu
  hasTrack: boolean
  isPlaying: boolean
  muted: boolean
  onTogglePlay: () => void
  onStop: () => void
  onPrevious: () => void
  onNext: () => void
  onSeekBackward: () => void
  onSeekForward: () => void
  onVolumeUp: () => void
  onVolumeDown: () => void
  onToggleMute: () => void
  playbackRate: number
  onSetPlaybackRate: (rate: number) => void
  // Scale menu
  videoScalable: boolean
  onScale: (scale: number) => void
  onToggleFullscreen: () => void
  isMediaFullscreen: boolean
  stretchToFit: boolean
  onToggleStretch: () => void
}

const PLAYBACK_SPEEDS: ReadonlyArray<{ value: number, label: string }> = [
  { value: 0.5, label: 'Half (0.5×)' },
  { value: 0.75, label: '0.75×' },
  { value: 1, label: 'Normal' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5, label: '1.5×' },
  { value: 2, label: 'Double (2×)' },
]

/** Single-span label with one underlined accelerator (no inter-letter gap). */
function Accel({ text, index = 0 }: { text: string, index?: number }): ReactElement {
  return (
    <span>
      {text.slice(0, index)}
      <span className="underline">{text.charAt(index)}</span>
      {text.slice(index + 1)}
    </span>
  )
}

export function MediaPlayerMenuBar({
  windowId,
  onOpenFile,
  hasTrack,
  isPlaying,
  muted,
  onTogglePlay,
  onStop,
  onPrevious,
  onNext,
  onSeekBackward,
  onSeekForward,
  onVolumeUp,
  onVolumeDown,
  onToggleMute,
  playbackRate,
  onSetPlaybackRate,
  videoScalable,
  onScale,
  onToggleFullscreen,
  isMediaFullscreen,
  stretchToFit,
  onToggleStretch,
}: MediaPlayerMenuBarProps): ReactElement {
  const { close } = useProcessActions()

  return (
    <InactiveClickGuard windowId={windowId}>
      <WindowMenuBar>

        {/* ── File ────────────────────────────────────────────── */}
        <WindowMenuBarMenu value="file">
          <WindowMenuBarTrigger><Accel text="File" /></WindowMenuBarTrigger>
          <WindowMenuBarContent>
            <MenuItem onClick={onOpenFile}>
              <Accel text="Open…" />
              <MenuShortcut>Ctrl+O</MenuShortcut>
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={() => close(windowId)}>
              <Accel text="Exit" index={1} />
              <MenuShortcut>Alt+F4</MenuShortcut>
            </MenuItem>
          </WindowMenuBarContent>
        </WindowMenuBarMenu>

        {/* ── Play ────────────────────────────────────────────── */}
        <WindowMenuBarMenu value="play">
          <WindowMenuBarTrigger><Accel text="Play" index={0} /></WindowMenuBarTrigger>
          <WindowMenuBarContent>
            <MenuItem reserveIconSpace disabled={!hasTrack} onClick={onTogglePlay}>
              {isPlaying ? <Accel text="Pause" /> : <Accel text="Play" />}
              <MenuShortcut>Space</MenuShortcut>
            </MenuItem>
            <MenuItem reserveIconSpace disabled={!hasTrack} onClick={onStop}>
              <Accel text="Stop" />
            </MenuItem>
            <MenuSeparator />
            <MenuItem reserveIconSpace disabled={!hasTrack} onClick={onPrevious}>
              <Accel text="Previous" />
            </MenuItem>
            <MenuItem reserveIconSpace disabled={!hasTrack} onClick={onNext}>
              <Accel text="Next" />
            </MenuItem>
            <MenuSeparator />
            <MenuItem reserveIconSpace disabled={!hasTrack} onClick={onSeekBackward}>
              Seek Backward
              <MenuShortcut>←</MenuShortcut>
            </MenuItem>
            <MenuItem reserveIconSpace disabled={!hasTrack} onClick={onSeekForward}>
              Seek Forward
              <MenuShortcut>→</MenuShortcut>
            </MenuItem>
            <MenuSeparator />
            <MenuItem reserveIconSpace onClick={onVolumeUp}>
              Volume Up
              <MenuShortcut>↑</MenuShortcut>
            </MenuItem>
            <MenuItem reserveIconSpace onClick={onVolumeDown}>
              Volume Down
              <MenuShortcut>↓</MenuShortcut>
            </MenuItem>
            <MenuCheckboxItem checked={muted} onCheckedChange={onToggleMute}>
              {muted ? 'Unmute' : 'Mute'}
              <MenuShortcut>M</MenuShortcut>
            </MenuCheckboxItem>
            <MenuSeparator />
            <MenuSub>
              <MenuSubTrigger reserveIconSpace>Playback Speed</MenuSubTrigger>
              <MenuSubContent>
                <MenuRadioGroup value={String(playbackRate)} onValueChange={value => onSetPlaybackRate(Number(value))}>
                  {PLAYBACK_SPEEDS.map(speed => (
                    <MenuRadioItem key={speed.value} value={String(speed.value)}>
                      {speed.label}
                    </MenuRadioItem>
                  ))}
                </MenuRadioGroup>
              </MenuSubContent>
            </MenuSub>
          </WindowMenuBarContent>
        </WindowMenuBarMenu>

        {/* ── Scale ───────────────────────────────────────────── */}
        <WindowMenuBarMenu value="scale">
          <WindowMenuBarTrigger><Accel text="Scale" /></WindowMenuBarTrigger>
          <WindowMenuBarContent>
            <MenuItem reserveIconSpace disabled={!videoScalable} onClick={() => onScale(0.5)}>
              Half Size
            </MenuItem>
            <MenuItem reserveIconSpace disabled={!videoScalable} onClick={() => onScale(1)}>
              Normal Size (100%)
            </MenuItem>
            <MenuItem reserveIconSpace disabled={!videoScalable} onClick={() => onScale(2)}>
              Double Size
            </MenuItem>
            <MenuSeparator />
            <MenuItem reserveIconSpace onClick={onToggleFullscreen}>
              {isMediaFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              <MenuShortcut>F</MenuShortcut>
            </MenuItem>
            <MenuCheckboxItem checked={stretchToFit} onCheckedChange={onToggleStretch}>
              Stretch to Fit
            </MenuCheckboxItem>
          </WindowMenuBarContent>
        </WindowMenuBarMenu>

        <WindowMenuBarItem disabled><Accel text="Device" /></WindowMenuBarItem>
        <WindowMenuBarItem disabled><Accel text="Help" /></WindowMenuBarItem>

      </WindowMenuBar>
    </InactiveClickGuard>
  )
}
