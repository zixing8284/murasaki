import { useCallback, useState } from 'react'
import { Pressable, Text, View, type ViewStyle } from 'react-native'
import { defaultBevels, checkmarkIcon } from '@murasaki-io/tokens'
import { BevelView } from '../bevel'
import { IconRenderer } from '../icon-renderer'
import { useTheme } from '../theme'

export interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  style?: ViewStyle
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  disabled = false,
  style,
}: CheckboxProps) {
  const colors = useTheme()
  const [internalChecked, setInternalChecked] = useState(checked)
  const isControlled = onCheckedChange !== undefined
  const isChecked = isControlled ? checked : internalChecked

  const handlePress = useCallback(() => {
    if (disabled) return
    const next = !isChecked
    if (isControlled) {
      onCheckedChange!(next)
    } else {
      setInternalChecked(next)
    }
  }, [disabled, isChecked, isControlled, onCheckedChange])

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <BevelView
        recipe={defaultBevels.borderField}
        colors={colors}
        style={{
          width: 13,
          height: 13,
          backgroundColor: disabled ? colors.buttonFace : colors.window,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isChecked && (
          <IconRenderer icon={checkmarkIcon} color={colors.buttonText} size={7} />
        )}
      </BevelView>

      {label && (
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'PixelatedMS Sans Serif',
            fontSize: 11,
            color: disabled ? colors.grayText : colors.buttonText,
            marginLeft: 4,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}
