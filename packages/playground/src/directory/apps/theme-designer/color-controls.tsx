import type { ThemeColorsState } from './use-theme-colors'
import { Checkbox } from 'murasaki-react98'

interface ColorControlsProps {
  state: ThemeColorsState
}

/** Grouped color fields — each group is a fieldset in the UI. */
const COLOR_GROUPS: Array<{ label: string, items: Array<{ key: string, label: string }> }> = [
  {
    label: 'Button',
    items: [
      { key: 'button-face', label: 'ButtonFace' },
      { key: 'button-dk-shadow', label: 'ButtonDkShadow' },
      { key: 'button-text', label: 'ButtonText' },
      { key: 'button-alternate-face', label: 'ButtonAlternateFace' },
      // Derived when linked: button-hilight, button-light, button-shadow
      { key: 'button-hilight', label: 'ButtonHilight' },
      { key: 'button-light', label: 'ButtonLight' },
      { key: 'button-shadow', label: 'ButtonShadow' },
    ],
  },
  {
    label: 'Window',
    items: [
      { key: 'window', label: 'Window' },
      { key: 'window-frame', label: 'WindowFrame' },
      { key: 'window-text', label: 'WindowText' },
      { key: 'background', label: 'Background' },
      // Derived when linked: active-border, inactive-border, scrollbar, app-workspace
      { key: 'active-border', label: 'ActiveBorder' },
      { key: 'inactive-border', label: 'InactiveBorder' },
      { key: 'scrollbar', label: 'Scrollbar' },
      { key: 'app-workspace', label: 'AppWorkspace' },
    ],
  },
  {
    label: 'Title Bar',
    items: [
      { key: 'active-title', label: 'ActiveTitle' },
      { key: 'gradient-active-title', label: 'GradientActiveTitle' },
      { key: 'inactive-title', label: 'InactiveTitle' },
      { key: 'gradient-inactive-title', label: 'GradientInactiveTitle' },
      { key: 'title-text', label: 'TitleText' },
      { key: 'inactive-title-text', label: 'InactiveTitleText' },
    ],
  },
  {
    label: 'Menu',
    items: [
      { key: 'menu', label: 'Menu' },
      { key: 'menu-bar', label: 'MenuBar' },
      { key: 'menu-hilight', label: 'MenuHilight' },
      { key: 'menu-text', label: 'MenuText' },
    ],
  },
  {
    label: 'Selection',
    items: [
      { key: 'hilight', label: 'Hilight' },
      { key: 'hilight-text', label: 'HilightText' },
      { key: 'hot-tracking-color', label: 'HotTrackingColor' },
      { key: 'gray-text', label: 'GrayText' },
    ],
  },
  {
    label: 'Tooltip',
    items: [
      { key: 'info-text', label: 'InfoText' },
      { key: 'info-window', label: 'InfoWindow' },
    ],
  },
]

export function ColorControls({ state }: ColorControlsProps): React.ReactElement {
  const { allColors, linkElements, titlebarGradients, setColor, setLinkElements, setTitlebarGradients, isDerived } = state

  return (
    <div className="flex flex-col gap-1.5 p-1">
      {/* Toggle controls */}
      <div className="flex flex-col gap-1 pb-1 border-b border-(--button-shadow)">
        <Checkbox
          checked={linkElements}
          onChange={e => setLinkElements(e.target.checked)}
        >
          Link elements
        </Checkbox>
        <Checkbox
          checked={titlebarGradients}
          onChange={e => setTitlebarGradients(e.target.checked)}
        >
          Title bar gradients
        </Checkbox>
      </div>

      {/* Color groups */}
      {COLOR_GROUPS.map(group => (
        <fieldset
          key={group.label}
          className="border border-(--button-shadow) px-1.5 pb-1.5 pt-0"
        >
          <legend className="text-(--button-text) px-0.5">{group.label}</legend>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const derived = isDerived(item.key)
              if (derived)
                return null

              return (
                <label
                  key={item.key}
                  className="flex items-center gap-1.5 text-(--button-text) cursor-pointer"
                >
                  <input
                    type="color"
                    value={allColors[item.key] ?? '#000000'}
                    onChange={e => setColor(item.key, e.target.value)}
                    className="w-5 h-3.5 border border-(--button-dk-shadow) p-0 cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
