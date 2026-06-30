/**
 * Global audio volume / mute controller.
 *
 * Drives the Web Audio API masterGain node from global-audio-context so
 * that system volume multiplies on top of each app's own el.volume:
 *
 *   final output = el.volume  ×  masterGain.gain.value
 *
 * A MutationObserver ensures every <audio>/<video> element that appears
 * in the DOM is automatically routed through the master gain node via
 * connectMediaElement(), including elements added by Webamp or other apps.
 *
 * Module-level singleton: safe to call getGlobalAudio() from multiple
 * components — they all share the same observer and state.
 */

import { connectMediaElement, getGlobalAudioCtx } from '../../../lib/global-audio-context'

type Listener = (state: { volume: number, muted: boolean }) => void

class GlobalAudio {
  private volume = 75
  private muted = false
  private listeners: Set<Listener> = new Set()
  private observer: MutationObserver | null = null

  /** Starts the DOM observer. Call once when the app mounts. */
  init(): void {
    if (this.observer)
      return

    // Connect any media elements already in the DOM
    Array.from(document.querySelectorAll('audio, video')).forEach((el) => {
      if (el instanceof HTMLMediaElement)
        connectMediaElement(el)
    })

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType !== Node.ELEMENT_NODE)
            continue
          const el = node as Element
          if (el instanceof HTMLMediaElement) {
            connectMediaElement(el)
          }
          Array.from(el.querySelectorAll('audio, video')).forEach((child) => {
            if (child instanceof HTMLMediaElement)
              connectMediaElement(child)
          })
        }
      }
    })

    this.observer.observe(document.body, { childList: true, subtree: true })

    // Apply initial gain
    this.applyGain()
  }

  destroy(): void {
    this.observer?.disconnect()
    this.observer = null
  }

  getVolume(): number {
    return this.volume
  }

  getMuted(): boolean {
    return this.muted
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume))
    this.applyGain()
    this.notify()
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    this.applyGain()
    this.notify()
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private applyGain(): void {
    const { masterGain } = getGlobalAudioCtx()
    masterGain.gain.value = this.muted ? 0 : this.volume / 100
  }

  private notify(): void {
    const state = { volume: this.volume, muted: this.muted }
    for (const listener of this.listeners) {
      listener(state)
    }
  }
}

const globalAudio = new GlobalAudio()

export function getGlobalAudio(): GlobalAudio {
  return globalAudio
}
