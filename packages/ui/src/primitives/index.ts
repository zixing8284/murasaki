// Internal primitive toolkit. NOT part of the public package API.
// Do not re-export from `src/index.ts`.

export { LayerContext, LayerPortal, useLayerPortalTarget } from './layer-root'
export type { LayerContextValue, LayerPortalProps } from './layer-root'

export {
  BAR_SIZE,
  BTN_HEIGHT,
  computeThumb,
  REPEAT_MS,
  SCROLL_STEP,
  THUMB_BOX_SHADOW,
  TRACK_BG_COLOR,
  TRACK_BG_IMAGE,
  TRACK_BG_SIZE,
  useScrollbar,
} from './scrollbar'
export type { ThumbMetrics, UseScrollbarOptions } from './scrollbar'

export { useCollection } from './use-collection'
export type { CollectionItem, UseCollectionResult } from './use-collection'

export { useDismissable } from './use-dismissable'
export type { UseDismissableOptions } from './use-dismissable'

export { useFocusScope } from './use-focus-scope'
export type { UseFocusScopeOptions } from './use-focus-scope'

export { useLayer } from './use-layer'
export type { LayerAlign, LayerPosition, LayerSide, UseLayerOptions } from './use-layer'

export { useRovingFocus } from './use-roving-focus'
export type { RovingOrientation, UseRovingFocusOptions } from './use-roving-focus'

export { useTypeahead } from './use-typeahead'
export type { UseTypeaheadOptions, UseTypeaheadResult } from './use-typeahead'
