# Win98 Visual System Reference

Complete token reference for the Windows 98 design system. Source of truth: `packages/tokens/src/` and `packages/ui/src/theme.css`.

## Color Tokens (34 keys)

All values are CSS color strings. On web, consumed via CSS custom properties (`--button-face`). On other platforms, resolved from the JS token objects.

### Button (7)

| Token | CSS Variable | Win98 Default |
|-------|-------------|---------------|
| `buttonAlternateFace` | `--button-alternate-face` | `rgb(192, 192, 192)` |
| `buttonDkShadow` | `--button-dk-shadow` | `rgb(64, 64, 64)` |
| `buttonFace` | `--button-face` | `rgb(212, 208, 200)` |
| `buttonHilight` | `--button-hilight` | `rgb(255, 255, 255)` |
| `buttonLight` | `--button-light` | `rgb(212, 208, 200)` |
| `buttonShadow` | `--button-shadow` | `rgb(128, 128, 128)` |
| `buttonText` | `--button-text` | `rgb(34, 34, 34)` |

### Window / Frame (8)

| Token | CSS Variable | Win98 Default |
|-------|-------------|---------------|
| `activeBorder` | `--active-border` | `rgb(212, 208, 200)` |
| `appWorkspace` | `--app-workspace` | `rgb(128, 128, 128)` |
| `desktopText` | `--desktop-text` | `rgb(255, 255, 255)` |
| `inactiveBorder` | `--inactive-border` | `rgb(212, 208, 200)` |
| `scrollbar` | `--scrollbar` | `rgb(212, 208, 200)` |
| `window` | `--window` | `rgb(255, 255, 255)` |
| `windowFrame` | `--window-frame` | `rgb(0, 0, 0)` |
| `windowText` | `--window-text` | `rgb(0, 0, 0)` |

### Title Bar (6)

| Token | CSS Variable | Win98 Default |
|-------|-------------|---------------|
| `activeTitle` | `--active-title` | `rgb(10, 36, 106)` |
| `gradientActiveTitle` | `--gradient-active-title` | `rgb(166, 202, 240)` |
| `gradientInactiveTitle` | `--gradient-inactive-title` | `rgb(192, 192, 192)` |
| `inactiveTitle` | `--inactive-title` | `rgb(128, 128, 128)` |
| `inactiveTitleText` | `--inactive-title-text` | `rgb(212, 208, 200)` |
| `titleText` | `--title-text` | `rgb(255, 255, 255)` |

### Menu (5)

| Token | CSS Variable | Win98 Default |
|-------|-------------|---------------|
| `menu` | `--menu` | `rgb(212, 208, 200)` |
| `menuBar` | `--menu-bar` | `rgb(212, 208, 200)` |
| `menuHilight` | `--menu-hilight` | `rgb(0, 0, 128)` |
| `menuText` | `--menu-text` | `rgb(0, 0, 0)` |
| `grayText` | `--gray-text` | `rgb(128, 128, 128)` |

### Highlight / Selection (3)

| Token | CSS Variable | Win98 Default |
|-------|-------------|---------------|
| `hilight` | `--hilight` | `rgb(10, 36, 106)` |
| `hilightText` | `--hilight-text` | `rgb(255, 255, 255)` |
| `hotTrackingColor` | `--hot-tracking-color` | `rgb(0, 0, 128)` |

### Tooltip (2)

| Token | CSS Variable | Win98 Default |
|-------|-------------|---------------|
| `infoText` | `--info-text` | `rgb(0, 0, 0)` |
| `infoWindow` | `--info-window` | `rgb(255, 255, 225)` |

### Desktop (1)

| Token | CSS Variable | Win98 Default |
|-------|-------------|---------------|
| `background` | `--background` | `rgb(58, 110, 165)` |

## Bevel / Shadow System

The Win98 3D edge effect is defined as layered bevel recipes. Each layer specifies an edge (`top-left` or `bottom-right`), a color token, and a pixel offset.

### Presets

| Preset | CSS Variable | Layers | Use for |
|--------|-------------|--------|---------|
| `raised` | `--shadow-raised` | 4 layers | Buttons, toolbars, window frames, menus |
| `sunken` | `--shadow-sunken` | 4 layers | Pressed buttons, active/checked states |
| `raisedPrimary` | `--shadow-raised-primary` | 5 layers | Default/OK buttons (thicker outline) |
| `borderField` | `--shadow-border-field` | 4 layers | Text inputs, selects, field panels |

### Layer details

**raised:**
1. `bottom-right` — `buttonDkShadow` at offset 1 (outer dark shadow)
2. `top-left` — `buttonHilight` at offset 1 (outer bright highlight)
3. `bottom-right` — `buttonShadow` at offset 2 (inner medium shadow)
4. `top-left` — `buttonLight` at offset 2 (inner medium light)

**sunken:** (inverted raised)
1. `bottom-right` — `buttonHilight` at offset 1
2. `top-left` — `buttonDkShadow` at offset 1
3. `bottom-right` — `buttonLight` at offset 2
4. `top-left` — `buttonShadow` at offset 2

