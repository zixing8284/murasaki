import type { RefObject } from 'react'
import type { MediaState, Track } from './media-manager'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatTime } from './format-time'
import { MediaManager } from './media-manager'
import { DEFAULT_REMOTE_PLAYLIST } from './remote-tracks'

export type { Track } from './media-manager'

// Singleton pattern from murasaki-old
let singletonManager: MediaManager | null = null
let singletonRefCount = 0

function acquireManager(): MediaManager {
  if (!singletonManager) {
    singletonManager = new MediaManager()
  }
  singletonRefCount++
  return singletonManager
}

function releaseManager(): void {
  if (singletonRefCount > 0) {
    singletonRefCount--
    if (singletonRefCount === 0 && singletonManager) {
      singletonManager.destroy()
      singletonManager = null
    }
  }
}

const VIDEO_EXTENSIONS = /\.(?:mp4|webm|ogv|mov|avi|mkv)$/i
const ACCEPTED_MEDIA_TYPES = 'audio/*,video/*'

function detectTrackType(file?: File, url?: string): 'audio' | 'video' {
  if (file) {
    if (file.type.startsWith('video/'))
      return 'video'
    if (file.type.startsWith('audio/'))
      return 'audio'
    return VIDEO_EXTENSIONS.test(file.name) ? 'video' : 'audio'
  }
  if (url && VIDEO_EXTENSIONS.test(url))
    return 'video'
  return 'audio'
}

let nextLocalId = 1

const DEFAULT_PLAYLIST: Track[] = DEFAULT_REMOTE_PLAYLIST

interface PlayerState {
  playlist: Track[]
  currentIndex: number
  shuffle: boolean
  repeat: 'off' | 'one' | 'all'
  playOrderIndices: number[]
}

interface LocalImportError {
  fileName: string
  message: string
}

