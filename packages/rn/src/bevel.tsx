import { type ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import type { BevelRecipe, ColorTokens } from '@murasaki-io/tokens'

export interface BevelViewProps {
  recipe: BevelRecipe
  colors: ColorTokens
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

/**
 * Renders a Win98-style 3D bevel using nested Views with per-edge border colors.
 *
 * Each BevelLayer maps to a border at that offset. Since React Native only supports
 * one borderWidth per View, layers at different offsets require nested Views.
 *
 * Example — raised bevel (4 layers, 2 offsets):
 *   Outer View (offset 1): borderTop/Left = hilight, bottom/right = dkShadow
 *     Inner View (offset 2): top/left = light, bottom/right = shadow
 */
export function BevelView({ recipe, colors, style, children }: BevelViewProps) {
  // Group layers by offset
  const layersByOffset = new Map<number, { topLeft?: string; bottomRight?: string }>()

  for (const layer of recipe.layers) {
    const existing = layersByOffset.get(layer.offset) ?? {}
    const resolvedColor = resolveColor(colors, layer.colorToken)
    if (layer.edge === 'top-left') {
      existing.topLeft = resolvedColor
    } else {
      existing.bottomRight = resolvedColor
    }
    layersByOffset.set(layer.offset, existing)
  }

  // Sort offsets ascending (outermost first)
  const offsets = Array.from(layersByOffset.keys()).sort((a, b) => a - b)

  // Build nested Views from outermost to innermost
  let content = children
  for (let i = offsets.length - 1; i >= 0; i--) {
    const offset = offsets[i]
    const edgeColors = layersByOffset.get(offset)!
    content = (
      <View
        style={{
          borderTopColor: edgeColors.topLeft,
          borderLeftColor: edgeColors.topLeft,
          borderBottomColor: edgeColors.bottomRight,
          borderRightColor: edgeColors.bottomRight,
          borderWidth: 1,
          ...(i === offsets.length - 1 ? style : undefined),
        }}
      >
        {content}
      </View>
    )
  }

  return <>{content}</>
}

function resolveColor(colors: ColorTokens, token: keyof ColorTokens): string {
  return colors[token]
}
