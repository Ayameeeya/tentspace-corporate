"use client"

/**
 * transition lab — セクション入退場の表現比較。
 * 00: 現行（コントリビューションノイズ） / 01: ロゴスタンプ / 02: マージライン / 03: スキャンライン
 * 本番には露出しない実験ページ（どこからもリンクしない）。
 */

import "@/app/home.css"

import { useEffect, useRef } from "react"
import { ShutterScroll } from "@/components/home/ShutterScroll"

const INDIGO = "#0f00b0"
const BG = "#e5e5e5"

function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

/** start: band top hits viewport bottom / end: band bottom hits viewport center */
function bandProgress(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight
  const total = rect.height + vh * 0.5
  return Math.min(1, Math.max(0, (vh - rect.top) / total))
}

function useBandCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, p: number) => void,
  deps: unknown[] = [],
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let w = 0
    let h = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      paint()
    }
    const paint = () => draw(ctx, w, h, bandProgress(root))
    const onScroll = () => paint()
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { rootRef, canvasRef }
}

/* ---------- 01: ロゴスタンプ・ワイプ ---------- */
function StampWipe({ height = "55vh" }: { height?: string }) {
  const gridRef = useRef<{
    cols: number
    rows: number
    thresholds: Float32Array
  } | null>(null)
  const logoRef = useRef<HTMLImageElement | null>(null)

  const CELL = 24

  const build = (w: number, h: number) => {
    const logo = logoRef.current
    if (!logo || !logo.complete || !logo.naturalWidth) return null
    const cols = Math.ceil(w / CELL)
    const rows = Math.ceil(h / CELL)
    const off = document.createElement("canvas")
    off.width = cols
    off.height = rows
    const octx = off.getContext("2d")
    if (!octx) return null
    const scale = Math.min((cols * 0.42) / logo.naturalWidth, (rows * 0.72) / logo.naturalHeight)
    const lw = logo.naturalWidth * scale
    const lh = logo.naturalHeight * scale
    octx.drawImage(logo, (cols - lw) / 2, (rows - lh) / 2, lw, lh)
    const data = octx.getImageData(0, 0, cols, rows).data

    // BFS distance from logo cells → flood order
    const dist = new Int16Array(cols * rows).fill(-1)
    const queue: number[] = []
    for (let i = 0; i < cols * rows; i++) {
      if (data[i * 4 + 3] > 96) {
        dist[i] = 0
        queue.push(i)
      }
    }
    let maxDist = 1
    for (let qi = 0; qi < queue.length; qi++) {
      const i = queue[qi]
      const x = i % cols
      const y = (i / cols) | 0
      const nb = [i - 1, i + 1, i - cols, i + cols]
      const ok = [x > 0, x < cols - 1, y > 0, y < rows - 1]
      for (let k = 0; k < 4; k++) {
        if (!ok[k]) continue
        const j = nb[k]
        if (dist[j] === -1) {
          dist[j] = dist[i] + 1
          if (dist[j] > maxDist) maxDist = dist[j]
          queue.push(j)
        }
      }
    }
    const rand = seededRandom(97)
    const thresholds = new Float32Array(cols * rows)
    for (let i = 0; i < cols * rows; i++) {
      if (dist[i] === 0) {
        // ロゴ本体: 最初に結像する
        thresholds[i] = 0.04 + rand() * 0.2
      } else {
        // 外側: ロゴからの距離順に洪水
        thresholds[i] = 0.34 + (dist[i] / maxDist) * 0.5 + rand() * 0.1
      }
    }
    return { cols, rows, thresholds }
  }

  const { rootRef, canvasRef } = useBandCanvas((ctx, w, h, p) => {
    if (!gridRef.current) gridRef.current = build(w, h)
    const grid = gridRef.current
    if (!grid) return
    const { cols, rows, thresholds } = grid
    const pp = p * 1.35
    ctx.clearRect(0, 0, w, h)
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const d = pp - thresholds[gy * cols + gx]
        if (d <= 0) continue
        if (d > 0.2) {
          ctx.fillStyle = INDIGO
          ctx.fillRect(gx * CELL, gy * CELL, CELL + 0.5, CELL + 0.5)
          continue
        }
        const alpha = d < 0.05 ? 0.3 : d < 0.1 ? 0.55 : d < 0.15 ? 0.8 : 1
        ctx.fillStyle = `rgba(15, 0, 176, ${alpha})`
        ctx.beginPath()
        ctx.roundRect(gx * CELL + 2, gy * CELL + 2, CELL - 5, CELL - 5, 4)
        ctx.fill()
      }
    }
  })

  useEffect(() => {
    const img = new Image()
    img.src = "/logo_black_symbol.png"
    img.onload = () => {
      logoRef.current = img
      gridRef.current = null
      window.dispatchEvent(new Event("scroll"))
    }
    logoRef.current = img
  }, [])

  return (
    <div ref={rootRef} style={{ position: "relative", height, overflow: "hidden" }} aria-hidden="true">
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  )
}

