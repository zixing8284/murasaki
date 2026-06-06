---
"@murasaki-io/react98": patch
---

fix(ui): remove CheckboxLabel from public exports

CheckboxLabel is an internal implementation detail of the Checkbox component that relies on CSS sibling selectors and cannot function independently. Remove it from the public API to avoid confusion.
