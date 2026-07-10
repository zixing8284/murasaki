import { useState } from 'react'
import {
  TextInput as RNTextInput,
  type TextStyle,
  type ViewStyle,
} from 'react-native'
import { defaultBevels } from '@murasaki-io/tokens'
import { BevelView } from '../bevel'
import { useTheme } from '../theme'

export interface TextInputProps {
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  editable?: boolean
  multiline?: boolean
  style?: ViewStyle
  inputStyle?: TextStyle
}

export function TextInput({
  value,
  onChangeText,
  placeholder,
  editable = true,
  multiline = false,
  style,
  inputStyle,
}: TextInputProps) {
  const colors = useTheme()
  const [focused, setFocused] = useState(false)

  return (
    <BevelView
      recipe={defaultBevels.borderField}
      colors={colors}
      style={[
        {
          backgroundColor: editable ? colors.window : colors.buttonFace,
          height: multiline ? 80 : 22,
          justifyContent: multiline ? 'flex-start' : 'center',
        },
        style,
      ]}
    >
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.buttonShadow}
        editable={editable}
        multiline={multiline}
        allowFontScaling={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          {
            fontFamily: 'PixelatedMS Sans Serif',
            fontSize: 11,
            color: colors.buttonText,
            paddingHorizontal: 4,
            paddingVertical: multiline ? 4 : 0,
            flex: 1,
          },
          inputStyle,
        ]}
      />
    </BevelView>
  )
}
