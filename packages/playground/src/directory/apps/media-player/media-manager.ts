export interface Track {
  id: string
  title: string
  url: string
  artist?: string
  duration?: number
  type?: 'audio' | 'video'
}

export interface MediaState {
  currentTime: number
  duration: number
  isPlaying: boolean
  loading: boolean
  currentTrack: Track | null
  volume: number
  muted: boolean
}

type StateChangeListener = (state: MediaState) => void

export class MediaManager {
  private isSeeking = false
  private pendingSeekTime: number | null = null
  private mediaElement: HTMLMediaElement | null = null
  private currentSrc = ''
  private listeners: Set<StateChangeListener> = new Set()
  private eventCleanup: (() => void) | null = null
  private state: MediaState = {
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    loading: false,
    currentTrack: null,
    volume: 100,
    muted: false,
  }

  onTrackEnded?: () => void

  attachElement(el: HTMLMediaElement) {
    if (this.mediaElement === el) return
    this.detachElement()
    this.mediaElement = el
    this.setupEventListeners(el)
  }

  detachElement() {
    this.eventCleanup?.()
    this.eventCleanup = null
    this.mediaElement = null
  }

  subscribe(listener: StateChangeListener) {
    this.listeners.add(listener)
    listener(this.state)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState(): MediaState {
    return { ...this.state }
  }

  private notifyStateChange() {
    for (const listener of this.listeners) {
      listener({ ...this.state })
    }
  }

  private updateState(updates: Partial<MediaState>) {
    this.state = { ...this.state, ...updates }
    this.notifyStateChange()
  }

  private setupEventListeners(el: HTMLMediaElement) {
    const handlers: Array<[string, EventListener]> = []

    const on = (event: string, handler: EventListener) => {
      el.addEventListener(event, handler)
      handlers.push([event, handler])
    }

    on('loadstart', () => {
      this.updateState({ loading: true })
    })

    on('loadedmetadata', () => {
      this.updateState({ duration: el.duration || 0 })
    })

    on('canplay', () => {
      this.updateState({ loading: false })
    })

    on('play', () => {
      this.updateState({ isPlaying: true })
    })

    on('pause', () => {
      this.updateState({ isPlaying: false })
    })

    on('waiting', () => {
      this.updateState({ loading: true })
    })

    on('seeking', () => {
      this.isSeeking = true
      this.updateState({ loading: true })
    })

    on('seeked', () => {
      this.pendingSeekTime = null
      this.isSeeking = false
      this.updateState({ loading: false, currentTime: el.currentTime })
    })

    on('timeupdate', () => {
      if (!this.isSeeking) {
        this.updateState({ currentTime: el.currentTime })
      }
    })

    on('ended', () => {
      this.updateState({ isPlaying: false })
      this.onTrackEnded?.()
    })

    on('error', () => {
      if ((el as HTMLMediaElement).error?.code === 4 && !this.currentSrc) return
      this.updateState({ loading: false, isPlaying: false })
    })

    on('volumechange', () => {
      this.updateState({
        volume: Math.round(el.volume * 100),
        muted: el.muted,
      })
    })

    this.eventCleanup = () => {
      for (const [event, handler] of handlers) {
        el.removeEventListener(event, handler)
      }
    }
  }

  loadTrack(track: Track) {
    const el = this.mediaElement
    if (!el) return

    const isNew = this.currentSrc !== track.url
    if (isNew) {
      this.currentSrc = track.url
      el.src = track.url
      el.preload = 'auto'
    } else {
      el.currentTime = 0
    }

    this.updateState({
      currentTrack: track,
      loading: true,
      currentTime: 0,
      duration: isNew ? 0 : this.state.duration,
    })

    if (isNew) el.load()
  }

  async loadAndPlay(track: Track) {
    this.loadTrack(track)
    await this.play()
  }

  async play() {
    try {
      await this.mediaElement?.play()
    } catch {
      this.updateState({ isPlaying: false })
    }
  }

  pause() {
    this.mediaElement?.pause()
  }

  seek(time: number) {
    const el = this.mediaElement
    if (!el || el.readyState < HTMLMediaElement.HAVE_METADATA) return

    const duration = el.duration
    if (!duration || isNaN(duration) || duration <= 0) return

    const clampedTime = Math.max(0, Math.min(time, duration))

    try {
      this.isSeeking = true
      this.pendingSeekTime = clampedTime
      el.currentTime = clampedTime
      this.updateState({ loading: true, currentTime: clampedTime })
    } catch {
      this.isSeeking = false
      this.pendingSeekTime = null
    }
  }

  setVolume(level: number) {
    if (!this.mediaElement) return
    this.mediaElement.volume = Math.max(0, Math.min(1, level / 100))
  }

  setMuted(muted: boolean) {
    if (!this.mediaElement) return
    this.mediaElement.muted = muted
  }

  destroy() {
    const el = this.mediaElement
    if (el) {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
    this.currentSrc = ''
    this.detachElement()
    this.listeners.clear()
  }
}
