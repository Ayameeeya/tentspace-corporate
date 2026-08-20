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

/** セクションごとのメインレーンの位置（画面幅比）と太さ */
const ZONE_X: Record<string, number> = {
  vision: 0.8,
  system: 0.9,
  "how-it-works": 0.5,
  different: 0.66,
  works: 0.84,
  services: 0.9,
}

type Node = { id: string; label: string; x: number; y: number; merge?: boolean }
type Seg = { d: string; top: number; bottom: number; width: number; dim?: boolean }

/**
 * ページ背景を流れる git グラフ。
 * メインレーンは右サイド基調でセクションごとにレーンを乗り換え、
 * how it works では中央へ寄って太くなる（ズーム）。
 * 終盤は各所から生まれた線がフッター中央の 1 点にすべて収束してマージする。
 */
export function BranchGraph() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{
    height: number
    segs: Seg[]
    nodes: Node[]
    mergeX: number
    mergeY: number
  } | null>(null)

  useEffect(() => {
    const measure = () => {
      const page = document.querySelector<HTMLElement>(".mono-page")
      if (!page) return
      const w = window.innerWidth
      const vh = window.innerHeight
      const height = document.documentElement.scrollHeight
      const docY = (el: Element) => el.getBoundingClientRect().top + window.scrollY

      const sec: Record<string, number> = {}
      for (const s of STOPS) {
        const el = document.getElementById(s.id)
        if (el) sec[s.id] = docY(el)
      }
      const strips = Array.from(document.querySelectorAll<HTMLElement>(".mono-shutter"))
      const footer = document.querySelector<HTMLElement>(".mono-footer")
      if (strips.length < 4 || !footer || Object.keys(sec).length < STOPS.length) return

      const mergeX = 0.5 * w
      const mergeY = docY(footer) + vh * 0.2

      // メインレーンの経由地: [x, y]
      const stations: [number, number][] = [
        [ZONE_X.vision * w, vh * 0.52],
        [ZONE_X.vision * w, docY(strips[0]) - vh * 0.15],
        [ZONE_X.system * w, docY(strips[0]) + strips[0].offsetHeight + vh * 0.1],
        [ZONE_X.system * w, docY(strips[1]) + strips[1].offsetHeight * 0.5],
        [ZONE_X["how-it-works"] * w, sec["how-it-works"] + vh * 0.35],
        [ZONE_X["how-it-works"] * w, sec.different - vh * 0.25],
        [ZONE_X.different * w, sec.different + vh * 0.35],
        [ZONE_X.different * w, sec.works - vh * 0.2],
        [ZONE_X.works * w, sec.works + vh * 0.35],
        [ZONE_X.works * w, docY(strips[2]) - vh * 0.15],
        [ZONE_X.services * w, docY(strips[2]) + strips[2].offsetHeight + vh * 0.1],
        [ZONE_X.services * w, docY(strips[3]) + strips[3].offsetHeight * 0.5],
        [mergeX, mergeY],
      ]

      const segs: Seg[] = []
      for (let i = 0; i < stations.length - 1; i++) {
        const [x1, y1] = stations[i]
        const [x2, y2] = stations[i + 1]
        const my = (y1 + y2) / 2
        segs.push({
          d: x1 === x2 ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`,
          top: y1,
          bottom: y2,
          width: 1.5,
        })
      }

      // フィナーレ: 各所から生まれた線が 1 点に収束する
      const tributaries: [number, number][] = [
        [0.14 * w, sec["how-it-works"] + vh * 0.6],
        [0.3 * w, sec.works + vh * 0.2],
        [0.7 * w, sec.different + vh * 0.5],
        [0.95 * w, docY(strips[2]) + strips[2].offsetHeight + vh * 0.3],
      ]
      for (const [bx, by] of tributaries) {
        const my = (by + mergeY) / 2
        segs.push({
          d: `M ${bx} ${by} C ${bx} ${my}, ${mergeX} ${my}, ${mergeX} ${mergeY}`,
          top: by,
          bottom: mergeY,
          width: 1,
          dim: true,
        })
      }

      const nodes: Node[] = STOPS.map((s) => ({
        ...s,
        x: ZONE_X[s.id] * w,
        y: sec[s.id] + vh * 0.26,
      }))
      nodes.push({ id: "__merge", label: "merged → main", x: mergeX, y: mergeY, merge: true })

      setLayout({ height, segs, nodes, mergeX, mergeY })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  // スクロール追従: 線の描画とノード点灯
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
      paths.forEach((p, i) => {
        const top = parseFloat(p.dataset.top || "0")
        const bottom = parseFloat(p.dataset.bottom || "1")
        const f = Math.min(1, Math.max(0, (revealY - top) / Math.max(1, bottom - top)))
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
        <svg className="mono-branch__svg" width="100%" height={layout.height} aria-hidden="true">
          {layout.segs.map((s, i) => (
            <path
              key={i}
              d={s.d}
              data-seg
              data-top={s.top}
              data-bottom={s.bottom}
              strokeWidth={s.width}
              opacity={s.dim ? 0.45 : 0.9}
            />
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
            style={{ left: n.x, top: n.y }}
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
