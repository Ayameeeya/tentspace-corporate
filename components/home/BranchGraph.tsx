"use client"

import { useEffect, useRef, useState } from "react"

/** ノードを置くセクションとレーン位置（画面幅比） */
const NODE_STOPS = [
  { id: "vision", label: "vision", x: 0.8 },
  { id: "system", label: "system", x: 0.9 },
  { id: "how-it-works", label: "how it works", x: 0.5 },
  { id: "services", label: "services", x: 0.88 },
]

type Node = { id: string; label: string; x: number; y: number; merge?: boolean }
type Seg = { d: string; top: number; bottom: number; dim?: boolean }
type Rect = { x: number; y: number; w: number; h: number }

const R = 18 // エルボーのアール

/** git graph のエルボー: 縦線 → 小アール → 水平ジョグ → 小アール → 縦線 */
function elbow(x1: number, x2: number, yJog: number) {
  const dir = x2 > x1 ? 1 : -1
  return (
    ` L ${x1} ${yJog - R}` +
    ` Q ${x1} ${yJog}, ${x1 + dir * R} ${yJog}` +
    ` L ${x2 - dir * R} ${yJog}` +
    ` Q ${x2} ${yJog}, ${x2} ${yJog + R}`
  )
}

/**
 * ページ背景を流れる git グラフ（difference 合成でどの地色でも見える）。
 * run1: vision → system(右端) → how(中央) で途絶える
 * run2: with tent space 手前で再開 → services のレーンを降りる。
 *       終盤は画面外から入る 3 本の支流とともにマージ行で 1 点に集まる
 *       （中央トランクは持たない）。
 * different / works ゾーンには描かない。
 */
