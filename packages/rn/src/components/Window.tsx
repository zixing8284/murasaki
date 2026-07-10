import { type ReactNode } from 'react'
import { Pressable, Text, View, type ViewStyle } from 'react-native'
import { defaultBevels } from '@murasaki-io/tokens'
import { closeIcon, maximizeIcon, minimizeIcon } from '@murasaki-io/tokens'
import { BevelView } from '../bevel'
import { IconRenderer } from '../icon-renderer'
import { useTheme } from '../theme'

export interface WindowProps {
  title: string
  children: ReactNode
  active?: boolean
  showButtons?: boolean
  onClose?: () => void
  onMaximize?: () => void
  onMinimize?: () => void
  style?: ViewStyle
}

export function Window({
  title,
  children,
  active = true,
  showButtons = true,
  onClose,
  onMaximize,
  onMinimize,
  style,
}: WindowProps) {
  const colors = useTheme()

  return (
    <BevelView
      recipe={defaultBevels.raised}
      colors={colors}
      style={[{ backgroundColor: colors.buttonFace }, style]}
    >
      {/* Title bar */}
      <View
        style={{
          height: 20,
          backgroundColor: active ? colors.activeTitle : colors.inactiveTitle,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 3,
        }}
      >
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily: 'PixelatedMS Sans Serif',
            fontSize: 11,
            fontWeight: 'bold',
            color: active ? colors.titleText : colors.inactiveTitleText,
            marginLeft: 2,
          }}
        >
          {title}
        </Text>

        {showButtons && (
          <View style={{ flexDirection: 'row', gap: 2 }}>
            <TitleBarButton icon={minimizeIcon} onPress={onMinimize} colors={colors} />
            <TitleBarButton icon={maximizeIcon} onPress={onMaximize} colors={colors} />
            <TitleBarButton icon={closeIcon} onPress={onClose} colors={colors} />
          </View>
        )}
      </View>

      {/* Content area */}
      <BevelView
        recipe={defaultBevels.borderField}
        colors={colors}
        style={{
          margin: 3,
          padding: 4,
          backgroundColor: colors.window,
          flex: 1,
        }}
      >
        {children}
      </BevelView>
    </BevelView>
  )
}

function TitleBarButton({
  icon,
  onPress,
  colors,
}: {
  icon: typeof closeIcon
  onPress?: () => void
  colors: ReturnType<typeof useTheme>
}) {
  return (
    <Pressable onPress={onPress}>
      <BevelView
        recipe={defaultBevels.raised}
        colors={colors}
        style={{
          width: 16,
          height: 14,
          backgroundColor: colors.buttonFace,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconRenderer icon={icon} color={colors.buttonText} size={8} />
      </BevelView>
    </Pressable>
  )
}
