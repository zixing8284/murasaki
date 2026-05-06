import type { RefObject } from 'react'
import type { MediaState, Track } from './media-manager'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { formatTime } from './format-time'
import { MediaManager } from './media-manager'

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
  if (file)
    return file.type.startsWith('video/') ? 'video' : 'audio'
  if (url && VIDEO_EXTENSIONS.test(url))
    return 'video'
  return 'audio'
}

let nextLocalId = 1

// Default playlist from public/media/
const DEFAULT_PLAYLIST: Track[] = [
  { id: '1', title: 'Bach\'s Brandenburg Concerto No. 3', url: '/media/Bach\'s Brandenburg Concerto No. 3.mp3', artist: 'J.S. Bach' },
  { id: '2', title: 'Beethoven\'s 5th Symphony', url: '/media/Beethoven\'s 5th Symphony.mp3', artist: 'Beethoven' },
  { id: '3', title: 'Beethoven\'s Fur Elise', url: '/media/Beethoven\'s Fur Elise.mp3', artist: 'Beethoven' },
  { id: '4', title: 'Dance of the Sugar-Plum Fairy', url: '/media/Dance of the Sugar-Plum Fairy.mp3', artist: 'Tchaikovsky' },
  { id: '5', title: 'Debussy\'s Claire de Lune', url: '/media/Debussy\'s Claire de Lune.mp3', artist: 'Debussy' },
  { id: '6', title: 'In the Hall of the Mountain King', url: '/media/In the Hall of the Mountain King.mp3', artist: 'Grieg' },
  { id: '7', title: 'Mozart\'s Symphony No. 40', url: '/media/Mozart\'s Symphony No. 40.mp3', artist: 'Mozart' },
  { id: '8', title: 'The Microsoft Sound', url: '/media/The Microsoft Sound.mp3', artist: 'Microsoft' },
]

interface PlayerState {
  playlist: Track[]
  currentIndex: number
  shuffle: boolean
  repeat: 'off' | 'one' | 'all'
  playOrderIndices: number[]
}

export interface UseMediaPlayerResult {
  isPlaying: boolean
  loading: boolean
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
  openFilePicker: () => void
  getMediaElement: () => HTMLMediaElement | null
  acceptedMediaTypes: string
}

export function useMediaPlayer(): UseMediaPlayerResult {
  const [mediaState, setMediaState] = useState<MediaState | null>(null)
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

  const playOrder = useMemo(
    () => model.playOrderIndices.map(idx => model.playlist[idx]),
    [model.playlist, model.playOrderIndices],
  )

  const getAdjacentTrackRef = useRef<(offset: number, ignoreRepeat: boolean) => Track | null>(null)

  const getAdjacentTrack = useCallback(
    (offset: number, ignoreRepeat: boolean = false): Track | null => {
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
    },
    [model.playOrderIndices, model.currentIndex, model.repeat, playOrder],
  )

  useLayoutEffect(() => {
    getAdjacentTrackRef.current = getAdjacentTrack
  })

  /** Play a track (from playlist double-click). Updates model index and starts playback. */
  const playTrack = useCallback((track: Track) => {
    const manager = managerRef.current
    if (!manager)
      return
    const index = model.playlist.findIndex(t => t.id === track.id)
    if (index !== -1) {
      setModel(prev => ({ ...prev, currentIndex: index }))
    }
    manager.loadAndPlay(track)
  }, [model.playlist])

  /** Switch to an adjacent track (next/previous). Loads or plays depending on current state. */
  const switchTrack = useCallback(
    (track: Track) => {
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
    },
    [model.playlist, mediaState?.isPlaying],
  )

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

  const togglePlay = useCallback(() => {
    const manager = managerRef.current
    if (!manager)
      return
    if (mediaState?.isPlaying) {
      manager.pause()
    }
    else if (mediaState?.currentTrack) {
      manager.play()
    }
  }, [mediaState?.isPlaying, mediaState?.currentTrack])

  const stop = useCallback(() => {
    const manager = managerRef.current
    if (!manager)
      return
    manager.pause()
    manager.seek(0)
  }, [])

  const next = useCallback(() => {
    if (!playOrder.length)
      return
    const nextTrack = getAdjacentTrack(1, true)
    if (nextTrack)
      switchTrack(nextTrack)
  }, [playOrder.length, getAdjacentTrack, switchTrack])

  const previous = useCallback(() => {
    if (!playOrder.length)
      return
    if ((mediaState?.currentTime ?? 0) > 3) {
      managerRef.current?.seek(0)
      return
    }
    const prevTrack = getAdjacentTrack(-1, true)
    if (prevTrack)
      switchTrack(prevTrack)
  }, [playOrder.length, mediaState?.currentTime, getAdjacentTrack, switchTrack])

  const seek = useCallback((time: number) => {
    managerRef.current?.seek(time)
  }, [])

  const seekByPercentage = useCallback(
    (percentage: number) => {
      const duration = mediaState?.duration ?? 0
      if (duration > 0) {
        seek((percentage / 100) * duration)
      }
    },
    [mediaState?.duration, seek],
  )

  /** Load a local file and optionally replace previous local selections. */
  const loadLocalFile = useCallback((file: File, options?: { replacePlaylist?: boolean }) => {
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
  }, [])

  /** Add a local file to the playlist and auto-play it */
  const addLocalFile = useCallback((file: File) => {
    loadLocalFile(file)
  }, [loadLocalFile])

  /** Open file picker to load local media */
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const toggleShuffle = useCallback(() => {
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
  }, [])

  const cycleRepeat = useCallback(() => {
    setModel((prev) => {
      const modes = ['off', 'one', 'all'] as const
      const idx = modes.indexOf(prev.repeat)
      return { ...prev, repeat: modes[(idx + 1) % 3] }
    })
  }, [])

  const setRepeat = useCallback((mode: 'off' | 'one' | 'all') => {
    setModel(prev => ({ ...prev, repeat: mode }))
  }, [])

  const setVolume = useCallback((level: number) => {
    managerRef.current?.setVolume(level)
  }, [])

  const toggleMute = useCallback(() => {
    const manager = managerRef.current
    if (!manager)
      return
    const state = manager.getState()
    manager.setMuted(!state.muted)
  }, [])

  const progress = mediaState && mediaState.duration > 0
    ? (mediaState.currentTime / mediaState.duration) * 100
    : 0

  const currentTrack = mediaState?.currentTrack ?? null
  const hasVideo = mediaState?.hasVideo ?? false

  return {
    // Media state
    isPlaying: mediaState?.isPlaying ?? false,
    loading: mediaState?.loading ?? false,
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
    openFilePicker,

    // Media element access (for audio visualizer)
    getMediaElement: useCallback(() => managerRef.current?.getMediaElement() ?? null, []),

    // Constants
    acceptedMediaTypes: ACCEPTED_MEDIA_TYPES,
  }
}
