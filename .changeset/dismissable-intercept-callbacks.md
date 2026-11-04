---
"@murasaki-io/react98": minor
---

Add `onEscapeKeyDown` and `onPointerDownOutside` interceptable callbacks to `useDismissable` and the four components that use it (`ContextMenuContent`, `MenuSubContent`, `SelectContent`, `WindowMenuBarContent`). Calling `event.preventDefault()` inside either callback cancels the dismissal.
