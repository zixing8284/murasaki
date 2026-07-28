# Win98 Desktop Shell Behavior Reference

Desktop shell architecture from `packages/playground/src/`. This documents the behavioral patterns for building a working Win98 desktop environment.

## Provider Tree

```tsx
// app.tsx
<ThemeProvider>
  <DesktopFilesProvider>
    <DesktopLayoutProvider>
      <ProcessProvider>
        <SystemCursorProvider>
          <Shell />
        </SystemCursorProvider>
      </ProcessProvider>
    </DesktopLayoutProvider>
  </DesktopFilesProvider>
</ThemeProvider>
```

| Provider | Responsibility |
|----------|---------------|
| `ThemeProvider` | Theme switching, `data-theme` attribute |
| `DesktopFilesProvider` | Media file import/storage in IndexedDB |
| `DesktopLayoutProvider` | Desktop icon grid positions (localStorage) |
| `ProcessProvider` | Window/process state management |
| `SystemCursorProvider` | Cursor state (busy/working) registry |

## Process System (Window Management)

### State Model

```ts
interface ProcessState {
  processes: Processes          // Record<pid, Process>
  foregroundId: string | null   // PID of focused window
  stackOrder: string[]          // ordered PID array, last = topmost
  container: HTMLElement | null // desktop container for portals
}
```

Each `Process` tracks: `appId`, `title`, `minimized`, `maximized`, `componentWindow` (per-window portal override), `ephemeral`, optionally `Component` and `icon`.

### Split-Context Pattern

Two React contexts to avoid unnecessary re-renders:

- **`ProcessStateContext`** — reactive, re-renders consumers when process map changes
- **`ProcessActionsContext`** — stable for provider lifetime; action-only consumers never re-render

```tsx
// In event handlers, taskbar buttons — no re-render subscription
const { open, close, activate, minimize } = useProcessActions()

// When you need the process list
const processes = useProcessList()

// Single process derived state
const { process, isActive, zIndex } = useProcess(id)
```

### Window Lifecycle Actions

| Action | Behavior |
|--------|----------|
| `open(appId, overrides?)` | Creates process, appends to stackOrder, becomes foreground. Singletons reuse existing PID. |
| `close(id)` | Removes from processes + stackOrder. If foreground, picks next non-minimized. |
| `activate(id)` | Un-minimizes, moves PID to end of stackOrder, sets foregroundId. |
| `minimize(id)` | Sets minimized=true. If foreground, picks next. |
| `toggleMaximize(id)` | Flips maximized boolean. |
| `restore(id)` | Un-minimizes and activates. |
| `minimizeAll()` | Minimizes every process, clears foregroundId (Show Desktop). |
| `deactivateAll()` | Clears foregroundId, blurs active element (click on desktop). |
| `handleTaskbarClick(id)` | 3-way toggle: minimized→restore, foreground→minimize, background→activate. |
| `openEphemeral(Component, opts)` | Runtime-determined window not in static directory. |
| `title(id, newTitle)` | Updates window title (used by IE chrome to sync with iframe). |

### PID Generation

- **Singleton**: PID = appId (e.g. `'notepad'`)
- **Non-singleton**: PID = `${appId}__${counter}` (e.g. `'notepad__1'`, `'notepad__2'`)

### Z-Order

Derived from `stackOrder` array: `zIndex = stackOrder.indexOf(id) + 1`. Last element = topmost. No explicit z-index numbers stored.

## Window Rendering

### Shell Types

| `window.type` | Shell Component | Description |
|----------------|----------------|-------------|
| `'default'` / undefined | `RndWindow` | Standard draggable/resizable window |
| `'iframe'` | `IframeWindow` | Iframe in a draggable frame |
| `'iframe'` + `chrome: 'ie2'` | `Ie2Chrome` | Full IE2 browser chrome |
| `'none'` | Raw Component | No frame (e.g. Webamp) |

### BaseWindow Structure

```
WindowPortal
  WindowFrame (absolute-positioned, z-indexed)
    WindowTitleBar
      AppIcon
      WindowTitleBarText
      WindowButtons (Minimize, Maximize, Close)
    WindowMenuBar (optional)
    WindowContent
    WindowStatusBar (optional)
    WindowResizeGrip
```

Key behaviors:
- **Click-to-focus**: `onPointerDown` on frame calls `activate(id)` with `stopPropagation()`
- **Double-click title bar**: toggles maximize
- **During drag/resize**: dotted outline placeholder, children hidden with `opacity-0` + `pointer-events-none`

### RndWindow

Wraps BaseWindow with `useDraggable` + `useResizable`:
- **Cascade positioning**: non-singleton windows offset by 30px per instance
- **Drag container**: portal container element passed to hooks for clamping
- **Minimum size**: respects `defaultSize` from directory entry

### IframeWindow

- **Glass overlay for inactive windows**: transparent overlay covers iframe when inactive. First click activates; second click reaches iframe.
- **Pointer-events during drag**: sets `iframe.style.pointerEvents = 'none'` synchronously
- **Cancel on pointer leave**: calls `cancelIframeInteraction()` when pointer leaves wrapper

### Ie2Chrome

Full IE2-style browser:
- Menu bar (File, Edit, View, Go, Favorites, Help)
- Toolbar (Back, Forward, Stop, Refresh, Home, etc.)
- Address bar (read-only, decoded URL)
- Status bar with loading animation
- Title sync via MutationObserver on iframe `<title>`

### InactiveClickGuard

Implements "first click activates, second click interacts":
- Snapshots window active state during capture-phase `pointerdown`
- If inactive, intercepts subsequent `mousedown` and `click` in capture phase
- `pointerdown` still bubbles for activation

