import { createContext, use } from 'react'

export interface LayerContextValue {
  target: HTMLElement | null
}

export const LayerContext = createContext<LayerContextValue | null>(null)

export function useLayerPortalTarget(): HTMLElement | null {
  const layerContext = use(LayerContext)
  if (layerContext)
    return layerContext.target
  if (typeof document === 'undefined')
    return null
  return document.body
}
