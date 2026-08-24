"use client"

import { useEffect, useRef } from "react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { prefersReducedMotion, seededRandom } from "./gsap-setup"

const COLORS: Record<string, string> = {
  indigo: "#0f00b0",
  lilac: "#cbcadf",
  "off-white": "#e5e5e5",
  black: "#000000",
}

/**
 * Scroll-scrubbed scanline wipe.
 * 次のセクションの色が、下の行から左→右に高速タイプされていく
 * （system ウィンドウのタイプライター演出の面バージョン）。
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
  navTheme?: "base" | "indigo" | "lilac"
  prevTheme?: "base" | "indigo" | "lilac"
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

    const ROW = 22
    const color = COLORS[variant]
    const hex = color.replace("#", "")
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const caret = `rgba(${r}, ${g}, ${b}, 0.45)`

    let width = 0
    let height2 = 0
    let rows = 0
    let rowStart: Float32Array = new Float32Array(0)
    let rowDur: Float32Array = new Float32Array(0)
    const reduced = prefersReducedMotion()
    let progress = reduced ? 1.2 : 0

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      width = rect.width
      height2 = rect.height
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      rows = Math.ceil(height2 / ROW)
      const rand = seededRandom(seed)
      rowStart = new Float32Array(rows)
      rowDur = new Float32Array(rows)
      for (let i = 0; i < rows; i++) {
        rowStart[i] = (i / rows) * 0.88
        rowDur[i] = (1 / rows) * (2.4 + rand() * 0.4)
      }
      render()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height2)
      // 下の行から順に、各行が左→右に高速タイプされていく
      for (let i = 0; i < rows; i++) {
        const t = Math.min(1, Math.max(0, (progress - rowStart[i]) / rowDur[i]))
        if (t <= 0) continue
        const y = height2 - (i + 1) * ROW
        const filled = t * width
        ctx.fillStyle = color
        ctx.fillRect(0, y, filled, ROW + 0.5)
        if (t < 1) {
          // タイプ位置のキャレット
          ctx.fillStyle = caret
          ctx.fillRect(filled, y, ROW * 0.8, ROW + 0.5)
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
          // 1.08 で最上段の行までタイプが完了する
          progress = self.progress * 1.08
          render()
        }
        if (!navTheme) return
        const nav = document.querySelector<HTMLElement>("[data-tent-nav]")
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
      className="tent-shutter"
      style={{ height, background: bg ? COLORS[bg] : undefined }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  )
}