## Taskbar

Structure: `[Start] [QuickLaunch | RunningTasks | NotificationArea | Clock]`

### Start Button
- Toggles StartMenu, ref passed for vertical anchoring

### Quick Launch
- Resizable icon shortcuts (Show Desktop, Outlook Express, IE, Welcome)
- "Show Desktop" calls `minimizeAll()`
- Visible count persisted to localStorage

### Running Tasks
- One `<Button>` per non-ephemeral process
- Shows app icon (16px) + truncated title
- Active button rendered in pressed/sunken state
- Click: `handleTaskbarClick(id)` — 3-way toggle

### Notification Area (System Tray)
- `VolumeIcon`: clickable, floating volume slider + mute checkbox
- `NetworkIcon`: cycles animated icons every 3s when online, offline icon when not
- `DisplayPropertiesIcon`: opens Display Properties
- `TaskbarSystemClock`: current time

### Start Menu

- Positioned absolutely above start button
- Max-height computed from screen top to start button
- Two-panel layout: blue gradient vertical stripe on left
- Submenus use `MenuSub`/`MenuSubContent` with `boundaryRef={screenRef}`
- Dismiss: click overlay or Escape
- Select item: calls `open(appId)` then `onClose()`

## Desktop

### Icon Grid

CSS Grid with column-first auto-fill:
- Cell: 72px × 68px
- Column gap: 4px, Row gap: 8px, Padding: 8px
- Row count computed dynamically via `ResizeObserver`

### Icon Positioning

Two tiers:
1. **Explicit** — user-dragged positions stored in localStorage as `{col, row}`
2. **Auto-placement** — CSS grid auto-placement for icons without stored position

Out-of-bounds positions (after viewport shrink) fall back to auto-placement.

### Icon Drag

- **Threshold**: 3px before drag begins
- **Multi-select drag**: all selected icons move together
- **Grid snapping**: `Math.round` for symmetric snapping
- **Collision avoidance**: rejects drops if target cell occupied
- **Visual feedback**: original at 40% opacity, clone at cursor
- **Click suppression**: after drop, suppresses next click via ref

### Icon Selection

- **Single click**: select one, deselect others
- **Ctrl/Meta+click**: toggle in selection group
- **Rubber-band**: pointer down on desktop starts selection rectangle, dotted border, additive with Ctrl/Meta
- **Selected appearance**: blue highlight on label, dotted outline, filter on icon image

### Context Menus

**Desktop background right-click:**
- Refresh (reloads media files from IndexedDB)
- Import files (file picker for audio/video)

**Icon right-click:**
- Open
- Rename (disabled)
- Delete (disabled)
- Properties (disabled)

### Desktop File Import

Drag-and-drop audio/video files onto desktop. Tracked with drag depth ref counter. Files saved to IndexedDB, appear as icons. Double-click opens in Media Player.

## App Registration (Directory)

```ts
// directory.ts
interface ProcessDirectoryEntry {
  name: string                          // Display name
  Component: LazyExoticComponent<...>   // React component (lazy)
  defaultTitle: string                  // Initial window title
  icon: { sm: string, lg: string }     // 16px and 32px icon paths
  singleton?: boolean                   // Only one instance (default: true)
  showOnDesktop?: boolean               // Appears as desktop icon
  shortcut?: boolean                    // Shortcut arrow overlay
  autoOpenOnStartup?: boolean           // Opens after boot
  ephemeral?: boolean                   // Hidden from taskbar
  defaultSize?: { width, height }       // Initial window dimensions
  defaultPosition?: { top, left, ... }  // Initial position
  window?: 'default' | 'iframe' | 'none' | { type: 'iframe', src: string, chrome?: 'ie2' }
}
```

Registered apps: welcome, docs, notepad, displayproperties, settings, jspaint, themedesigner, mediaplayer, outlookexpress, webamp, internetexplorer.

`getStartupAppIds()` returns all entries with `autoOpenOnStartup: true`.

## Inter-Process Communication

Minimal by design:
- **DesktopFilesContext**: `requestOpenInMediaPlayer(fileId)` with nonce-based one-shot pattern
- **Ephemeral windows**: `openEphemeral()` for runtime-determined windows
- **Title updates**: `actions.title(id, newTitle)` for dynamic title changes

## Persistence

| Storage | Keys |
|---------|------|
| **localStorage** | theme, wallpaper, CRT settings, screen size/scale, desktop icon layout, gradient titlebar, quick launch count, theme designer drafts |
| **IndexedDB** (`murasaki-playground` v3) | desktop media files (blobs), wallpaper images |

Desktop layout supports migration from v1 (pixel `{x, y}`) to v2 (grid `{col, row}`).

## Screen Boundary

`ScreenBoundaryContext` provides the screen element ref to deeply nested components. Floating UI uses this as `boundaryRef` for collision detection so they stay within the Win98 screen area.

## System Cursor

`SystemCursorProvider` implements ref-counted cursor states:
- `working` — lazy component resolution
- `busy` — iframe loading

Components register via `useSystemBusy(active, kind)`. Effective cursor = highest priority kind with at least one active source. Applied via `document.body.dataset.systemCursor`.

## Monitor Frame / Visual Effects

Three display modes:
1. **No bezel**: desktop fills padded viewport
2. **Fit mode + bezel**: native resolution with `max-h/w-full`, smaller resolutions = smaller visible area
3. **Numeric scale + bezel**: explicit pixel sizes, outer container scrolls

Optional CRT effects (scanlines, glow) as overlays.
