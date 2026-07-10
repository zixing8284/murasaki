import { useCallback, useState } from 'react'
import { Pressable, Text, type TextStyle, type ViewStyle } from 'react-native'
import { defaultBevels } from '@murasaki-io/tokens'
import { BevelView } from '../bevel'
import { useTheme } from '../theme'

export interface ButtonProps {
  children: string
  onPress?: () => void
  variant?: 'default' | 'primary'
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  children,
  onPress,
  variant = 'default',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const colors = useTheme()
  const [pressed, setPressed] = useState(false)

  const recipe =
    variant === 'primary' ? defaultBevels.raisedPrimary :
    pressed ? defaultBevels.sunken :
    defaultBevels.raised

  const handlePressIn = useCallback(() => setPressed(true), [])
  const handlePressOut = useCallback(() => setPressed(false), [])

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <BevelView
        recipe={recipe}
        colors={colors}
        style={[
          {
            paddingHorizontal: 12,
            paddingVertical: 4,
            backgroundColor: colors.buttonFace,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
      >
        <Text
          allowFontScaling={false}
          style={[
            {
              fontFamily: 'PixelatedMS Sans Serif',
              fontSize: 11,
              color: pressed ? colors.buttonFace : colors.buttonText,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </BevelView>
    </Pressable>
  )
}
