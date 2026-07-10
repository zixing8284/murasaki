import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Button } from '../src/components/Button'
import { Checkbox } from '../src/components/Checkbox'
import { Select, type SelectOption } from '../src/components/Select'
import { TextInput } from '../src/components/TextInput'
import { Window } from '../src/components/Window'
import { useTheme } from '../src/theme'

const THEME_OPTIONS: SelectOption[] = [
  { value: 'windows-98', label: 'Windows 98' },
  { value: 'windows-95', label: 'Windows 95' },
  { value: 'rainy-day', label: 'Rainy Day' },
  { value: 'marine', label: 'Marine' },
  { value: 'maple', label: 'Maple' },
]

export default function Showcase() {
  const colors = useTheme()
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('windows-98')

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'PixelatedMS Sans Serif',
          fontSize: 11,
          color: colors.windowText,
          marginBottom: 8,
        }}
      >
        React Native Win98 Prototype — Phase 3
      </Text>

      {/* Window */}
      <Window title="Notepad" style={{ height: 200 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'PixelatedMS Sans Serif',
            fontSize: 11,
            color: colors.windowText,
          }}
        >
          Hello from React Native!{'\n'}
          This window renders Win98 bevels using{'\n'}
          platform-agnostic token data.
        </Text>
      </Window>

      {/* Buttons */}
      <View style={{ gap: 8 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'PixelatedMS Sans Serif',
            fontSize: 11,
            color: colors.windowText,
            fontWeight: 'bold',
          }}
        >
          Buttons
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Button onPress={() => {}}>Default</Button>
          <Button variant="primary" onPress={() => {}}>Primary</Button>
          <Button disabled>Disabled</Button>
        </View>
      </View>

      {/* Checkbox */}
      <View style={{ gap: 8 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'PixelatedMS Sans Serif',
            fontSize: 11,
            color: colors.windowText,
            fontWeight: 'bold',
          }}
        >
          Checkbox
        </Text>
        <Checkbox
          checked={checked}
          onCheckedChange={setChecked}
          label="Enable feature"
        />
        <Checkbox checked={true} label="Always on" />
        <Checkbox checked={false} disabled label="Disabled" />
      </View>

      {/* TextInput */}
      <View style={{ gap: 8 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'PixelatedMS Sans Serif',
            fontSize: 11,
            color: colors.windowText,
            fontWeight: 'bold',
          }}
        >
          Text Input
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type here..."
        />
        <TextInput value="Read only" editable={false} />
      </View>

      {/* Select */}
      <View style={{ gap: 8 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'PixelatedMS Sans Serif',
            fontSize: 11,
            color: colors.windowText,
            fontWeight: 'bold',
          }}
        >
          Select
        </Text>
        <Select
          options={THEME_OPTIONS}
          value={selectedTheme}
          onValueChange={setSelectedTheme}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}
