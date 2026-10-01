import { assetPath } from '../../../lib/asset-path'

/**
 * Minimal typing for the slice of Ruffle's self-hosted JS API we use. Ruffle
 * ships no type declarations in the self-hosted bundle, so we model only what
 * we call: obtain the newest player source, create a player element, and load
 * a movie from a URL (we pass an object URL built from stored SWF bytes).
 */
export interface RufflePlayerElement extends HTMLElement {
  config: Record<string, unknown>
  load: (options: string | { url: string }) => void
}

interface RuffleSource {
  createPlayer: () => RufflePlayerElement
}

interface RufflePlayerApi {
  newest: () => RuffleSource | null
}

declare global {
  interface Window {
    RufflePlayer?: RufflePlayerApi
  }
}

const RUFFLE_SCRIPT = '/programs/entertainment/ruffle/ruffle.js'

let loaderPromise: Promise<RuffleSource> | null = null

/**
 * Load the locally vendored Ruffle runtime once and resolve with the newest
 * player source. The `<script>` is injected a single time; concurrent callers
 * share the same promise. No CDN is contacted — everything is served from the
 * bundled `public/programs/entertainment/ruffle/` folder.
 */
export function loadRuffle(): Promise<RuffleSource> {
  loaderPromise ??= new Promise<RuffleSource>((resolve, reject) => {
    const existing = window.RufflePlayer?.newest()
    if (existing) {
      resolve(existing)
      return
    }
    const script = document.createElement('script')
    script.src = assetPath(RUFFLE_SCRIPT)
    script.onload = () => {
      const source = window.RufflePlayer?.newest()
      if (source)
        resolve(source)
      else
        reject(new Error('Ruffle loaded but exposed no player source'))
    }
    script.onerror = () => reject(new Error('Failed to load the Ruffle runtime'))
    document.head.appendChild(script)
  })
  return loaderPromise
}
