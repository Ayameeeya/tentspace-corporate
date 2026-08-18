"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { prefersReducedMotion, seededRandom } from "./gsap-setup"

const COLORS: Record<string, string> = {
  indigo: "#0f00b0",
  olive: "#cbcadf",
  "off-white": "#e5e5e5",
  black: "#000000",
}

/**
 * Scroll-scrubbed pixel shutter strip (10 rows x 4 cols).
 * mode "cover": cells grow in (origin bottom) as the strip approaches the
 * viewport bottom — a pixel wipe into the next section's color.
 * Also flips the nav theme at 40% progress.
 */
export function ShutterScroll({
  variant,
  navTheme,
  prevTheme = "base",
  bg,
  rows = 10,
  cols = 4,
  height = "10em",
  seed = 42,
}: {
  variant: keyof typeof COLORS
  /** colour the cells wipe in — i.e. the section below */
  navTheme?: "base" | "indigo" | "olive"
  prevTheme?: "base" | "indigo" | "olive"
  /** ground the strip sits on — set when wiping out of a coloured section */
  bg?: keyof typeof COLORS
  rows?: number
  cols?: number
  height?: string
  seed?: number
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const applied = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cells = Array.from(root.children) as HTMLElement[]
    const rand = seededRandom(seed)

    // biased-from-bottom order with seeded randomness
    const order = cells
      .map((cell, i) => {
        const row = Math.floor(i / cols)
        const col = i % cols
        return { cell, key: (rows - 1 - row) / rows + rand() * 0.22 + (col / cols) * 0.06 }
      })
      .sort((a, b) => a.key - b.key)

    if (prefersReducedMotion()) {
      gsap.set(cells, { scaleY: 1 })
      return
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top bottom",
        end: "bottom center",
        scrub: 0.3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
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
      },
    })
    order.forEach(({ cell }, i) => {
      tl.to(cell, { scaleY: 1, duration: 0.1, ease: "none" }, (i / order.length) * 0.9)
    })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [cols, rows, seed, navTheme, prevTheme])

  return (
    <div
      ref={rootRef}
      className="mono-shutter"
      style={{
        height,
        background: bg ? COLORS[bg] : undefined,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div key={i} className="mono-shutter__cell" style={{ background: COLORS[variant] }} />
      ))}
    </div>
  )
}
