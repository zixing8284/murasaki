import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { AudioState, Track } from './audio-manager'
import { AudioManager } from './audio-manager'

// Singleton pattern from murasaki-old
let singletonManager: AudioManager | null = null
let singletonRefCount = 0

function acquireManager(): AudioManager {
  if (!singletonManager) {
    singletonManager = new AudioManager()
  }
  singletonRefCount++
  return singletonManager
}

function releaseManager() {
  if (singletonRefCount > 0) {
    singletonRefCount--
    if (singletonRefCount === 0 && singletonManager) {
      singletonManager.destroy()
      singletonManager = null
    }
  }
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// Default playlist from public/media/
const DEFAULT_PLAYLIST: Track[] = [
  { id: '1', title: "Bach's Brandenburg Concerto No. 3", url: "/media/Bach's Brandenburg Concerto No. 3.mp3", artist: 'J.S. Bach' },
  { id: '2', title: "Beethoven's 5th Symphony", url: "/media/Beethoven's 5th Symphony.mp3", artist: 'Beethoven' },
  { id: '3', title: "Beethoven's Fur Elise", url: "/media/Beethoven's Fur Elise.mp3", artist: 'Beethoven' },
  { id: '4', title: 'Dance of the Sugar-Plum Fairy', url: '/media/Dance of the Sugar-Plum Fairy.mp3', artist: 'Tchaikovsky' },
  { id: '5', title: "Debussy's Claire de Lune", url: "/media/Debussy's Claire de Lune.mp3", artist: 'Debussy' },
  { id: '6', title: 'In the Hall of the Mountain King', url: '/media/In the Hall of the Mountain King.mp3', artist: 'Grieg' },
  { id: '7', title: "Mozart's Symphony No. 40", url: "/media/Mozart's Symphony No. 40.mp3", artist: 'Mozart' },
  { id: '8', title: 'The Microsoft Sound', url: '/media/The Microsoft Sound.mp3', artist: 'Microsoft' },
]

interface PlayerState {
  playlist: Track[]
  currentIndex: number
  shuffle: boolean
  repeat: 'off' | 'one' | 'all'
  playOrderIndices: number[]
}

export function useMediaPlayer() {
  const [audioState, setAudioState] = useState<AudioState | null>(null)
  const managerRef = useRef<AudioManager | null>(null)

  useEffect(() => {
    const manager = acquireManager()
    managerRef.current = manager
    const unsubscribe = manager.subscribe(setAudioState)
    return () => {
      unsubscribe()
      managerRef.current = null
      releaseManager()
    }
  }, [])

  const [model, setModel] = useState<PlayerState>(() => ({
    playlist: DEFAULT_PLAYLIST,
    currentIndex: -1,
    shuffle: false,
    repeat: 'off',
    playOrderIndices: Array.from({ length: DEFAULT_PLAYLIST.length }, (_, i) => i),
  }))

  const playOrder = useMemo(
    () => model.playOrderIndices.map((idx) => model.playlist[idx]),
    [model.playlist, model.playOrderIndices],
  )

  const getAdjacentTrackRef = useRef<(offset: number, ignoreRepeat: boolean) => Track | null>(null)

  const getAdjacentTrack = useCallback(
    (offset: number, ignoreRepeat: boolean = false): Track | null => {
      if (playOrder.length === 0) return null

      const currentPlayOrderIndex = model.playOrderIndices.findIndex(
        (idx) => idx === model.currentIndex,
      )

      if (currentPlayOrderIndex === -1) return playOrder[0] ?? null

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
    if (!manager) return
    const index = model.playlist.findIndex((t) => t.id === track.id)
    if (index !== -1) {
      setModel((prev) => ({ ...prev, currentIndex: index }))
    }
    manager.loadAndPlay(track)
  }, [model.playlist])

  /** Switch to an adjacent track (next/previous). Loads or plays depending on current state. */
  const switchTrack = useCallback(
    (track: Track) => {
      const index = model.playlist.findIndex((t) => t.id === track.id)
      if (index === -1) return

      setModel((prev) => ({ ...prev, currentIndex: index }))

      const manager = managerRef.current
      if (!manager) return
      if (audioState?.isPlaying) {
        manager.loadAndPlay(track)
      } else {
        manager.loadTrack(track)
      }
    },
    [model.playlist, audioState?.isPlaying],
  )

  // Handle track ended
  useEffect(() => {
    const manager = managerRef.current
    if (!manager) return

    manager.onTrackEnded = () => {
      if (model.repeat === 'one') {
        manager.seek(0)
        manager.play()
      } else {
        const nextTrack = getAdjacentTrackRef.current?.(1, false)
        if (nextTrack) {
          // Update model index before loading
          setModel((prev) => {
            const index = prev.playlist.findIndex((t) => t.id === nextTrack.id)
            return index !== -1 ? { ...prev, currentIndex: index } : prev
          })
          manager.loadAndPlay(nextTrack)
        }
      }
    }
  }, [model.repeat])

  const togglePlay = useCallback(() => {
    const manager = managerRef.current
    if (!manager) return
    if (audioState?.isPlaying) {
      manager.pause()
    } else if (audioState?.currentTrack) {
      manager.play()
    }
  }, [audioState?.isPlaying, audioState?.currentTrack])

  const stop = useCallback(() => {
    const manager = managerRef.current
    if (!manager) return
    manager.pause()
    manager.seek(0)
  }, [])

  const next = useCallback(() => {
    if (!playOrder.length) return
    const nextTrack = getAdjacentTrack(1, true)
    if (nextTrack) switchTrack(nextTrack)
  }, [playOrder.length, getAdjacentTrack, switchTrack])

  const previous = useCallback(() => {
    if (!playOrder.length) return
    if ((audioState?.currentTime ?? 0) > 3) {
      managerRef.current?.seek(0)
      return
    }
    const prevTrack = getAdjacentTrack(-1, true)
    if (prevTrack) switchTrack(prevTrack)
  }, [playOrder.length, audioState?.currentTime, getAdjacentTrack, switchTrack])

  const seek = useCallback((time: number) => {
    managerRef.current?.seek(time)
  }, [])

  const seekByPercentage = useCallback(
    (percentage: number) => {
      const duration = audioState?.duration ?? 0
      if (duration > 0) {
        seek((percentage / 100) * duration)
      }
    },
    [audioState?.duration, seek],
  )

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
      } else {
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
    setModel((prev) => ({ ...prev, repeat: mode }))
  }, [])

  const progress = audioState && audioState.duration > 0
    ? (audioState.currentTime / audioState.duration) * 100
    : 0

  return {
    // Audio state
    isPlaying: audioState?.isPlaying ?? false,
    loading: audioState?.loading ?? false,
    currentTime: audioState?.currentTime ?? 0,
    duration: audioState?.duration ?? 0,
    currentTrack: audioState?.currentTrack ?? null,
    progress,
    formattedCurrentTime: formatTime(audioState?.currentTime ?? 0),
    formattedDuration: formatTime(audioState?.duration ?? 0),

    // Model state
    playlist: model.playlist,
    currentIndex: model.currentIndex,
    shuffle: model.shuffle,
    repeat: model.repeat,

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
  }
}
