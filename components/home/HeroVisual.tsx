"use client"

import { useEffect, useRef } from "react"
import { prefersReducedMotion } from "./gsap-setup"

/**
 * Generative pixel-field visual standing in for the hero WebGL scene.
 * A grid of square cells driven by layered value noise; cells flip between
 * background, ink, and indigo, echoing the site's pixel motif.
 * Plain 2D canvas — cheap, DPR-aware, mouse-reactive.
 */

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function smooth(t: number) {
  return t * t * (3 - 2 * t)
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  const u = smooth(xf)
  const v = smooth(yf)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

export function HeroVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let width = 0
    let height = 0
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const CELL = 14
    const reduced = prefersReducedMotion()

    // GitHub-contributions style: one hue, stepped intensity ladder.
    // hue はテーマ変数 (--m-indigo) から導出し、配色替えに追従する
    let LEVELS = [
      "rgba(0, 0, 0, 0.05)",
      "rgba(15, 0, 176, 0.14)",
      "rgba(15, 0, 176, 0.32)",
      "rgba(15, 0, 176, 0.55)",
      "rgba(15, 0, 176, 0.78)",
      "#0f00b0",
    ]
    const readPalette = () => {
      const cs = getComputedStyle(canvas)
      const accent = cs.getPropertyValue("--m-indigo").trim() || "#0f00b0"
      const ink = cs.getPropertyValue("--m-ink").trim() || "#000000"
      const hex = accent.replace("#", "")
      if (hex.length !== 6) return
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const inkHex = ink.replace("#", "")
      const ir = parseInt(inkHex.slice(0, 2), 16) || 0
      const ig = parseInt(inkHex.slice(2, 4), 16) || 0
      const ib = parseInt(inkHex.slice(4, 6), 16) || 0
      LEVELS = [
        `rgba(${ir}, ${ig}, ${ib}, 0.05)`,
        `rgba(${r}, ${g}, ${b}, 0.14)`,
        `rgba(${r}, ${g}, ${b}, 0.32)`,
        `rgba(${r}, ${g}, ${b}, 0.55)`,
        `rgba(${r}, ${g}, ${b}, 0.78)`,
        accent,
      ]
    }

    // the symbol logo emerges from the field: sample its alpha per grid cell
    // and run those cells hotter — the contribution graph draws the mark
    let mask: Float32Array | null = null
    let maskCols = 0
    const logo = new Image()
    logo.src = "/logo_black_symbol.png"
    const buildMask = () => {
      if (!logo.complete || !logo.naturalWidth || width === 0) return
      const cols = Math.ceil(width / CELL)
      const rows = Math.ceil(height / CELL)
      const off = document.createElement("canvas")
      off.width = cols
      off.height = rows
      const octx = off.getContext("2d")
      if (!octx) return
      const scale = Math.min((cols * 0.55) / logo.naturalWidth, (rows * 0.74) / logo.naturalHeight)
      const w = logo.naturalWidth * scale
      const h = logo.naturalHeight * scale
      octx.drawImage(logo, (cols - w) / 2, (rows - h) / 2, w, h)
      const data = octx.getImageData(0, 0, cols, rows).data
      mask = new Float32Array(cols * rows)
      for (let i = 0; i < cols * rows; i++) mask[i] = data[i * 4 + 3] / 255
      maskCols = cols
      // reduced motion renders a single frame — repaint it once the mask exists
      if (reduced) raf = requestAnimationFrame((t) => draw(t))
    }
    logo.onload = buildMask

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      readPalette()
      buildMask()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - rect.left) / Math.max(1, rect.width)
      mouse.ty = (e.clientY - rect.top) / Math.max(1, rect.height)
    }
    window.addEventListener("pointermove", onMove, { passive: true })

    const THRESHOLDS = [0.4, 0.46, 0.52, 0.58, 0.64]

    const cell = (x: number, y: number, style: string) => {
      ctx.fillStyle = style
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath()
        ctx.roundRect(x, y, CELL - 3, CELL - 3, 3)
        ctx.fill()
      } else {
        ctx.fillRect(x, y, CELL - 3, CELL - 3)
      }
    }

    const draw = (t: number) => {
      const time = reduced ? 0 : t * 0.00018
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04
      ctx.clearRect(0, 0, width, height)
      const cols = Math.ceil(width / CELL)
      const rows = Math.ceil(height / CELL)
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const nx = gx / cols
          const ny = gy / rows
          const dx = nx - mouse.x
          const dy = ny - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const warp = valueNoise(nx * 3 + time * 2, ny * 3 - time) * 0.6
          const n =
            valueNoise(nx * 5 + time * 3 + warp, ny * 5 + warp) * 0.65 +
            valueNoise(nx * 11 - time * 2, ny * 11 + time * 3) * 0.35
          const m = mask && maskCols === cols ? mask[gy * cols + gx] : 0
          const v = n - dist * 0.55 + m * 0.42
          let level = 0
          for (let i = 0; i < THRESHOLDS.length; i++) if (v > THRESHOLDS[i]) level = i + 1
          cell(gx * CELL, gy * CELL, LEVELS[level])
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    // paint only while on screen — the field also lives in the footer,
    // so off-screen instances must not burn frames
    let visible = true
    const io = new IntersectionObserver(
      ([entry]) => {
        const was = visible
        visible = entry.isIntersecting
        if (visible && !was && !reduced) raf = requestAnimationFrame(draw)
        if (!visible) cancelAnimationFrame(raf)
      },
      { rootMargin: "80px" },
    )
    io.observe(canvas)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true" />
}
