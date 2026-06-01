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
  errorMessage: string | null
  currentTrack: Track | null
  volume: number
  muted: boolean
  hasVideo: boolean
}

type StateChangeListener = (state: MediaState) => void

export class MediaManager {
  private static readonly LOCAL_MEDIA_LOAD_TIMEOUT_MS = 8000
  private isSeeking = false
  private pendingSeekTime: number | null = null
  private mediaElement: HTMLMediaElement | null = null
  private currentSrc = ''
  private loadTimeoutId: number | null = null
  private listeners: Set<StateChangeListener> = new Set()
  private eventCleanup: (() => void) | null = null
  private state: MediaState = {
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    loading: false,
    errorMessage: null,
    currentTrack: null,
    volume: 100,
    muted: false,
    hasVideo: false,
  }

  onTrackEnded?: () => void

  attachElement(el: HTMLMediaElement): void {
    if (this.mediaElement === el)
      return
    this.detachElement()
    this.mediaElement = el
    this.setupEventListeners(el)
  }

  detachElement(): void {
    this.eventCleanup?.()
    this.eventCleanup = null
    this.mediaElement = null
  }

  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState(): MediaState {
    return { ...this.state }
  }

  private notifyStateChange(): void {
    for (const listener of this.listeners) {
      listener({ ...this.state })
    }
  }

  private updateState(updates: Partial<MediaState>): void {
    this.state = { ...this.state, ...updates }
    this.notifyStateChange()
  }

  private clearLoadTimeout(): void {
    if (this.loadTimeoutId != null) {
      window.clearTimeout(this.loadTimeoutId)
      this.loadTimeoutId = null
    }
  }

  private startLocalLoadTimeout(track: Track): void {
    this.clearLoadTimeout()
    if (!track.url.startsWith('blob:'))
      return
    this.loadTimeoutId = window.setTimeout(() => {
      const el = this.mediaElement
      if (!el)
        return
      if (!this.state.loading)
        return
      const metadataReady = el.readyState >= HTMLMediaElement.HAVE_METADATA
      if (metadataReady)
        return

      this.updateState({
        loading: false,
        isPlaying: false,
        errorMessage: 'This media could not be decoded in this browser. The MP4 codec might be unsupported in Firefox.',
      })
    }, MediaManager.LOCAL_MEDIA_LOAD_TIMEOUT_MS)
  }

  private buildDecodeErrorMessage(track: Track, mediaErrorCode?: number): string {
    const isLocalBlob = track.url.startsWith('blob:')
    const prefix = track.type === 'video' ? 'Video' : 'Audio'

    if (mediaErrorCode === 3 || mediaErrorCode === 4) {
      return isLocalBlob
        ? `${prefix} could not be decoded. This MP4 codec might be unsupported in Firefox.`
        : `${prefix} could not be decoded by the browser.`
    }

    return isLocalBlob
      ? `${prefix} could not be loaded in this browser. The media encoding may be unsupported.`
      : `${prefix} could not be loaded.`
  }

  private setupEventListeners(el: HTMLMediaElement): void {
    const handlers: Array<[string, EventListener]> = []

    const on = (event: string, handler: EventListener): void => {
      el.addEventListener(event, handler)
      handlers.push([event, handler])
    }

    on('loadstart', () => {
      this.updateState({ loading: true, errorMessage: null })
    })

    on('loadedmetadata', () => {
      const hasVideo = 'videoWidth' in el && (el as HTMLVideoElement).videoWidth > 0
      this.updateState({ duration: el.duration || 0, hasVideo })
    })

    on('canplay', () => {
      this.clearLoadTimeout()
      this.updateState({ loading: false, errorMessage: null })
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
      if ((el as HTMLMediaElement).error?.code === 4 && !this.currentSrc)
        return

      const track = this.state.currentTrack
      const errorCode = (el as HTMLMediaElement).error?.code
      const errorMessage = track
        ? this.buildDecodeErrorMessage(track, errorCode)
        : 'Media could not be loaded.'

      this.clearLoadTimeout()
      this.updateState({ loading: false, isPlaying: false, errorMessage })
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

  loadTrack(track: Track): void {
    const el = this.mediaElement
    if (!el)
      return

    const isNew = this.currentSrc !== track.url
    if (isNew) {
      this.currentSrc = track.url
      el.src = track.url
      el.preload = 'auto'
    }
    else {
      el.currentTime = 0
    }

    this.updateState({
      currentTrack: track,
      loading: true,
      errorMessage: null,
      currentTime: 0,
      duration: isNew ? 0 : this.state.duration,
    })

    this.startLocalLoadTimeout(track)

    if (isNew)
      el.load()
  }

  async loadAndPlay(track: Track): Promise<void> {
    this.loadTrack(track)
    await this.play()
  }

  async play(): Promise<void> {
    try {
      await this.mediaElement?.play()
    }
    catch {
      this.updateState({ isPlaying: false })
    }
  }

  pause(): void {
    this.mediaElement?.pause()
  }

  seek(time: number): void {
    const el = this.mediaElement
    if (!el || el.readyState < HTMLMediaElement.HAVE_METADATA)
      return

    const duration = el.duration
    if (!duration || Number.isNaN(duration) || duration <= 0)
      return

    const clampedTime = Math.max(0, Math.min(time, duration))

    try {
      this.isSeeking = true
      this.pendingSeekTime = clampedTime
      el.currentTime = clampedTime
      this.updateState({ loading: true, currentTime: clampedTime })
    }
    catch {
      this.isSeeking = false
      this.pendingSeekTime = null
    }
  }

  setVolume(level: number): void {
    if (!this.mediaElement)
      return
    this.mediaElement.volume = Math.max(0, Math.min(1, level / 100))
  }

  setMuted(muted: boolean): void {
    if (!this.mediaElement)
      return
    this.mediaElement.muted = muted
  }

  getMediaElement(): HTMLMediaElement | null {
    return this.mediaElement
  }

  destroy(): void {
    this.clearLoadTimeout()
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
