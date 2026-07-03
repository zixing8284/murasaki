import type { CrtTuningSettings } from '../hooks/use-crt-tuning'
import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  // Top-left origin uv so the (unflipped) video texture is upright.
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
varying vec2 v_uv;

uniform sampler2D u_tex;
uniform float u_time;
uniform float u_warp;
uniform float u_scan;
uniform float u_mask;
uniform float u_aberration;
uniform float u_vignette;
uniform float u_flicker;
uniform vec2 u_outputRes;

vec2 barrel(vec2 uv, float amount) {
  vec2 c = uv - 0.5;
  float r2 = dot(c, c);
  return 0.5 + c * (1.0 + r2 * amount);
}

vec3 sampleSource(vec2 duv) {
  if (duv.x < 0.0 || duv.x > 1.0 || duv.y < 0.0 || duv.y > 1.0) {
    return vec3(0.0);
  }
  return texture2D(u_tex, duv).rgb;
}

void main() {
  vec2 duvR = barrel(v_uv + vec2(u_aberration, 0.0), u_warp);
  vec2 duvG = barrel(v_uv, u_warp);
  vec2 duvB = barrel(v_uv - vec2(u_aberration, 0.0), u_warp);

  vec3 col;
  col.r = sampleSource(duvR).r;
  col.g = sampleSource(duvG).g;
  col.b = sampleSource(duvB).b;

  // Scanlines based on output vertical resolution.
  float scanY = v_uv.y * u_outputRes.y;
  float scan = 0.5 + 0.5 * sin(scanY * 3.14159265);
  col *= mix(1.0, 0.6 + 0.4 * scan, u_scan);

  // RGB shadow mask — vertical triads based on output x.
  float mx = mod(floor(v_uv.x * u_outputRes.x), 3.0);
  vec3 maskTint = mx < 1.0 ? vec3(1.05, 0.95, 0.95)
                : mx < 2.0 ? vec3(0.95, 1.05, 0.95)
                : vec3(0.95, 0.95, 1.05);
  col *= mix(vec3(1.0), maskTint, u_mask);

  // Keep the brightness variation gentle to avoid noticeable screen flashing.
  col *= 1.0 + u_flicker * sin(u_time * 10.0);

  // Vignette.
  vec2 c = v_uv - 0.5;
  float vig = smoothstep(0.75, 0.25, length(c));
  col *= mix(1.0, vig, u_vignette);

  gl_FragColor = vec4(col, 1.0);
}
`

const BARREL_WARP = 0.18
const SHADOW_MASK = 0.18
const CHROMATIC_ABERRATION = 0.0016
const VIGNETTE = 0.32

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader)
    return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[ShaderGlass] Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

interface ShaderGlassProps {
  stream: MediaStream
  settings: CrtTuningSettings
}

/**
 * Draws the captured screen region through a CRT shader onto a canvas that
 * overlays the interactive desktop. The canvas is `pointer-events-none`, so the
 * live DOM underneath stays fully interactive — it just becomes visually
 * replaced by the shaded, curved-glass version.
 */
export function ShaderGlass({ stream, settings }: ShaderGlassProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const settingsRef = useRef(settings)

  // Keep the latest tuning available to the render loop without restarting it.
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return

    const video = document.createElement('video')
    video.playsInline = true
    video.muted = true
    video.srcObject = stream
    const playPromise = video.play()
    if (playPromise)
      playPromise.catch(() => {})

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) {
      console.warn('[ShaderGlass] WebGL not supported')
      return
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs)
      return

    const program = gl.createProgram()
    if (!program)
      return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[ShaderGlass] Program link error:', gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const uniforms = {
      tex: gl.getUniformLocation(program, 'u_tex'),
      time: gl.getUniformLocation(program, 'u_time'),
      warp: gl.getUniformLocation(program, 'u_warp'),
      scan: gl.getUniformLocation(program, 'u_scan'),
      mask: gl.getUniformLocation(program, 'u_mask'),
      aberration: gl.getUniformLocation(program, 'u_aberration'),
      vignette: gl.getUniformLocation(program, 'u_vignette'),
      flicker: gl.getUniformLocation(program, 'u_flicker'),
      outputRes: gl.getUniformLocation(program, 'u_outputRes'),
    }

    function syncSize(): void {
      const parent = canvas!.parentElement
      if (!parent)
        return
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(rect.width * dpr))
      const h = Math.max(1, Math.round(rect.height * dpr))
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
      }
    }

    const start = performance.now()
    let rafId = 0

    function render(): void {
      rafId = requestAnimationFrame(render)
      if (!gl || video.readyState < 2)
        return

      syncSize()
      gl.viewport(0, 0, canvas!.width, canvas!.height)

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      }
      catch {
        return
      }

      const tuning = settingsRef.current
      const scan = Math.min(1, tuning.scanlineOpacity * 1.4)
      const flicker = Math.min(0.045, tuning.jitterAmount * 0.018)

      gl.uniform1i(uniforms.tex, 0)
      gl.uniform1f(uniforms.time, (performance.now() - start) * 0.001)
      gl.uniform1f(uniforms.warp, BARREL_WARP)
      gl.uniform1f(uniforms.scan, scan)
      gl.uniform1f(uniforms.mask, SHADOW_MASK)
      gl.uniform1f(uniforms.aberration, CHROMATIC_ABERRATION)
      gl.uniform1f(uniforms.vignette, VIGNETTE)
      gl.uniform1f(uniforms.flicker, flicker)
      gl.uniform2f(uniforms.outputRes, canvas!.width, canvas!.height)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    render()

    return () => {
      cancelAnimationFrame(rafId)
      video.pause()
      video.srcObject = null
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [stream])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block h-full w-full"
    />
  )
}
