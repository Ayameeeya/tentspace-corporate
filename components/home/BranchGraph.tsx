"use client"

import { useEffect, useRef, useState } from "react"

const STOPS = [
  { id: "vision", label: "vision" },
  { id: "system", label: "system" },
  { id: "how-it-works", label: "how it works" },
  { id: "different", label: "different" },
  { id: "works", label: "works" },
  { id: "services", label: "services" },
]

type Node = { id: string; label: string; y: number; merge?: boolean }
type Seg = { d: string; top: number; bottom: number }

/**
 * ページ全体の背景に敷く git グラフ。
 * メインレーンが最上部からフッターまで貫き、ベース地帯ではフィーチャー
 * レーンが分岐して並走、色付きセクションの手前で合流（マージ）する。
 * 線はスクロールに追従して描画され、終端はフッターで main へマージ。
 */
export function BranchGraph() {
  const rootRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{
    height: number
    xA: number
    xB: number
    segs: Seg[]
    nodes: Node[]
  } | null>(null)

  useEffect(() => {
    const measure = () => {
      const page = document.querySelector<HTMLElement>(".mono-page")
      if (!page) return
      const em = parseFloat(getComputedStyle(page).fontSize)
      const height = document.documentElement.scrollHeight
      const vh = window.innerHeight
      const xA = em * 2.9
      const xB = em * 6.4
      const docY = (el: Element) => el.getBoundingClientRect().top + window.scrollY

      const strips = Array.from(document.querySelectorAll<HTMLElement>(".mono-shutter"))
      const footer = document.querySelector<HTMLElement>(".mono-footer")
      if (strips.length < 4 || !footer) return

      const mergeY = (strip: HTMLElement) => docY(strip) + strip.offsetHeight * 0.55
      const outY = (strip: HTMLElement) => docY(strip) + strip.offsetHeight + vh * 0.12
      const curve = 90

      const branchSeg = (yOut: number, yIn: number): Seg => ({
        d:
          `M ${xA} ${yOut}` +
          ` C ${xA} ${yOut + curve}, ${xB} ${yOut + curve * 0.6}, ${xB} ${yOut + curve * 1.6}` +
          ` L ${xB} ${yIn - curve * 1.6}` +
          ` C ${xB} ${yIn - curve * 0.6}, ${xA} ${yIn - curve}, ${xA} ${yIn}`,
        top: yOut,
        bottom: yIn,
      })

      const heroOut = vh * 0.86
      const footerMerge = docY(footer) + vh * 0.12

      const segs: Seg[] = [
        branchSeg(heroOut, mergeY(strips[0])),
        branchSeg(outY(strips[1]), mergeY(strips[2])),
        branchSeg(outY(strips[3]), footerMerge),
      ]

      const nodes: Node[] = []
      for (const s of STOPS) {
        const el = document.getElementById(s.id)
        if (!el) continue
        nodes.push({ ...s, y: docY(el) + vh * 0.24 })
      }
      nodes.push({ id: "__merge", label: "merged → main", y: footerMerge, merge: true })

      setLayout({ height, xA, xB, segs, nodes })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  // スクロール追従: メインレーンの伸長・ブランチの描画・ノード点灯
  useEffect(() => {
    if (!layout) return
    const root = rootRef.current
    if (!root) return
    const paths = Array.from(root.querySelectorAll<SVGPathElement>("path[data-seg]"))
    const lengths = paths.map((p) => p.getTotalLength())
    paths.forEach((p, i) => {
      p.style.strokeDasharray = `${lengths[i]}`
    })
    const update = () => {
      const revealY = window.scrollY + window.innerHeight * 0.72
      if (fillRef.current) {
        fillRef.current.style.height = `${Math.max(0, Math.min(layout.height, revealY))}px`
      }
      paths.forEach((p, i) => {
        const top = parseFloat(p.dataset.top || "0")
        const bottom = parseFloat(p.dataset.bottom || "1")
        const f = Math.min(1, Math.max(0, (revealY - top) / (bottom - top)))
        p.style.strokeDashoffset = `${lengths[i] * (1 - f)}`
      })
      root.querySelectorAll<HTMLElement>("[data-node-y]").forEach((n) => {
        n.dataset.on = String(revealY >= parseFloat(n.dataset.nodeY || "0"))
      })
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [layout])

  const jumpTo = (id: string) => {
    const el = id === "__merge" ? document.querySelector<HTMLElement>(".mono-footer") : document.getElementById(id)
    if (!el) return
    const lenis = (window as any).__monoLenis
    const distance = Math.abs(el.getBoundingClientRect().top)
    const duration = Math.min(2.35, 0.72 + Math.pow(distance / window.innerHeight, 0.72) * 0.34)
    if (lenis) {
      lenis.scrollTo(el, {
        duration,
        easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      })
    } else {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (!layout) return <div ref={rootRef} className="mono-branch" />

  return (
    <div ref={rootRef} style={{ display: "contents" }}>
      <div className="mono-branch" style={{ height: layout.height }}>
      {/* main lane */}
      <div className="mono-branch__track" style={{ left: layout.xA }} aria-hidden="true" />
      <div ref={fillRef} className="mono-branch__fill" style={{ left: layout.xA }} aria-hidden="true" />
      {/* feature lane (branch out → merge in) */}
      <svg
        className="mono-branch__svg"
        width="100%"
        height={layout.height}
        aria-hidden="true"
      >
        {layout.segs.map((s, i) => (
          <path key={i} d={s.d} data-seg data-top={s.top} data-bottom={s.bottom} />
        ))}
      </svg>
      </div>
      {/* section nodes = commits（本文より前面の別レイヤー） */}
      <nav className="mono-branch__nodes" style={{ height: layout.height }} aria-label="セクションナビゲーション">
        {layout.nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            className={n.merge ? "mono-branch__node mono-branch__node--merge" : "mono-branch__node"}
            style={{ left: layout.xA, top: n.y }}
            data-node-y={n.y}
            onClick={() => jumpTo(n.id)}
            aria-label={n.merge ? "フッターへ" : `${n.label} セクションへ`}
          >
            <span className="mono-branch__label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
