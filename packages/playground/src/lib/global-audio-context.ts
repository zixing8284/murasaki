/**
 * Shared Web Audio API singleton.
 *
 * All media in the playground flows through one AudioContext and one
 * master GainNode:
 *
 *   MediaElementAudioSourceNode → [optional processing] → masterGain → destination
 *
 * This lets system-level volume (masterGain.gain.value) multiply on top
 * of each app's own el.volume, so they are fully independent:
 *   final output = el.volume × masterGain.gain.value
 *
 * Because the Web Audio spec forbids creating more than one
 * MediaElementAudioSourceNode per HTMLMediaElement, every component
 * that needs a source node (visualizer, global volume) must go through
 * connectMediaElement() here — it returns the cached node and creates
 * it on first call.
 *
 * Components that insert processing nodes between source and masterGain
 * (e.g. the audio visualizer) are responsible for:
 *   1. Disconnecting the source from masterGain.
 *   2. Connecting: source → processingNode → masterGain.
 *   3. On cleanup: disconnecting processingNode, reconnecting source → masterGain.
 */

export interface GlobalAudioCtx {
  ctx: AudioContext
  masterGain: GainNode
  /** source node cache — shared across all consumers */
  sourceCache: WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>
}

let instance: GlobalAudioCtx | null = null

function createInstance(): GlobalAudioCtx {
  const ctx = new AudioContext()
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.75
  masterGain.connect(ctx.destination)
  return { ctx, masterGain, sourceCache: new WeakMap() }
}

export function getGlobalAudioCtx(): GlobalAudioCtx {
  if (!instance) {
    instance = createInstance()
  }
  return instance
}

/**
 * Returns the MediaElementAudioSourceNode for the given element.
 * Creates one and connects it to masterGain if it doesn't exist yet.
 * Safe to call multiple times for the same element.
 */
export function connectMediaElement(el: HTMLMediaElement): MediaElementAudioSourceNode {
  const { ctx, masterGain, sourceCache } = getGlobalAudioCtx()

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  let source = sourceCache.get(el)
  if (!source) {
    source = ctx.createMediaElementSource(el)
    source.connect(masterGain)
    sourceCache.set(el, source)
  }
  return source
}
