import type { ColorTokens, IconData } from '@murasaki-io/tokens'
import Svg, { Path, Rect } from 'react-native-svg'
import { useTheme } from './theme'

function resolveFill(fill: string, theme: ColorTokens, fallback: string): string {
  if (fill === 'currentColor') return fallback
  if (fill in theme) return theme[fill as keyof ColorTokens]
  return fallback
}

export function IconRenderer({
  icon,
  color,
  size,
}: {
  icon: IconData
  color: string
  size: number
}) {
  const theme = useTheme()
  const [vw, vh] = icon.viewBox
  const scale = size / Math.max(vw, vh)
  const w = Math.round(vw * scale)
  const h = Math.round(vh * scale)

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${vw} ${vh}`}>
      {icon.shapes.map((shape, i) =>
        shape.d ? (
          <Path
            key={i}
            d={shape.d}
            fill={resolveFill(shape.fill, theme, color)}
            fillRule="evenodd"
          />
        ) : shape.rect ? (
          <Rect
            key={i}
            x={shape.rect.x}
            y={shape.rect.y}
            width={shape.rect.width}
            height={shape.rect.height}
            fill={resolveFill(shape.fill, theme, color)}
          />
        ) : null,
      )}
    </Svg>
  )
}
