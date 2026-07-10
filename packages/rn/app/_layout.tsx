import { Stack } from 'expo-router'
import { ThemeProvider } from '../src/theme'

export default function RootLayout() {
  return (
    <ThemeProvider themeId="windows-98">
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  )
}
