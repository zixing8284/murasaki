// Internal primitive toolkit. NOT part of the public package API.
// Do not re-export from `src/index.ts`.
//
// Migration milestones (Phase 2):
//   - useDismissable     ✅ (Tooltip wave A)
//   - useLayer           ✅ (Tooltip wave A)
//   - useFocusScope      ✅ scaffolded (Dropdown/Menu wave A)
//   - useCollection      ✅ scaffolded (Tabs / TreeView / Menu wave B)
//   - useTypeahead       ✅ scaffolded (Menu / Dropdown wave A/B)

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
