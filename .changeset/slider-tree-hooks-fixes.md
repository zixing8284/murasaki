---
"@murasaki-io/react98": minor
---

feat: disabled states for slider/checkbox, custom TreeView icons, and callback ref fixes

- Add disabled styling to slider, checkbox, and option-button with etched text effect
- Slider track uses sunken shadow token, increased width, and crispEdges on thumb SVGs
- TreeView gains `expandIcon` and `collapseIcon` props for custom disclosure icons
- `useDraggable` / `useResizable` use latest-callback refs to prevent orphaned listeners on re-render
- Remove hardcoded `text-xs` / `text-[10px]` from progress-indicator and slider tick labels
