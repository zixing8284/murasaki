---
"@murasaki-io/react98": minor
---

Extend the themeable cursor token set with `--cursor-text`, `--cursor-not-allowed`, `--cursor-move`, `--cursor-ew-resize`, `--cursor-ns-resize`, `--cursor-nwse-resize`, and `--cursor-nesw-resize`, each with a matching Tailwind utility override. Disabled-state and resize cursors now route through these tokens instead of hardcoded keywords, native text fields (`TextBox`, `NumberBox`) route their I-beam through `--cursor-text`, and the native `Select` routes its pointer through `--cursor-pointer`, so consumers can skin every pointer cursor library-wide. Defaults remain the system keywords for standalone use.
