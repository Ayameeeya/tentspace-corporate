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

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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

    // GitHub-contributions style: one hue, stepped intensity ladder
    const LEVELS = [
      "rgba(0, 0, 0, 0.05)", // empty cell
      "rgba(15, 0, 176, 0.14)",
      "rgba(15, 0, 176, 0.32)",
      "rgba(15, 0, 176, 0.55)",
      "rgba(15, 0, 176, 0.78)",
      "#0f00b0",
    ]
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
          const v = n - dist * 0.55
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
