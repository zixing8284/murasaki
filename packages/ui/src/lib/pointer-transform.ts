/**
 * Helpers for mapping pointer movement between screen pixels and an element's
 * local coordinate space when an ancestor applies a CSS `transform`
 * (e.g. a scaled/rotated desktop canvas). Kept internal to the library.
 */

/**
 * Accumulated linear (2×2) transform mapping the element's local coordinate
 * space to screen pixels, walking every ancestor's CSS `transform`. Only the
 * linear part matters for mapping movement deltas, so translation and
 * transform-origin are ignored. Returns identity when no ancestor is
 * transformed, leaving the unscaled path unaffected.
 */
export function getScreenFromLocalMatrix(el: Element): DOMMatrix {
  let matrix = new DOMMatrix()
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { transform } = getComputedStyle(node)
    if (transform && transform !== 'none') {
      const m = new DOMMatrix(transform)
      matrix = new DOMMatrix([m.a, m.b, m.c, m.d, 0, 0]).multiply(matrix)
    }
  }
  return matrix
}

/** Apply a matrix's linear part to a delta/vector. */
export function applyLinear(m: DOMMatrix, x: number, y: number): { x: number, y: number } {
  return { x: m.a * x + m.c * y, y: m.b * x + m.d * y }
}

/** Uniform scale magnitude of a linear transform (1 at identity). */
export function scaleMagnitude(m: DOMMatrix): number {
  return Math.hypot(m.a, m.b) || 1
}
