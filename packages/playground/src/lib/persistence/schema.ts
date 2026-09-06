export const PLAYGROUND_CACHE_PREFIX = 'murasaki-playground-'

export const PLAYGROUND_INDEXED_DB = {
  name: 'murasaki-playground',
  version: 3,
  stores: {
    desktopMediaFiles: 'desktop-media-files',
    wallpaperImages: 'wallpaper-images',
  },
} as const

export const PLAYGROUND_STORAGE_KEYS = {
  theme: 'murasaki-theme',
  desktopLayoutV1: 'murasaki.desktop.layout.v1',
  desktopLayoutV2: 'murasaki.desktop.layout.v2',
  crtEffect: 'murasaki-crt-effect',
  crtTuning: 'murasaki-crt-tuning.v1',
  monitorFrame: 'murasaki-monitor-frame',
  gradientTitlebar: 'murasaki-gradient-titlebar',
  wallpaper: 'murasaki-wallpaper',
  desktopBgColor: 'murasaki-desktop-bg-color',
  iconLabelBgColor: 'murasaki-icon-label-bg-color',
  screenSize: 'murasaki-screen-size',
  screenScale: 'murasaki-screen-scale',
  cursorScheme: 'murasaki-cursor-scheme',
  taskbarQuickLaunchVisibleCount: 'murasaki.playground.taskbar.quick-launch.visible-count.v1',
  taskbarSmallStartIcons: 'murasaki.playground.taskbar.small-start-icons.v1',
  themeDesignerDraft: 'murasaki.playground.theme-designer.draft.v1',
  webampSkinMuseumLastSuccess: 'webamp:skin-museum:last-success:v1',
  webampPosition: 'webamp:position:v1',
  webampMilkdropBlacklist: 'webamp:milkdrop-blacklist:v1',
  windowPositions: 'murasaki.window.positions.v1',
} as const

export const PLAYGROUND_LOCAL_STORAGE_KEYS = [
  PLAYGROUND_STORAGE_KEYS.theme,
  PLAYGROUND_STORAGE_KEYS.desktopLayoutV1,
  PLAYGROUND_STORAGE_KEYS.desktopLayoutV2,
  PLAYGROUND_STORAGE_KEYS.crtEffect,
  PLAYGROUND_STORAGE_KEYS.crtTuning,
  PLAYGROUND_STORAGE_KEYS.monitorFrame,
  PLAYGROUND_STORAGE_KEYS.gradientTitlebar,
  PLAYGROUND_STORAGE_KEYS.wallpaper,
  PLAYGROUND_STORAGE_KEYS.desktopBgColor,
  PLAYGROUND_STORAGE_KEYS.iconLabelBgColor,
  PLAYGROUND_STORAGE_KEYS.screenSize,
  PLAYGROUND_STORAGE_KEYS.screenScale,
  PLAYGROUND_STORAGE_KEYS.cursorScheme,
  PLAYGROUND_STORAGE_KEYS.taskbarQuickLaunchVisibleCount,
  PLAYGROUND_STORAGE_KEYS.taskbarSmallStartIcons,
  PLAYGROUND_STORAGE_KEYS.themeDesignerDraft,
  PLAYGROUND_STORAGE_KEYS.webampSkinMuseumLastSuccess,
] as const

export const PLAYGROUND_SESSION_STORAGE_KEYS = [
  PLAYGROUND_STORAGE_KEYS.webampPosition,
  PLAYGROUND_STORAGE_KEYS.webampMilkdropBlacklist,
  PLAYGROUND_STORAGE_KEYS.windowPositions,
] as const
