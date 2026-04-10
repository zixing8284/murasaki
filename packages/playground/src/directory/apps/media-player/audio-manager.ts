export interface Track {
  id: string
  title: string
  url: string
  artist?: string
  duration?: number
}

export interface AudioState {
  currentTime: number
  duration: number
  isPlaying: boolean
  loading: boolean
  currentTrack: Track | null
}

type StateChangeListener = (state: AudioState) => void

export class AudioManager {
  private isSeeking = false
  private pendingSeekTime: number | null = null
  private audio: HTMLAudioElement
  private currentSrc = ''
  private listeners: Set<StateChangeListener> = new Set()
  private state: AudioState = {
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    loading: false,
    currentTrack: null,
  }

  onTrackEnded?: () => void

  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'none'
    this.setupEventListeners()
  }

  subscribe(listener: StateChangeListener) {
    this.listeners.add(listener)
    listener(this.state)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState(): AudioState {
    return { ...this.state }
  }

  private notifyStateChange() {
    for (const listener of this.listeners) {
      listener({ ...this.state })
    }
  }

  private updateState(updates: Partial<AudioState>) {
    this.state = { ...this.state, ...updates }
    this.notifyStateChange()
  }

  private setupEventListeners() {
    this.audio.addEventListener('loadstart', () => {
      this.updateState({ loading: true })
    })

    this.audio.addEventListener('loadedmetadata', () => {
      this.updateState({ duration: this.audio.duration || 0 })
    })

    this.audio.addEventListener('canplay', () => {
      this.updateState({ loading: false })
    })

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true })
    })

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false })
    })

    this.audio.addEventListener('waiting', () => {
      this.updateState({ loading: true })
    })

    this.audio.addEventListener('seeking', () => {
      this.isSeeking = true
      this.updateState({ loading: true })
    })

    this.audio.addEventListener('seeked', () => {
      this.pendingSeekTime = null
      this.isSeeking = false
      this.updateState({ loading: false, currentTime: this.audio.currentTime })
    })

    this.audio.addEventListener('timeupdate', () => {
      if (!this.isSeeking) {
        this.updateState({ currentTime: this.audio.currentTime })
      }
    })

    this.audio.addEventListener('ended', () => {
      this.updateState({ isPlaying: false })
      this.onTrackEnded?.()
    })

    this.audio.addEventListener('error', () => {
      if (this.audio.error?.code === 4 && !this.currentSrc) return
      this.updateState({ loading: false, isPlaying: false })
    })
  }

  loadTrack(track: Track) {
    const isNew = this.currentSrc !== track.url
    if (isNew) {
      this.currentSrc = track.url
      this.audio.src = track.url
      this.audio.preload = 'auto'
    } else {
      this.audio.currentTime = 0
    }

    this.updateState({
      currentTrack: track,
      loading: true,
      currentTime: 0,
      duration: isNew ? 0 : this.state.duration,
    })

    if (isNew) this.audio.load()
  }

  async loadAndPlay(track: Track) {
    this.loadTrack(track)
    await this.play()
  }

  async play() {
    try {
      await this.audio.play()
    } catch {
      this.updateState({ isPlaying: false })
    }
  }

  pause() {
    this.audio.pause()
  }

  seek(time: number) {
    if (this.audio.readyState < HTMLMediaElement.HAVE_METADATA) return

    const duration = this.audio.duration
    if (!duration || isNaN(duration) || duration <= 0) return

    const clampedTime = Math.max(0, Math.min(time, duration))

    try {
      this.isSeeking = true
      this.pendingSeekTime = clampedTime
      this.audio.currentTime = clampedTime
      this.updateState({ loading: true, currentTime: clampedTime })
    } catch {
      this.isSeeking = false
      this.pendingSeekTime = null
    }
  }

  destroy() {
    this.audio.pause()
    this.audio.src = ''
    this.currentSrc = ''
    this.listeners.clear()
  }
}
