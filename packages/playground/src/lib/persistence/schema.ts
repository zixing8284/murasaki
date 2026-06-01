export const PLAYGROUND_CACHE_PREFIX = 'murasaki-playground-'

export const PLAYGROUND_INDEXED_DB = {
  name: 'murasaki-playground',
  version: 1,
  stores: {
    desktopMediaFiles: 'desktop-media-files',
  },
} as const

export const PLAYGROUND_STORAGE_KEYS = {
  theme: 'murasaki-theme',
  desktopLayoutV1: 'murasaki.desktop.layout.v1',
  desktopLayoutV2: 'murasaki.desktop.layout.v2',
  crtEffect: 'murasaki-crt-effect',
  crtTuning: 'murasaki-crt-tuning.v1',
  gradientTitlebar: 'murasaki-gradient-titlebar',
  taskbarQuickLaunchVisibleCount: 'murasaki.playground.taskbar.quick-launch.visible-count.v1',
  themeDesignerDraft: 'murasaki.playground.theme-designer.draft.v1',
  webampSkinMuseumLastSuccess: 'webamp:skin-museum:last-success:v1',
  webampPosition: 'webamp:position:v1',
  webampMilkdropBlacklist: 'webamp:milkdrop-blacklist:v1',
} as const

export const PLAYGROUND_LOCAL_STORAGE_KEYS = [
  PLAYGROUND_STORAGE_KEYS.theme,
  PLAYGROUND_STORAGE_KEYS.desktopLayoutV1,
  PLAYGROUND_STORAGE_KEYS.desktopLayoutV2,
  PLAYGROUND_STORAGE_KEYS.crtEffect,
  PLAYGROUND_STORAGE_KEYS.crtTuning,
  PLAYGROUND_STORAGE_KEYS.gradientTitlebar,
  PLAYGROUND_STORAGE_KEYS.taskbarQuickLaunchVisibleCount,
  PLAYGROUND_STORAGE_KEYS.themeDesignerDraft,
  PLAYGROUND_STORAGE_KEYS.webampSkinMuseumLastSuccess,
] as const

export const PLAYGROUND_SESSION_STORAGE_KEYS = [
  PLAYGROUND_STORAGE_KEYS.webampPosition,
  PLAYGROUND_STORAGE_KEYS.webampMilkdropBlacklist,
] as const
