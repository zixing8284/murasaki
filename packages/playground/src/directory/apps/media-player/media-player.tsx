import type { ReactElement } from 'react'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDesktopFiles } from '../../../contexts/desktop-files/hooks'
import { useProcess, useProcessActions } from '../../../contexts/process/hooks'
import { useFullscreen } from '../../../hooks/use-fullscreen'
import { LocalMediaFileInput } from './components/local-media-file-input'
import { MediaDisplay } from './components/media-display'
import { MediaImportErrorDialog } from './components/media-import-error-dialog'
import { MediaPlayerControls } from './components/media-player-controls'
import { MediaPlayerMenuBar } from './components/media-player-menu-bar'
import { MediaPlayerStatusBar } from './components/media-player-status-bar'
import { PlaylistPanel } from './components/playlist-panel'
import { useMediaPlayerKeyboardShortcuts } from './hooks/use-media-player-keyboard-shortcuts'
import { useMediaPlayer } from './use-media-player'

const SEEK_STEP_SECONDS = 5

export function MediaPlayer({ windowId }: ProcessComponentProps): ReactElement | null {
  const player = useMediaPlayer()
  const { loadLocalFile, seek, togglePlay } = player
  const { title } = useProcessActions()
  const processInfo = useProcess(windowId)
  const isActiveWindow = processInfo?.isActive ?? false
  const { launchRequest, clearLaunchRequest, getFile } = useDesktopFiles()
  const [showPlaylist, setShowPlaylist] = useState(true)
  const [forceAspectRatio, setForceAspectRatio] = useState(false)
  const windowRootRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLDivElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const { isFullscreen: isMediaFullscreen, toggle: toggleMediaFullscreen } = useFullscreen(fullscreenContainerRef)
  const currentTrackId = player.currentTrack?.id
  const hasPlayableTrack = player.currentTrack !== null
  const currentTitle = player.currentTrack
    ? `${player.currentTrack.title} - ${player.isPlaying ? 'Playing' : 'Paused'}`
    : 'Media Player'

  const focusWindowRoot = useCallback((): void => {
    windowRootRef.current?.focus({ preventScroll: true })
  }, [])

  const seekBackward = (): void => {
    seek(Math.max(0, player.currentTime - SEEK_STEP_SECONDS))
  }

  const seekForward = (): void => {
    seek(Math.min(player.duration, player.currentTime + SEEK_STEP_SECONDS))
  }

  const togglePlaylist = (): void => {
    setShowPlaylist(previousValue => !previousValue)
  }

  const toggleForceAspectRatio = (): void => {
    setForceAspectRatio(previousValue => !previousValue)
  }

  useEffect(() => {
    title(windowId, currentTitle)
  }, [currentTitle, title, windowId])

  useEffect(() => {
    if (isActiveWindow) {
      focusWindowRoot()
    }
  }, [focusWindowRoot, isActiveWindow])

  useMediaPlayerKeyboardShortcuts({
    enabled: isActiveWindow && hasPlayableTrack,
    onTogglePlay: togglePlay,
    onSeekBackward: seekBackward,
    onSeekForward: seekForward,
  })

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [currentTrackId])

  useEffect(() => {
    if (!launchRequest)
      return

    let active = true

    const loadRequestedFile = async (): Promise<void> => {
      const file = await getFile(launchRequest.fileId)

      if (!active)
        return

      if (file) {
        loadLocalFile(file, { replacePlaylist: true })
      }

      clearLaunchRequest()
    }

    void loadRequestedFile()

    return () => {
      active = false
    }
  }, [clearLaunchRequest, getFile, launchRequest, loadLocalFile])

  return (
    <div
      ref={windowRootRef}
      className="flex h-full flex-col outline-none"
      tabIndex={-1}
      onPointerDownCapture={focusWindowRoot}
    >
      <LocalMediaFileInput
        fileInputRef={player.fileInputRef}
        acceptedMediaTypes={player.acceptedMediaTypes}
        onAddLocalFile={player.addLocalFile}
      />

      <MediaPlayerMenuBar windowId={windowId} onOpenFile={player.openFilePicker} />

      <div
        ref={fullscreenContainerRef}
        className={`flex flex-1 min-h-0 flex-col ${isMediaFullscreen ? 'bg-black text-(--button-text)' : 'bg-(--button-face)'}`}
        data-fullscreen={isMediaFullscreen || undefined}
      >
        <MediaDisplay
          hasVideo={player.hasVideo}
          forceAspectRatio={forceAspectRatio}
          mediaRefCallback={player.mediaRefCallback}
          onTogglePlay={togglePlay}
          onToggleFullscreen={toggleMediaFullscreen}
        />

        <MediaPlayerControls
          player={player}
          isMediaFullscreen={isMediaFullscreen}
          showPlaylist={showPlaylist}
          forceAspectRatio={forceAspectRatio}
          onSeekBackward={seekBackward}
          onSeekForward={seekForward}
          onTogglePlaylist={togglePlaylist}
          onToggleAspectRatio={toggleForceAspectRatio}
        />

        <PlaylistPanel
          visible={showPlaylist && !isMediaFullscreen}
          playlist={player.playlist}
          currentTrackId={currentTrackId}
          isPlaying={player.isPlaying}
          loading={player.loading}
          activeItemRef={activeItemRef}
          onPlayTrack={player.playTrack}
        />
      </div>

      {isMediaFullscreen
        ? null
        : (
            <MediaPlayerStatusBar
              currentTrackTitle={player.currentTrack?.title}
              errorMessage={player.errorMessage}
              formattedCurrentTime={player.formattedCurrentTime}
              formattedDuration={player.formattedDuration}
            />
          )}

      {player.localImportError
        ? (
            <MediaImportErrorDialog
              fileName={player.localImportError.fileName}
              message={player.localImportError.message}
              onClose={player.clearLocalImportError}
            />
          )
        : null}
    </div>
  )
}
