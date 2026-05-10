# Pixel-font clipping safety

@murasaki/react98 treats clipped pixel-font text as a layout-sensitive surface. When a component uses `overflow: hidden`, `text-overflow: ellipsis`, an inset field border, or a scrollable/text-like row, the clip boundary must not sit flush against the first rendered glyph column.

## Problem

The library uses `Pixelated MS Sans Serif` with Windows 98-style rendering settings:

- `text-rendering: optimizeSpeed`
- `font-smooth: never`
- `-webkit-font-smoothing: none`

These settings are intentional because they keep the pixel font crisp. They also remove anti-aliasing forgiveness. If the text-bearing element's left clip edge lands on a fractional device pixel and the first glyph stem begins at that same edge, Chromium can drop the leftmost glyph column entirely. The symptom looks like the first letter of labels such as `Rose`, `Slate`, `Desert`, or `Spruce` has been slightly cut off.

The symptom can vary by browser window size, zoom, display scale, and embedded browser environment because those factors change CSS-pixel to device-pixel alignment. It may appear in a real browser while looking normal in an integrated browser preview.

## win99.dev comparison

win99.dev uses the same class of pixel font and similar smoothing settings, so the difference is not the font file by itself. Its custom select control separates the field border from the text display area:

```css
.select-root {
  height: 21px;
  box-shadow: inset -1px -1px var(--ButtonHilight),
    inset 1px 1px var(--ButtonShadow),
    inset -2px -2px var(--ButtonLight),
    inset 2px 2px var(--ButtonDkShadow);
  font-family: 'PixelatedMsSansSerif', sans-serif;
  font-size: 11px;
}

.select-display {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 2px 18px 2px 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

The important detail is that the same display element owns padding, clipping, and ellipsis. Its clip boundary is several pixels away from the glyph's left stem.

## Rule

For pixel-font text that can be clipped, make the clipping element glyph-safe:

- Put the inset border or field shadow on an outer wrapper or control element.
- Put `padding-left`, `overflow: hidden`, `white-space: nowrap`, and `text-overflow: ellipsis` on the same text display element when possible.
- Avoid nested `overflow: hidden` boxes where the inner text-bearing element has no left padding.
- If a separate text child is necessary, either let only the padded parent clip, or give the text child its own left breathing room.
- Do not fix this by changing global font smoothing; that changes the Windows 98 rendering contract and still does not address the layout cause.

## Select trigger pattern

The custom `Select` trigger follows this shape:

```tsx
<button className="relative h-5.25 p-0 shadow-(--shadow-border-field)">
  <span className="flex h-full w-full items-center overflow-hidden whitespace-nowrap text-ellipsis py-0.5 pl-1 pr-4.5 leading-none">
    {displayLabel}
  </span>
  <ButtonDownIcon className="absolute right-0.5 top-0.5" />
</button>
```

This mirrors win99.dev's outer field border plus inner display area. The label span is the only clipping box for the selected text, and its left padding keeps the clip edge away from the glyph.

## Verification

Visual verification should be done in a real browser at multiple window widths and device scales. Test labels whose first glyph has a strong left stem or curve, such as `Rose`, `Slate`, `Desert`, and `Spruce`.

Automated browser tests can verify behavior and accessibility, but this defect is pixel-alignment dependent and should not be treated as covered by role/text assertions alone.
