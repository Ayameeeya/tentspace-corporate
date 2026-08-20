"use client"

import { useEffect, useRef } from "react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { prefersReducedMotion, seededRandom } from "./gsap-setup"

const COLORS: Record<string, string> = {
  indigo: "#0f00b0",
  olive: "#cbcadf",
  "off-white": "#e5e5e5",
  black: "#000000",
}

/**
 * Scroll-scrubbed contribution-graph wipe.
 * ヒーローのピクセルフィールドと同じ小さなセルが、下からノイズ混じりの順で
 * 埋まっていき、次のセクションの色を「コミット」していく。
 * Also flips the nav theme at 40% progress.
 */
export function ShutterScroll({
  variant,
  navTheme,
  prevTheme = "base",
  bg,
  height = "10em",
  seed = 42,
}: {
  variant: keyof typeof COLORS
  /** colour the cells fill in — i.e. the section below */
  navTheme?: "base" | "indigo" | "olive"
  prevTheme?: "base" | "indigo" | "olive"
  /** ground the strip sits on — set when wiping out of a coloured section */
  bg?: keyof typeof COLORS
  height?: string
  seed?: number
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const applied = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const CELL = 72
    const color = COLORS[variant]
    const hex = color.replace("#", "")
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    // intensity ladder — the leading edge shimmers through lighter steps
    const LADDER = [
      `rgba(${r}, ${g}, ${b}, 0.25)`,
      `rgba(${r}, ${g}, ${b}, 0.5)`,
      `rgba(${r}, ${g}, ${b}, 0.75)`,
      color,
    ]

    let width = 0
    let height2 = 0
    let cols = 0
    let rows = 0
    let thresholds: Float32Array = new Float32Array(0)
    const reduced = prefersReducedMotion()
    let progress = reduced ? 1.4 : 0

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      width = rect.width
      height2 = rect.height
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(width / CELL)
      rows = Math.ceil(height2 / CELL)
      const rand = seededRandom(seed)
      thresholds = new Float32Array(cols * rows)
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          // bottom-biased with noise: the next section's colour grows upward
          thresholds[gy * cols + gx] = ((rows - 1 - gy) / Math.max(1, rows)) * 0.62 + rand() * 0.38
        }
      }
      render()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height2)
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const d = progress - thresholds[gy * cols + gx]
          if (d <= 0) continue
          if (d > 0.2) {
            // 成熟したセルは隙間なしのベタになり、下の面と溶け合う
            ctx.fillStyle = color
            ctx.fillRect(gx * CELL, gy * CELL, CELL + 0.5, CELL + 0.5)
            continue
          }
          const level = d < 0.05 ? 0 : d < 0.1 ? 1 : d < 0.15 ? 2 : 3
          ctx.fillStyle = LADDER[level]
          if (typeof ctx.roundRect === "function") {
            ctx.beginPath()
            ctx.roundRect(gx * CELL + 2, gy * CELL + 2, CELL - 5, CELL - 5, 4)
            ctx.fill()
          } else {
            ctx.fillRect(gx * CELL + 2, gy * CELL + 2, CELL - 5, CELL - 5)
          }
        }
      }
    }

    build()
    const ro = new ResizeObserver(build)
    ro.observe(canvas)

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom center",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!reduced) {
          // 1.4 で全セル (threshold 最大 1.0) が成熟 (d > 0.2) まで到達する
          progress = self.progress * 1.4
          render()
        }
        if (!navTheme) return
        const nav = document.querySelector<HTMLElement>("[data-mono-nav]")
        if (!nav) return
        const past = self.progress >= 0.4
        if (past && !applied.current) {
          applied.current = true
          nav.dataset.navTheme = navTheme
        } else if (!past && applied.current) {
          applied.current = false
          nav.dataset.navTheme = prevTheme
        }
      },
    })

    return () => {
      st.kill()
      ro.disconnect()
    }
  }, [variant, navTheme, prevTheme, seed])

  return (
    <div
      ref={rootRef}
      className="mono-shutter"
      style={{ height, background: bg ? COLORS[bg] : undefined }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  )
}
