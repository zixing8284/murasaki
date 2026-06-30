import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
varying vec2 v_uv;

void main() {
  vec2 d = v_uv - 0.5;
  float r = length(d) / 0.5;

  // Spherical normal
  float rr = min(r, 1.0);
  float z = sqrt(max(0.0, 1.0 - rr * rr));
  vec3 N = normalize(vec3(d * 2.0, z));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L = normalize(vec3(-0.4, -0.5, 1.0));
  vec3 H = normalize(L + V);
  float NdotH = max(dot(N, H), 0.0);

  // Edge darkening — black overlay with alpha to darken edges
  // r=0 (center) → alpha 0 (transparent), r=1 (edge) → alpha ~0.4 (dark)
  float edgeAlpha = smoothstep(0.3, 1.0, r) * 0.4;

  // Fresnel rim — bright white ring at curved edges
  float rim = smoothstep(0.5, 0.82, r) * smoothstep(1.0, 0.82, r);

  // Specular hotspot — tight bright spot
  float spec = pow(NdotH, 120.0);

  // Broad specular sheen
  float specBroad = pow(NdotH, 12.0) * 0.3;

  // Additive highlights (white)
  float highlight = rim * 0.35 + spec * 0.85 + specBroad;

  // Mix: where we have highlights use white, otherwise use black for darkening
  vec3 col = vec3(highlight);
  float a = max(edgeAlpha, highlight);

  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}
`

function initWebgl(canvas: HTMLCanvasElement): (() => void) | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    preserveDrawingBuffer: false,
  })
  if (!gl) {
    console.warn('[CrtGlassWebgl] WebGL not supported')
    return null
  }

  function compileShader(type: number, source: string): WebGLShader | null {
    const shader = gl!.createShader(type)
    if (!shader)
      return null
    gl!.shaderSource(shader, source)
    gl!.compileShader(shader)
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      console.warn('[CrtGlassWebgl] Shader compile error:', gl!.getShaderInfoLog(shader))
      gl!.deleteShader(shader)
      return null
    }
    return shader
  }

  const vs = compileShader(gl.VERTEX_SHADER, VERT)
  const fs = compileShader(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs)
    return null

  const program = gl.createProgram()
  if (!program)
    return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[CrtGlassWebgl] Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  gl.useProgram(program)

  // Full-screen quad
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,
    -1,
    1,
    -1,
    -1,
    1,
    -1,
    1,
    1,
    -1,
    1,
    1,
  ]), gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  return () => {
    gl.deleteBuffer(buf)
    gl.deleteProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
  }
}

export function CrtGlassWebgl(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return

    // Sync canvas size with parent and render
    function syncSize(): void {
      const parent = canvas!.parentElement
      if (!parent)
        return
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      if (w <= 0 || h <= 0)
        return
      if (canvas!.width === w && canvas!.height === h)
        return
      canvas!.width = w
      canvas!.height = h
      cleanupRef.current?.()
      cleanupRef.current = initWebgl(canvas!)
    }

    // Initial size sync
    syncSize()

    const ro = new ResizeObserver(() => syncSize())
    ro.observe(canvas.parentElement ?? canvas)

    return () => {
      ro.disconnect()
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-3"
    />
  )
}
