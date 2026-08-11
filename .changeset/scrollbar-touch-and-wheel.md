---
'@murasaki-io/react98': patch
---

Make the Windows 98 scrollbars touch-capable and fix wheel scrolling over them. Both the declarative `ScrollArea` and the `useScrollbar` primitive (used by `TextBox` multiline and `Select`) now drive their thumb, track, and arrow buttons with Pointer Events (so they work with touch/pen), the thumb drag is scale-aware, and two-finger/wheel scrolling over the scrollbar bars is forwarded to the scroll container — previously the overlay bars had no scrollable ancestor, so wheeling over them did nothing. Window caption buttons (minimize/maximize/close) also get a slightly larger hit target on coarse (touch) pointers.
