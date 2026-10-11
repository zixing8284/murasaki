# Windows fit the work area; dialogs pin their command bar

## Context

The playground renders at a fixed logical resolution (640×480 … 1600×1200) scaled
to the viewport. Non-resizable, non-maximizable dialogs (Display Properties, Mouse
Properties, Settings, Taskbar Properties, …) have a fixed `defaultSize`. At small
resolutions a dialog's `defaultSize` can exceed the desktop work area (the screen
minus the taskbar).

Two things then went wrong:

1. The window frame only clamped its **position**, not its **size**. A frame taller
   than the work area extended past the bottom of the desktop, where the desktop
   container's `overflow-clip` hid the overflow — there was no way to reach it.
2. Display Properties put its OK/Cancel/Apply bar **inside** the scrollable content
   region (`WindowContent` is `overflow-hidden`), and its root was natural-height
   (`flex flex-col`) rather than filling the frame. So when the content was taller
   than the frame, the command bar was clipped away with no way to reach it — the
   reported bug. The other dialogs already filled the frame and pinned their command
   bar, so only Display Properties regressed, but the rule was never written down.

This matches the Windows 98 convention: dialogs are authored to fit the minimum
supported resolution, their command buttons are chrome (always visible), and the
window never extends past the screen work area.

## Decision

### Windows never exceed the desktop work area

The playground window frame carries `max-w-full max-h-full` (in `base-window`), so a
frame is capped to its positioning container — the desktop area above the taskbar.
Combined with the existing initial-position clamp, a window that is larger than the
work area fills it exactly (top-left pinned) instead of spilling off-screen. This is
a general safety net for every window at every resolution.

### Dialogs pin their command bar and scroll their body

A dialog with a command bar (OK/Cancel/Apply) uses the fill-height layout:

- Root: `flex h-full min-h-0 flex-col` — fills the window content box.
- Body (the tabs/content): `flex-1 min-h-0`. Where its content can be taller than the
  frame, scroll it with the library's `ScrollArea` (the themed Win98 scrollbar), not
  native `overflow`, so the scrollbar matches the rest of the UI. In Display Properties
  each tab page uses the local `ScrollableTabPanel` wrapper (`TabPanel` → `ScrollArea`
  → padded body).
- Command bar: the last child, a `shrink-0` sibling — pinned at the bottom and always
  visible, never part of the scroll region.

Prefer authoring dialog content to fit the smallest supported resolution (640×480
work area). The cap + scroll is the safety net for when it cannot.

## Consequences

- No window renders larger than the desktop; nothing is clipped off-screen.
- A dialog's OK/Cancel/Apply buttons stay visible at every resolution; tall content
  scrolls within the body while the command bar stays put.
- New dialogs inherit the behaviour by following the fill-height layout; the frame cap
  protects them even if they forget.
- `WindowContent` stays `overflow-hidden` (the clip boundary); scrolling is owned by
  the dialog body via `ScrollArea`, so windows that manage their own scrolling (iframes,
  auto-sized games) are unaffected.

## Non-goals

- Making every window resizable or maximizable. Fixed dialogs stay fixed; they just
  fit the work area.
- Shrinking dialog content to fit arbitrarily tiny viewports. Below the smallest
  supported resolution the body scrolls rather than reflowing.