**raisedPrimary:**
1. `bottom-right` — `windowFrame` at offset 2
2. `top-left` — `windowFrame` at offset 1
3. `top-left` — `buttonHilight` at offset 2
4. `bottom-right` — `buttonShadow` at offset 3
5. `top-left` — `buttonLight` at offset 3

**borderField:**
1. `bottom-right` — `buttonHilight` at offset 1
2. `top-left` — `buttonShadow` at offset 1
3. `bottom-right` — `buttonLight` at offset 2
4. `top-left` — `buttonDkShadow` at offset 2

### Web rendering

On web, bevels are rendered as CSS `box-shadow: inset ...` with multiple layers. The CSS variables `--shadow-raised` etc. are pre-computed in `theme.css`.

```tsx
// Tailwind utility
<div className="shadow-(--shadow-raised)">...</div>

// Equivalent CSS
// box-shadow: inset -1px -1px rgb(64,64,64), inset 1px 1px rgb(255,255,255),
//             inset -2px -2px rgb(128,128,128), inset 2px 2px rgb(212,208,200);
```

### Other platforms

- **React Native**: render as `border*Width` + `border*Color` per edge
- **Canvas/SVG**: draw rectangles on each edge

## Spacing Tokens (8 values)

| Token | CSS Variable | Value |
|-------|-------------|-------|
| `elementSpacing` | `--element-spacing` | 8px |
| `labelSpacing` | `--label-spacing` | 6px |
| `groupedButtonSpacing` | `--grouped-button-spacing` | 4px |
| `groupedElementSpacing` | `--grouped-element-spacing` | 6px |
| `checkboxWidth` | `--checkbox-width` | 13px |
| `optionSize` | `--option-size` | 12px |
| `rangeTrackHeight` | `--range-track-height` | 4px |
| `rangeSpacing` | `--range-spacing` | 10px |

## Font System

| Property | Value |
|----------|-------|
| Primary family | `Pixelated MS Sans Serif` |
| Primary weights | 400 (normal), 700 (bold) |
| Symbol family | `Marlett` |
| Symbol weights | 400 (normal) |
| Default size | 11px |

Font files are loaded via `@font-face` in `theme.css`. The `Marlett` font provides system icons (resize grip dots, scroll arrows).

Rendering settings (applied globally):
- `image-rendering: pixelated`
- `text-rendering: optimizeSpeed`
- `-webkit-font-smoothing: none`

## Layer Z-Index Tokens

| Token | CSS Variable | Value | Use for |
|-------|-------------|-------|---------|
| Root | `--react98-layer-root-z-index` | 1000 | Layer root container |
| Popup | `--react98-layer-popup-z-index` | 10 | Menus, selects, context menus |
| Tooltip | `--react98-layer-tooltip-z-index` | 20 | Tooltips |
| Scrollbar | `--react98-layer-scrollbar-z-index` | 5 | Scroll area overlays |

The layer root uses `position: absolute; inset: 0; isolation: isolate; pointer-events: none;`. Layered content uses `pointer-events-auto` to receive events.

## Cursor Tokens

| Token | CSS Variable | Default |
|-------|-------------|---------|
| Default | `--cursor-default` | `default` |
| Pointer | `--cursor-pointer` | `pointer` |

These override Tailwind's `cursor-default` / `cursor-pointer` utilities via `@utility` declarations.

## Themes (19 built-in)

| ID | Style |
|----|-------|
| `windows-98` | Default — classic Win98 gray |
| `windows-95` | Win95 style |
| `windows-standard` | Standard Windows |
| `brick` | Red/brown tones |
| `desert` | Sandy/brown |
| `eggplant` | Purple/green |
| `lilac` | Light purple |
| `maple` | Warm orange/brown |
| `marine` | Teal/blue-green |
| `plum` | Deep purple |
| `pumpkin` | Orange tones |
| `rainy-day` | Blue/gray |
| `red-white-and-blue` | Patriotic |
| `rose` | Pink tones |
| `slate` | Blue/gray |
| `spruce` | Dark green |
| `storm` | Dark blue/gray |
| `teal` | Teal tones |
| `wheat` | Light brown/tan |

Switch themes by setting `data-theme="<id>"` on `<html>`.

## Icons

Icons are pure data (viewBox + shapes). Each shape has either an SVG `d` path or a `rect`, and a `fill` that is either `'currentColor'` (inherits parent color) or a `keyof ColorTokens` reference (resolved from the active theme at render time).

### Available icons

| Category | Icons |
|----------|-------|
| Window | close, maximize, maximizeDisabled, minimize, restore, help |
| Checkbox | checkmark |
| Radio | radioBorder, radioDot |
| Scroll | arrowUp, arrowDown, arrowLeft, arrowRight |
| Select | buttonDown, buttonDownActive |
| Slider | rectThumb, triangleThumb |
| Taskbar | expandArrow |

### Dither pattern

For active/disabled button fills: a 2×2 checkerboard alternating `buttonFace` and `buttonHilight`. On web, rendered as a base64 PNG or SVG pattern. On other platforms, drawn pixel-by-pixel.

### Etched text effect

For disabled labels: 1px offset duplicate in `buttonHilight` color. On web: `text-shadow: 1px 1px 0 var(--button-hilight)`.