/* ---------- 02: マージライン ---------- */
function MergeLine({ height = "55vh" }: { height?: string }) {
  const { rootRef, canvasRef } = useBandCanvas((ctx, w, h, p) => {
    ctx.clearRect(0, 0, w, h)
    const mainX = w * 0.5
    const branchX = w * 0.5 - Math.min(260, w * 0.2)
    const mergeY = h * 0.55
    const STEP = 14

    // 線の伸長 (p 0 → 0.42)
    const lineP = Math.min(1, p / 0.42)
    const tipY = lineP * mergeY
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1
    // main line
    ctx.beginPath()
    ctx.moveTo(mainX, 0)
    ctx.lineTo(mainX, tipY)
    ctx.stroke()
    // branch line: 上端から下りて mergeY 手前でカーブして合流
    ctx.beginPath()
    ctx.moveTo(branchX, 0)
    const straightEnd = Math.min(tipY, mergeY - 120)
    ctx.lineTo(branchX, Math.max(0, straightEnd))
    if (tipY > mergeY - 120) {
      const t = Math.min(1, (tipY - (mergeY - 120)) / 120)
      // quadratic curve toward the merge point
      const cx = branchX
      const cy = mergeY
      const ex = branchX + (mainX - branchX) * t
      const ey = mergeY - 120 + 120 * t
      ctx.quadraticCurveTo(cx, cy, ex, ey)
    }
    ctx.stroke()

    // マージノード (p 0.42 で出現、パルス)
    if (p >= 0.42) {
      const np = Math.min(1, (p - 0.42) / 0.08)
      const size = 10 + np * 10
      ctx.fillStyle = INDIGO
      ctx.fillRect(mainX - size / 2, mergeY - size / 2, size, size)
    }

    // 色のフロントがノードから下へ掃引 (p 0.5 → 1)
    if (p >= 0.5) {
      const fp = Math.min(1, (p - 0.5) / 0.5)
      const frontY = mergeY + (h - mergeY) * fp
      ctx.fillStyle = INDIGO
      // ベタ部分
      ctx.fillRect(0, frontY, w, h - frontY + 1)
      // 前線はピクセル段差
      const rand = seededRandom(31)
      for (let x = 0; x < w; x += STEP) {
        const steps = 1 + Math.floor(rand() * 3)
        ctx.fillRect(x, frontY - steps * STEP, STEP + 0.5, steps * STEP + 1)
      }
      // マージ点から前線までの幹線を太らせる
      ctx.fillRect(mainX - 2, mergeY, 4, frontY - mergeY)
    }
  })

  return (
    <div ref={rootRef} style={{ position: "relative", height, overflow: "hidden" }} aria-hidden="true">
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  )
}

/* ---------- 03: スキャンライン ---------- */
function ScanlineWipe({ height = "55vh" }: { height?: string }) {
  const { rootRef, canvasRef } = useBandCanvas((ctx, w, h, p) => {
    ctx.clearRect(0, 0, w, h)
    const ROW = 22
    const rows = Math.ceil(h / ROW)
    const rand = seededRandom(7)
    const pp = p * 1.08
    // 下の行から順に、各行が左→右にタイプされる
    for (let r = 0; r < rows; r++) {
      const jitter = rand() * 0.4
      const rowStart = (r / rows) * 0.88
      const rowDur = (1 / rows) * (2.4 + jitter)
      const t = Math.min(1, Math.max(0, (pp - rowStart) / rowDur))
      if (t <= 0) continue
      const y = h - (r + 1) * ROW
      const filled = t * w
      ctx.fillStyle = INDIGO
      ctx.fillRect(0, y, filled, ROW + 0.5)
      if (t < 1) {
        // タイプ位置のキャレット
        ctx.fillStyle = "rgba(15, 0, 176, 0.45)"
        ctx.fillRect(filled, y, ROW * 0.8, ROW + 0.5)
      }
    }
  })

  return (
    <div ref={rootRef} style={{ position: "relative", height, overflow: "hidden" }} aria-hidden="true">
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  )
}

/* ---------- lab page ---------- */

function DemoBlock({
  num,
  title,
  desc,
  children,
}: {
  num: string
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <>
      <section style={{ padding: "18vh 0 10vh" }}>
        <div className="tent-container">
          <p className="paragraph-regular opacity-64">{num}</p>
          <h2 className="heading-s">{title}</h2>
          <p className="paragraph-m opacity-64" style={{ marginTop: "0.75em", maxWidth: "44ch" }}>
            {desc}
          </p>
          <p className="paragraph-s opacity-64" style={{ marginTop: "2em" }}>
            ↓ scroll
          </p>
        </div>
      </section>
      {children}
      <section style={{ background: INDIGO, color: "#e5e5e5", padding: "22vh 0" }}>
        <div className="tent-container">
          <p className="heading-m">セクションに入りました。</p>
        </div>
      </section>
    </>
  )
}

export default function TransitionLab() {
  return (
    <div className="tent-page" style={{ background: BG }}>
      <main style={{ paddingTop: "14vh" }}>
        <div className="tent-container">
          <h1 className="heading-m">transition lab</h1>
          <p className="paragraph-m opacity-64" style={{ marginTop: "1em" }}>
            セクション入場の 4 案。スクロールで比較する。
          </p>
        </div>

        <DemoBlock num="00" title="scanline — 採用（現行）" desc="採用案。次のセクションの色が下の行から左→右に高速タイプされていく。">
          <ShutterScroll variant="indigo" height="55vh" seed={11} />
        </DemoBlock>

        <DemoBlock
          num="01"
          title="logo stamp"
          desc="セルがまずシンボルロゴを結像し、その印からあふれるように次のセクションの色が広がる。"
        >
          <StampWipe />
        </DemoBlock>

        <DemoBlock
          num="02"
          title="merge line"
          desc="コミットグラフのレールが境界を貫き、ブランチが合流。マージノードから下へ色が切り替わる。"
        >
          <MergeLine />
        </DemoBlock>


        <section style={{ padding: "16vh 0" }}>
          <div className="tent-container">
            <p className="paragraph-m opacity-64">おわり。気に入った番号をどうぞ。</p>
          </div>
        </section>
      </main>
    </div>
  )
}
