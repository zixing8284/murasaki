import type { ThemeId } from '@murasaki-io/react98'
import type { WallpaperImageEntry } from '../../../lib/wallpaper-storage'
import type { WallpaperSettings } from '../../../lib/wallpapers'

export interface FormState {
  selectedTheme: ThemeId
  committedCrtEnabled: boolean
  committedCrtTuning: { scanlineOpacity: number, jitterAmount: number, rollDuration: number, rollOpacity: number }
  committedMonitorFrame: boolean
  committedGradientEnabled: boolean
  selectedWallpaper: WallpaperSettings
  selectedDesktopBgColor: string
  selectedIconLabelBgColor: string
  committedWallpaper: WallpaperSettings
  committedDesktopBgColor: string
  committedIconLabelBgColor: string
  customWallpapers: WallpaperImageEntry[]
}

export type FormAction
  = | { type: 'SET_SELECTED_THEME', value: ThemeId }
    | { type: 'SET_COMMITTED_CRT_ENABLED', value: boolean }
    | { type: 'SET_COMMITTED_CRT_TUNING', value: FormState['committedCrtTuning'] }
    | { type: 'SET_COMMITTED_MONITOR_FRAME', value: boolean }
    | { type: 'SET_COMMITTED_GRADIENT_ENABLED', value: boolean }
    | { type: 'SET_SELECTED_WALLPAPER', value: WallpaperSettings }
    | { type: 'SET_SELECTED_DESKTOP_BG_COLOR', value: string }
    | { type: 'SET_SELECTED_ICON_LABEL_BG_COLOR', value: string }
    | { type: 'SET_COMMITTED_WALLPAPER', value: WallpaperSettings }
    | { type: 'SET_COMMITTED_DESKTOP_BG_COLOR', value: string }
    | { type: 'SET_COMMITTED_ICON_LABEL_BG_COLOR', value: string }
    | { type: 'SET_CUSTOM_WALLPAPERS', value: WallpaperImageEntry[] }
    | { type: 'ADD_CUSTOM_WALLPAPER', value: WallpaperImageEntry }

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_SELECTED_THEME':
      return { ...state, selectedTheme: action.value }
    case 'SET_COMMITTED_CRT_ENABLED':
      return { ...state, committedCrtEnabled: action.value }
    case 'SET_COMMITTED_CRT_TUNING':
      return { ...state, committedCrtTuning: action.value }
    case 'SET_COMMITTED_MONITOR_FRAME':
      return { ...state, committedMonitorFrame: action.value }
    case 'SET_COMMITTED_GRADIENT_ENABLED':
      return { ...state, committedGradientEnabled: action.value }
    case 'SET_SELECTED_WALLPAPER':
      return { ...state, selectedWallpaper: action.value }
    case 'SET_SELECTED_DESKTOP_BG_COLOR':
      return { ...state, selectedDesktopBgColor: action.value }
    case 'SET_SELECTED_ICON_LABEL_BG_COLOR':
      return { ...state, selectedIconLabelBgColor: action.value }
    case 'SET_COMMITTED_WALLPAPER':
      return { ...state, committedWallpaper: action.value }
    case 'SET_COMMITTED_DESKTOP_BG_COLOR':
      return { ...state, committedDesktopBgColor: action.value }
    case 'SET_COMMITTED_ICON_LABEL_BG_COLOR':
      return { ...state, committedIconLabelBgColor: action.value }
    case 'SET_CUSTOM_WALLPAPERS':
      return { ...state, customWallpapers: action.value }
    case 'ADD_CUSTOM_WALLPAPER':
      return { ...state, customWallpapers: [...state.customWallpapers, action.value] }
  }
}
