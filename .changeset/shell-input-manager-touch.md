---
'@murasaki-io/react98': patch
---

Move playground-specific touch drag/resize behavior out of the package-level `useDraggable` and `useResizable` hooks. Those hooks return to their generic mouse-driven behavior, while the playground now owns mobile/device-emulation shell input through a dedicated shell input manager. Window title bar touch double-tap behavior is also owned by the playground shell instead of the reusable `WindowTitleBar` component.
