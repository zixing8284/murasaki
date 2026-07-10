import { useCallback, useRef, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  type ViewStyle,
} from 'react-native'
import { defaultBevels } from '@murasaki-io/tokens'
import { BevelView } from '../bevel'
import { IconRenderer } from '../icon-renderer'
import { useTheme } from '../theme'
import { buttonDownIcon } from '@murasaki-io/tokens'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  style?: ViewStyle
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  disabled = false,
  style,
}: SelectProps) {
  const colors = useTheme()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<View>(null)
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const selectedLabel = options.find((o) => o.value === value)?.label

  const handleOpen = useCallback(() => {
    if (!disabled) {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height })
        setOpen(true)
      })
    }
  }, [disabled])

  const handleSelect = useCallback(
    (v: string) => {
      onValueChange?.(v)
      setOpen(false)
    },
    [onValueChange],
  )

  return (
    <>
      <Pressable ref={triggerRef} onPress={handleOpen} disabled={disabled}>
        <BevelView
          recipe={defaultBevels.borderField}
          colors={colors}
          style={[
            {
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              backgroundColor: disabled ? colors.buttonFace : colors.window,
              opacity: disabled ? 0.6 : 1,
              height: 22,
            },
            style,
          ]}
        >
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily: 'PixelatedMS Sans Serif',
              fontSize: 11,
              color: colors.buttonText,
              paddingLeft: 4,
            }}
          >
            {selectedLabel ?? placeholder}
          </Text>
          <View style={{ width: 16, alignItems: 'center', justifyContent: 'center' }}>
            <IconRenderer
              icon={buttonDownIcon}
              color={colors.buttonText}
              size={8}
            />
          </View>
        </BevelView>
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
          <View
            style={{
              position: 'absolute',
              left: triggerLayout.x,
              top: triggerLayout.y + triggerLayout.height,
              width: triggerLayout.width,
            }}
          >
            <BevelView
              recipe={defaultBevels.raised}
              colors={colors}
              style={{ backgroundColor: colors.buttonFace }}
            >
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                style={{ maxHeight: 150 }}
                renderItem={({ item }) => (
                  <Pressable onPress={() => handleSelect(item.value)}>
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontFamily: 'PixelatedMS Sans Serif',
                        fontSize: 11,
                        color: colors.buttonText,
                        backgroundColor:
                          item.value === value ? colors.menuHilight : undefined,
                        paddingHorizontal: 4,
                        paddingVertical: 3,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                )}
              />
            </BevelView>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}
