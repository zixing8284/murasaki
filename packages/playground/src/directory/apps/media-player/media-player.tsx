import type { ReactElement } from 'react'
import type { ProcessComponentProps } from '../../../contexts/process'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDesktopFiles } from '../../../contexts/desktop-files'
import { useProcess, useProcessActions } from '../../../contexts/process'
import { useFullscreen } from '../../../hooks/use-fullscreen'
import { LocalMediaFileInput } from './components/local-media-file-input'
import { MediaDisplay } from './components/media-display'
import { MediaPlayerControls } from './components/media-player-controls'
import { MediaPlayerMenuBar } from './components/media-player-menu-bar'
import { MediaPlayerStatusBar } from './components/media-player-status-bar'
import { PlaylistPanel } from './components/playlist-panel'
import { useMediaPlayerKeyboardShortcuts } from './hooks/use-media-player-keyboard-shortcuts'
import { useVideoFullscreenToggle } from './hooks/use-video-fullscreen-toggle'
import { SEEK_STEP_SECONDS } from './media-player-constants'
import { useMediaPlayer } from './use-media-player'

export function MediaPlayer({ windowId }: ProcessComponentProps): ReactElement | null {
  const player = useMediaPlayer()
  const { loadLocalFile, seek, togglePlay } = player
  const { title } = useProcessActions()
  const processInfo = useProcess(windowId)
  const isActiveWindow = processInfo?.isActive ?? false
  const { launchRequest, clearLaunchRequest, getFile } = useDesktopFiles()
  const [showPlaylist, setShowPlaylist] = useState(true)
  const windowRootRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLDivElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const { isFullscreen: isMediaFullscreen, toggle: toggleMediaFullscreen } = useFullscreen(fullscreenContainerRef)
  const shouldShowPlaylist = showPlaylist && !isMediaFullscreen
  const currentTrackId = player.currentTrack?.id
  const hasPlayableTrack = player.currentTrack !== null
  const currentTitle = player.currentTrack
    ? `${player.currentTrack.title} - ${player.isPlaying ? 'Playing' : 'Paused'}`
    : 'Media Player'

  const focusWindowRoot = useCallback(() => {
    windowRootRef.current?.focus({ preventScroll: true })
  }, [])

  const seekBackward = useCallback(() => {
    seek(Math.max(0, player.currentTime - SEEK_STEP_SECONDS))
  }, [player.currentTime, seek])

  const seekForward = useCallback(() => {
    seek(Math.min(player.duration, player.currentTime + SEEK_STEP_SECONDS))
  }, [player.currentTime, player.duration, seek])

  const togglePlaylist = useCallback(() => {
    setShowPlaylist(previousValue => !previousValue)
  }, [])

  const { handleVideoClick, handleVideoDoubleClick } = useVideoFullscreenToggle(toggleMediaFullscreen)

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
          mediaRefCallback={player.mediaRefCallback}
          onVideoClick={handleVideoClick}
          onVideoDoubleClick={handleVideoDoubleClick}
        />

        <MediaPlayerControls
          player={player}
          isMediaFullscreen={isMediaFullscreen}
          showPlaylist={showPlaylist}
          onSeekBackward={seekBackward}
          onSeekForward={seekForward}
          onTogglePlaylist={togglePlaylist}
        />
      </div>

      <PlaylistPanel
        visible={shouldShowPlaylist}
        playlist={player.playlist}
        currentTrackId={currentTrackId}
        isPlaying={player.isPlaying}
        activeItemRef={activeItemRef}
        onPlayTrack={player.playTrack}
      />

      {isMediaFullscreen
        ? null
        : (
            <MediaPlayerStatusBar
              currentTrackTitle={player.currentTrack?.title}
              formattedCurrentTime={player.formattedCurrentTime}
              formattedDuration={player.formattedDuration}
            />
          )}
    </div>
  )
}