export interface UseMediaPlayerResult {
  isPlaying: boolean
  loading: boolean
  errorMessage: string | null
  localImportError: LocalImportError | null
  currentTime: number
  duration: number
  currentTrack: Track | null
  progress: number
  formattedCurrentTime: string
  formattedDuration: string
  hasVideo: boolean
  volume: number
  muted: boolean
  playlist: Track[]
  currentIndex: number
  shuffle: boolean
  repeat: 'off' | 'one' | 'all'
  mediaRefCallback: (el: HTMLVideoElement | null) => void
  fileInputRef: RefObject<HTMLInputElement | null>
  playTrack: (track: Track) => void
  togglePlay: () => void
  stop: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  seekByPercentage: (percentage: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setRepeat: (mode: 'off' | 'one' | 'all') => void
  setVolume: (level: number) => void
  toggleMute: () => void
  loadLocalFile: (file: File, options?: { replacePlaylist?: boolean }) => void
  addLocalFile: (file: File) => void
  clearLocalImportError: () => void
  openFilePicker: () => void
  getMediaElement: () => HTMLMediaElement | null
  acceptedMediaTypes: string
}

const LOCAL_MEDIA_PROBE_TIMEOUT_MS = 4000

function canPlayMime(type: string, trackType: 'audio' | 'video'): boolean {
  const mime = type.trim()
  if (!mime)
    return true
  const mediaEl = document.createElement(trackType)
  return mediaEl.canPlayType(mime) !== ''
}

async function probeLocalMediaFile(file: File, trackType: 'audio' | 'video'): Promise<string | null> {
  if (!canPlayMime(file.type, trackType)) {
    return `This browser does not report support for ${file.type}.`
  }

  return await new Promise<string | null>((resolve) => {
    const probeUrl = URL.createObjectURL(file)
    const mediaEl = document.createElement(trackType)
    let settled = false
    let timeoutId: number | undefined

    function cleanup(): void {
      mediaEl.removeEventListener('loadedmetadata', onLoadedMetadata)
      mediaEl.removeEventListener('error', onError)
      mediaEl.removeEventListener('stalled', onStalled)
      mediaEl.removeEventListener('abort', onAbort)
      if (timeoutId != null)
        window.clearTimeout(timeoutId)
      mediaEl.pause()
      mediaEl.removeAttribute('src')
      mediaEl.load()
      URL.revokeObjectURL(probeUrl)
    }

    function finish(error: string | null): void {
      if (settled)
        return
      settled = true
      cleanup()
      resolve(error)
    }

    function onLoadedMetadata(): void {
      finish(null)
    }

    function onError(): void {
      finish(trackType === 'video'
        ? 'This video could not be decoded in this browser. The MP4 codec may be unsupported in Firefox.'
        : 'This audio file could not be decoded in this browser.')
    }

    function onStalled(): void {
      finish('The browser could not read metadata for this media file.')
    }

    function onAbort(): void {
      finish('Media loading was interrupted before playback started.')
    }

    timeoutId = window.setTimeout(() => {
      finish('Timed out while checking media compatibility. The file may be encoded with an unsupported codec.')
    }, LOCAL_MEDIA_PROBE_TIMEOUT_MS)

    mediaEl.preload = 'metadata'
    mediaEl.addEventListener('loadedmetadata', onLoadedMetadata)
    mediaEl.addEventListener('error', onError)
    mediaEl.addEventListener('stalled', onStalled)
    mediaEl.addEventListener('abort', onAbort)
    mediaEl.src = probeUrl
    mediaEl.load()
  })
}

export function useMediaPlayer(): UseMediaPlayerResult {
  const [mediaState, setMediaState] = useState<MediaState | null>(null)
  const [localImportError, setLocalImportError] = useState<LocalImportError | null>(null)
  const [model, setModel] = useState<PlayerState>(() => ({
    playlist: DEFAULT_PLAYLIST,
    currentIndex: -1,
    shuffle: false,
    repeat: 'off',
    playOrderIndices: Array.from({ length: DEFAULT_PLAYLIST.length }, (_, i) => i),
  }))
  const managerRef = useRef<MediaManager | null>(null)
  const mediaRef = useRef<HTMLVideoElement | null>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const localImportSeqRef = useRef(0)

  useEffect(() => {
    const manager = acquireManager()
    const objectUrls = objectUrlsRef.current
    managerRef.current = manager
    // Attach element if already mounted (ref callback fires before this effect)
    if (mediaRef.current) {
      manager.attachElement(mediaRef.current)
    }
    const unsubscribe = manager.subscribe((state) => {
      if (state.duration > 0 && state.currentTrack) {
        const currentTrackId = state.currentTrack.id
        const duration = state.duration
        setModel((prev) => {
          const trackIndex = prev.playlist.findIndex(t => t.id === currentTrackId)
          if (trackIndex === -1 || prev.playlist[trackIndex].duration === duration)
            return prev
          const newPlaylist = [...prev.playlist]
          newPlaylist[trackIndex] = { ...newPlaylist[trackIndex], duration }
          return { ...prev, playlist: newPlaylist }
        })
      }
      setMediaState(state)
    })
    return () => {
      unsubscribe()
      managerRef.current = null
      releaseManager()
      // Revoke all object URLs on unmount
      for (const url of objectUrls) {
        URL.revokeObjectURL(url)
      }
      objectUrls.clear()
    }
  }, [])

  // Attach/detach the video element to the manager
  const mediaRefCallback = useCallback((el: HTMLVideoElement | null) => {
    mediaRef.current = el
    const manager = managerRef.current
    if (!manager)
      return
    if (el) {
      manager.attachElement(el)
    }
    else {
      manager.detachElement()
    }
  }, [])

  const playOrder = model.playOrderIndices.map(idx => model.playlist[idx])

  const getAdjacentTrackRef = useRef<(offset: number, ignoreRepeat: boolean) => Track | null>(null)

  const getAdjacentTrack = (offset: number, ignoreRepeat: boolean = false): Track | null => {
    if (playOrder.length === 0)
      return null

    const currentPlayOrderIndex = model.playOrderIndices.findIndex(
      idx => idx === model.currentIndex,
    )

    if (currentPlayOrderIndex === -1)
      return playOrder[0] ?? null

    const newPosition = currentPlayOrderIndex + offset

    if (offset > 0 && newPosition >= playOrder.length) {
      return ignoreRepeat || model.repeat === 'all' ? playOrder[0] : null
    }

    if (offset < 0 && newPosition < 0) {
      return ignoreRepeat || model.repeat === 'all' ? playOrder[playOrder.length - 1] : null
    }

    return playOrder[newPosition] ?? null
  }

  useLayoutEffect(() => {
    getAdjacentTrackRef.current = getAdjacentTrack
  })

  /** Play a track (from playlist double-click). Updates model index and starts playback. */
  const playTrack = (track: Track): void => {
    const manager = managerRef.current
    if (!manager)
      return
    const index = model.playlist.findIndex(t => t.id === track.id)
    if (index !== -1) {
      setModel(prev => ({ ...prev, currentIndex: index }))
    }
    manager.loadAndPlay(track)
  }

  /** Switch to an adjacent track (next/previous). Loads or plays depending on current state. */
  const switchTrack = (track: Track): void => {
    const index = model.playlist.findIndex(t => t.id === track.id)
    if (index === -1)
      return

    setModel(prev => ({ ...prev, currentIndex: index }))

    const manager = managerRef.current
    if (!manager)
      return
    if (mediaState?.isPlaying) {
      manager.loadAndPlay(track)
    }
    else {
      manager.loadTrack(track)
    }
  }

  // Handle track ended
  useEffect(() => {
    const manager = managerRef.current
    if (!manager)
      return

    manager.onTrackEnded = () => {
      if (model.repeat === 'one') {
        manager.seek(0)
        manager.play()
      }
      else {
        const nextTrack = getAdjacentTrackRef.current?.(1, false)
        if (nextTrack) {
          // Update model index before loading
          setModel((prev) => {
            const index = prev.playlist.findIndex(t => t.id === nextTrack.id)
            return index !== -1 ? { ...prev, currentIndex: index } : prev
          })
          manager.loadAndPlay(nextTrack)
        }
      }
    }
  }, [model.repeat])

  const togglePlay = (): void => {
    const manager = managerRef.current
    if (!manager)
      return
    if (mediaState?.isPlaying) {
      manager.pause()
    }
    else if (mediaState?.currentTrack) {
      manager.play()
    }
  }

  const stop = (): void => {
    const manager = managerRef.current
    if (!manager)
      return
    manager.pause()
    manager.seek(0)
  }

  const next = (): void => {
    if (!playOrder.length)
      return
    const nextTrack = getAdjacentTrack(1, true)
    if (nextTrack)
      switchTrack(nextTrack)
  }

  const previous = (): void => {
    if (!playOrder.length)
      return
    if ((mediaState?.currentTime ?? 0) > 3) {
      managerRef.current?.seek(0)
      return
    }
    const prevTrack = getAdjacentTrack(-1, true)
    if (prevTrack)
      switchTrack(prevTrack)
  }

  const seek = (time: number): void => {
    managerRef.current?.seek(time)
  }

  const seekByPercentage = (percentage: number): void => {
    const duration = mediaState?.duration ?? 0
    if (duration > 0) {
      seek((percentage / 100) * duration)
    }
  }

  /** Load a local file and optionally replace previous local selections. */
  const loadLocalFileInternal = (file: File, options?: { replacePlaylist?: boolean }): void => {
    const objectUrl = URL.createObjectURL(file)

    if (options?.replacePlaylist) {
      for (const url of objectUrlsRef.current) {
        URL.revokeObjectURL(url)
      }
      objectUrlsRef.current.clear()
    }

    objectUrlsRef.current.add(objectUrl)
    const type = detectTrackType(file)
    const track: Track = {
      id: `local-${nextLocalId++}`,
      title: file.name.replace(/\.[^.]+$/, ''),
      url: objectUrl,
      type,
    }
    setModel((prev) => {
      const basePlaylist = options?.replacePlaylist ? [] : prev.playlist
      const newPlaylist = [...basePlaylist, track]
      const newIndex = newPlaylist.length - 1
      return {
        ...prev,
        playlist: newPlaylist,
        currentIndex: newIndex,
        playOrderIndices: Array.from({ length: newPlaylist.length }, (_, i) => i),
      }
    })
    managerRef.current?.loadAndPlay(track)
  }

  const loadLocalFile = (file: File, options?: { replacePlaylist?: boolean }): void => {
    const requestId = ++localImportSeqRef.current
    setLocalImportError(null)

    void (async () => {
      const type = detectTrackType(file)
      const probeError = await probeLocalMediaFile(file, type)

      if (requestId !== localImportSeqRef.current)
        return

      if (probeError) {
        setLocalImportError({ fileName: file.name, message: probeError })
        return
      }

      loadLocalFileInternal(file, options)
    })()
  }

  /** Add a local file to the playlist and auto-play it */
  const addLocalFile = (file: File): void => {
    loadLocalFile(file)
  }

  const clearLocalImportError = (): void => {
    setLocalImportError(null)
  }

  /** Open file picker to load local media */
  const openFilePicker = (): void => {
    fileInputRef.current?.click()
  }

  const toggleShuffle = (): void => {
    setModel((prev) => {
      const newShuffle = !prev.shuffle
      let playOrderIndices: number[]
      if (newShuffle) {
        const indices = Array.from({ length: prev.playlist.length }, (_, i) => i)
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]]
        }
        if (prev.currentIndex >= 0 && prev.currentIndex < prev.playlist.length) {
          const pos = indices.indexOf(prev.currentIndex)
          if (pos > 0) {
            indices.splice(pos, 1)
            indices.unshift(prev.currentIndex)
          }
        }
        playOrderIndices = indices
      }
      else {
        playOrderIndices = Array.from({ length: prev.playlist.length }, (_, i) => i)
      }
      return { ...prev, shuffle: newShuffle, playOrderIndices }
    })
  }

  const cycleRepeat = (): void => {
    setModel((prev) => {
      const modes = ['off', 'one', 'all'] as const
      const idx = modes.indexOf(prev.repeat)
      return { ...prev, repeat: modes[(idx + 1) % 3] }
    })
  }

  const setRepeat = (mode: 'off' | 'one' | 'all'): void => {
    setModel(prev => ({ ...prev, repeat: mode }))
  }

  const setVolume = (level: number): void => {
    managerRef.current?.setVolume(level)
  }

  const toggleMute = (): void => {
    const manager = managerRef.current
    if (!manager)
      return
    const state = manager.getState()
    manager.setMuted(!state.muted)
  }

  const progress = mediaState && mediaState.duration > 0
    ? (mediaState.currentTime / mediaState.duration) * 100
    : 0

  const currentTrack = mediaState?.currentTrack ?? null
  const hasVideo = mediaState?.hasVideo ?? false

  return {
    // Media state
    isPlaying: mediaState?.isPlaying ?? false,
    loading: mediaState?.loading ?? false,
    errorMessage: mediaState?.errorMessage ?? null,
    localImportError,
    currentTime: mediaState?.currentTime ?? 0,
    duration: mediaState?.duration ?? 0,
    currentTrack,
    progress,
    formattedCurrentTime: formatTime(mediaState?.currentTime ?? 0),
    formattedDuration: formatTime(mediaState?.duration ?? 0),
    hasVideo,
    volume: mediaState?.volume ?? 100,
    muted: mediaState?.muted ?? false,

    // Model state
    playlist: model.playlist,
    currentIndex: model.currentIndex,
    shuffle: model.shuffle,
    repeat: model.repeat,

    // Refs
    mediaRefCallback,
    fileInputRef,

    // Actions
    playTrack,
    togglePlay,
    stop,
    next,
    previous,
    seek,
    seekByPercentage,
    toggleShuffle,
    cycleRepeat,
    setRepeat,
    setVolume,
    toggleMute,
    loadLocalFile,
    addLocalFile,
    clearLocalImportError,
    openFilePicker,

    // Media element access (for audio visualizer)
    getMediaElement: (): HTMLMediaElement | null => managerRef.current?.getMediaElement() ?? null,

    // Constants
    acceptedMediaTypes: ACCEPTED_MEDIA_TYPES,
  }
}
