import type { ThemeId } from '@murasaki-io/react98'
import type { WallpaperImageEntry } from '../../../lib/wallpaper-storage'
import type { WallpaperSettings } from '../../../lib/wallpapers'

export interface FormState {
  selectedTheme: ThemeId
  committedCrtEnabled: boolean
  committedCrtTuning: { scanlineOpacity: number, jitterAmount: number, rollDuration: number, rollOpacity: number }
  committedGradientEnabled: boolean
  selectedWallpaper: WallpaperSettings
  selectedWallpaperColor: string
  committedWallpaper: WallpaperSettings
  committedWallpaperColor: string
  customWallpapers: WallpaperImageEntry[]
}

export type FormAction
  = | { type: 'SET_SELECTED_THEME', value: ThemeId }
    | { type: 'SET_COMMITTED_CRT_ENABLED', value: boolean }
    | { type: 'SET_COMMITTED_CRT_TUNING', value: FormState['committedCrtTuning'] }
    | { type: 'SET_COMMITTED_GRADIENT_ENABLED', value: boolean }
    | { type: 'SET_SELECTED_WALLPAPER', value: WallpaperSettings }
    | { type: 'SET_SELECTED_WALLPAPER_COLOR', value: string }
    | { type: 'SET_COMMITTED_WALLPAPER', value: WallpaperSettings }
    | { type: 'SET_COMMITTED_WALLPAPER_COLOR', value: string }
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
    case 'SET_COMMITTED_GRADIENT_ENABLED':
      return { ...state, committedGradientEnabled: action.value }
    case 'SET_SELECTED_WALLPAPER':
      return { ...state, selectedWallpaper: action.value }
    case 'SET_SELECTED_WALLPAPER_COLOR':
      return { ...state, selectedWallpaperColor: action.value }
    case 'SET_COMMITTED_WALLPAPER':
      return { ...state, committedWallpaper: action.value }
    case 'SET_COMMITTED_WALLPAPER_COLOR':
      return { ...state, committedWallpaperColor: action.value }
    case 'SET_CUSTOM_WALLPAPERS':
      return { ...state, customWallpapers: action.value }
    case 'ADD_CUSTOM_WALLPAPER':
      return { ...state, customWallpapers: [...state.customWallpapers, action.value] }
  }
}