export function BranchGraph() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{
    height: number
    segs: Seg[]
    nodes: Node[]
    textRects: Rect[]
  } | null>(null)

  useEffect(() => {
    const measure = () => {
      const page = document.querySelector<HTMLElement>(".mono-page")
      if (!page) return
      const w = window.innerWidth
      const vh = window.innerHeight
      const height = document.documentElement.scrollHeight
      const docY = (el: Element) => el.getBoundingClientRect().top + window.scrollY

      const secEl = (id: string) => document.getElementById(id)
      const strips = Array.from(document.querySelectorAll<HTMLElement>(".mono-shutter"))
      const footer = document.querySelector<HTMLElement>(".mono-footer")
      const how = secEl("how-it-works")
      const different = secEl("different")
      if (strips.length < 4 || !footer || !how || !different) return

      const xVision = 0.8 * w
      const xSystem = 0.9 * w
      const xHow = 0.5 * w
      const xServices = 0.88 * w
      const xMerge = 0.5 * w
      // マージ点はコントリビューションフィールドの上端 — main の実体に着地する
      const footerVisual = footer.querySelector<HTMLElement>(".mono-footer__visual")
      const mergeY = footerVisual ? docY(footerVisual) : docY(footer) + vh * 0.35

      // run1: vision → system → how、different の手前で途絶える
      const run1Top = vh * 0.55
      const run1End = docY(different) - vh * 0.1
      const d1 =
        `M ${xVision} ${run1Top}` +
        elbow(xVision, xSystem, docY(strips[0]) - vh * 0.08) +
        elbow(xSystem, xHow, docY(strips[1]) + strips[1].offsetHeight + vh * 0.18) +
        ` L ${xHow} ${run1End}`

      // run2: works の後（with tent space）で再開 → services のレーンを
      // そのまま降りてマージ行で合流する（中央トランクは持たない）
      const stackEl = document.querySelector<HTMLElement>(".mono-stack-band")
      const stackBottom = stackEl
        ? docY(stackEl) + stackEl.offsetHeight
        : docY(strips[3]) + strips[3].offsetHeight
      const run2Top = docY(strips[2]) - vh * 0.5
      const inDir = (laneX: number) => (xMerge > laneX ? 1 : -1)
      /** レーンを降りてマージ行に乗り、マージ点へ向かう */
      const toMergeRow = (laneX: number) => {
        const dir = inDir(laneX)
        return (
          ` L ${laneX} ${mergeY - R}` +
          ` Q ${laneX} ${mergeY}, ${laneX + dir * R} ${mergeY}` +
          ` L ${xMerge} ${mergeY}`
        )
      }
      const d2 = `M ${xServices} ${run2Top}` + toMergeRow(xServices)

      const segs: Seg[] = [
        { d: d1, top: run1Top, bottom: run1End },
        { d: d2, top: run2Top, bottom: mergeY },
      ]

      // フィナーレ: 支流は画面外から水平に入り、自分のレーンを降りて
      // マージ行で 1 点に集まる。内側のレーンほど先に入れて交差を避ける
      const zoneTop = stackBottom + 24
      const span = Math.max(160, mergeY - R - 40 - zoneTop)
      const yAt = (f: number) => zoneTop + span * f
      const edge = (fromX: number, laneX: number, y: number) => {
        const dir = laneX > fromX ? 1 : -1
        return (
          `M ${fromX} ${y}` +
          ` L ${laneX - dir * R} ${y}` +
          ` Q ${laneX} ${y}, ${laneX} ${y + R}` +
          toMergeRow(laneX)
        )
      }
      const tribDs: [string, number][] = [
        [edge(-4, 0.38 * w, yAt(0.06)), yAt(0.06)],
        [edge(w + 4, 0.96 * w, yAt(0.22)), yAt(0.22)],
        [edge(-4, 0.16 * w, yAt(0.4)), yAt(0.4)],
      ]
      for (const [d, top] of tribDs) segs.push({ d, top, bottom: mergeY, dim: true })

      // 本文テキストの矩形: 線はこの領域では描かない（マスクで抜く）
      const textRects: Rect[] = []
      document
        .querySelectorAll<HTMLElement>(
          "main h1, main h2, main h3, main p, main .mono-works__tags, main .main-btn, main .mono-win, main .mono-works__shot, main .mono-stack-band, .mono-footer p, .mono-footer a, .mono-footer nav",
        )
        .forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.width < 8 || r.height < 8) return
          textRects.push({ x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height })
        })
      // system のピン留めシーン（ウィンドウ群）全域では線を描かない。
      // ピン中は要素が固定表示され座標がずれるため、スペーサーごと覆う
      const pin = document.querySelector<HTMLElement>(".mono-system__pin")
      if (pin) {
        const host =
          pin.parentElement && pin.parentElement.className.includes("pin-spacer") ? pin.parentElement : pin
        const r = host.getBoundingClientRect()
        textRects.push({ x: 0, y: r.top + window.scrollY, w, h: r.height })
      }

      // ノードは必ずレーンの直線区間上に置く。テキストと重なるなら区間内で上下に逃がす
      const isClear = (x: number, y: number) =>
        !textRects.some((r) => x > r.x - 16 && x < r.x + r.w + 16 && y > r.y - 16 && y < r.y + r.h + 16)
      const placeOnLane = (x: number, y0: number, laneTop: number, laneBottom: number) => {
        const clamp = (v: number) => Math.min(laneBottom - 24, Math.max(laneTop + 24, v))
        for (const dy of [0, 44, -44, 88, -88, 132, -132, 176]) {
          const y = clamp(y0 + dy)
          if (isClear(x, y)) return y
        }
        return clamp(y0)
      }

      // 各ノードのレーン直線区間
      const laneRange: Record<string, [number, number]> = {
        vision: [run1Top, docY(strips[0]) - vh * 0.08 - R],
        system: [docY(strips[0]) - vh * 0.08 + R, docY(strips[1]) + strips[1].offsetHeight + vh * 0.18 - R],
        "how-it-works": [docY(strips[1]) + strips[1].offsetHeight + vh * 0.18 + R, run1End],
        services: [run2Top, mergeY - R],
      }

      const nodes: Node[] = []
      for (const s of NODE_STOPS) {
        const el = secEl(s.id)
        if (!el) continue
        const x = s.x * w
        const [lt, lb] = laneRange[s.id]
        nodes.push({ id: s.id, label: s.label, x, y: placeOnLane(x, docY(el) + vh * 0.3, lt, lb) })
      }
      nodes.push({ id: "__merge", label: "merged → main", x: xMerge, y: mergeY, merge: true })

      setLayout({ height, segs, nodes, textRects })
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
    let mergeWasOn = false
    const update = () => {
      const revealY = window.scrollY + window.innerHeight * 0.72
      paths.forEach((p, i) => {
        const top = parseFloat(p.dataset.top || "0")
        const bottom = parseFloat(p.dataset.bottom || "1")
        const f = Math.min(1, Math.max(0, (revealY - top) / Math.max(1, bottom - top)))
        p.style.strokeDashoffset = `${lengths[i] * (1 - f)}`
      })
      root.querySelectorAll<HTMLElement>("[data-node-y]").forEach((n) => {
        const on = revealY >= parseFloat(n.dataset.nodeY || "0")
        n.dataset.on = String(on)
        // マージ成立の瞬間、着弾点からフィールドへ波紋を放つ
        if (n.classList.contains("mono-branch__node--merge")) {
          if (on && !mergeWasOn) {
            const r = n.getBoundingClientRect()
            window.dispatchEvent(
              new CustomEvent("mono-merge", {
                detail: { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 },
              }),
            )
          }
          mergeWasOn = on
        }
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
          <defs>
            <mask id="mono-branch-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height={layout.height}>
              <rect width="100%" height={layout.height} fill="#fff" />
              {layout.textRects.map((r, i) => (
                <rect key={i} x={r.x - 10} y={r.y - 8} width={r.w + 20} height={r.h + 16} fill="#000" />
              ))}
            </mask>
          </defs>
          <g mask="url(#mono-branch-mask)">
            {layout.segs.map((s, i) => (
              <path key={i} d={s.d} data-seg data-top={s.top} data-bottom={s.bottom} opacity={s.dim ? 0.5 : 1} />
            ))}
          </g>
        </svg>
      </div>
      {/* section nodes = commits（前面レイヤー、difference 合成） */}
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
