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

export function applyLinear(m: DOMMatrix, x: number, y: number): { x: number, y: number } {
  return { x: m.a * x + m.c * y, y: m.b * x + m.d * y }
}

export function scaleMagnitude(m: DOMMatrix): number {
  return Math.hypot(m.a, m.b) || 1
}

export function pointInRect(clientX: number, clientY: number, rect: DOMRect): boolean {
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
}
