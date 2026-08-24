"use client"

import { useEffect, useRef, useState } from "react"

/** ノードを置くセクションとレーン位置（画面幅比） */
const NODE_STOPS = [
  { id: "vision", label: "vision", x: 0.5 },
  { id: "shift", label: "the shift", x: 0.8 },
  { id: "system", label: "system", x: 0.9 },
  { id: "how-it-works", label: "how it works", x: 0.5 },
  { id: "different", label: "different", x: 0.5 },
  { id: "services", label: "services", x: 0.88 },
]

type Node = { id: string; label: string; x: number; y: number; merge?: boolean }
type Dot = { x: number; y: number }
type Seg = { d: string; top: number; bottom: number; dim?: boolean }
type Rect = { x: number; y: number; w: number; h: number }

/**
 * レーン移動（分岐・合流）にかける縦の距離。横に離れるほど長く取り、
 * S 字の傾きをどの曲がりでも同じに保つ — 隣のレーンへの小さな移りも、
 * 端から中央への大きな移りも、同じ角度で曲がって見える
 */
function swaySpan(x1: number, x2: number) {
  return Math.min(224, Math.max(96, Math.abs(x2 - x1) * 0.45))
}

/**
 * git ツリーの分岐・合流。両端の接線を縦に保ったままレーン x1 から x2 へ移る
 * S 字で、(x1, y) から始まり (x2, y + swaySpan(x1, x2)) で終わる。
 * 分岐も合流も同じ形（合流は開始 y を合流点から swaySpan だけ遡って取る）
 */
function sway(x1: number, x2: number, y: number, span = swaySpan(x1, x2)) {
  const mid = y + span / 2
  return ` C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y + span}`
}


/**
 * ページ背景を流れる git グラフ（difference 合成でどの地色でも見える）。
 * run1: ヒーローのフィールド直下から main が生え、the shift を切り、
 *       そこから system を切る。shift はインディゴの手前で一旦消え、明けたら
 *       再開して、system → shift → main の二段で合流し how へ向かう。
 * 終盤: 中央を通る main のレーンに、services のレーンと画面外から入る
 *       3 本の支流が合流し、フッターの 1 点にマージする。
 * 分岐も合流も同じ S 字（sway）で、レーンの出入りは常に縦の接線を保つ。
 * different / works ゾーンには描かない。
 */
export function BranchGraph() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{
    height: number
    segs: Seg[]
    nodes: Node[]
    dots: Dot[]
    textRects: Rect[]
  } | null>(null)

  useEffect(() => {
    const measure = () => {
      const page = document.querySelector<HTMLElement>(".tent-page")
      if (!page) return
      const w = window.innerWidth
      const vh = window.innerHeight
      const height = document.documentElement.scrollHeight
      const docY = (el: Element) => el.getBoundingClientRect().top + window.scrollY

      const secEl = (id: string) => document.getElementById(id)
      const strips = Array.from(document.querySelectorAll<HTMLElement>(".tent-shutter"))
      const footer = document.querySelector<HTMLElement>(".tent-footer")
      const how = secEl("how-it-works")
      const different = secEl("different")
      if (strips.length < 4 || !footer || !how || !different) return

      const xVision = 0.8 * w
      const xSystem = 0.9 * w
      const xHow = 0.5 * w
      const xServices = 0.88 * w
      const xMerge = 0.5 * w
      // マージ点はコントリビューションフィールドの上端 — main の実体に着地する
      const footerVisual = footer.querySelector<HTMLElement>(".tent-footer__visual")
      const mergeY = footerVisual ? docY(footerVisual) : docY(footer) + vh * 0.35

      // system のピン留めシーンは全域で線を伏せる。ピン中は要素が固定表示され
      // 座標がずれるため、スペーサーごと 1 つの矩形として扱う
      const pin = document.querySelector<HTMLElement>(".tent-system__pin")
      const pinHost =
        pin && pin.parentElement && pin.parentElement.className.includes("pin-spacer")
          ? pin.parentElement
          : pin
      // インディゴが明ける位置 = 右のレーンが伏せから現れる高さ
      const indigoEnd = pinHost ? docY(pinHost) + pinHost.offsetHeight : docY(strips[1])

      // main: ヒーローのフィールド直下（中央）から生えて、the shift の
      // コミット罫線で途切れる。以降は描かないが、幹はそこにある扱い
      const heroVisual = document.querySelector<HTMLElement>(".tent-hero__visual")
      const shiftLine = document.querySelector<HTMLElement>(".tent-text__wrapper--first .tent-chapter")
      const trunkTop = heroVisual ? docY(heroVisual) + heroVisual.offsetHeight : vh * 0.95
      const trunkEnd = shiftLine ? docY(shiftLine) : trunkTop + vh * 0.3
      const dTrunk = `M ${xHow} ${trunkTop} L ${xHow} ${trunkEnd}`
      // 幹の途中でブランチを切る。S 字が幹の終わり（the shift の罫線）より
      // 手前で 0.8w に収まるよう、分岐点は S 字ぶんだけ上に取る
      const branchSway = swaySpan(xHow, xVision)
      const branchY = Math.max(
        trunkTop + 24,
        Math.min(trunkEnd - branchSway - 16, trunkTop + (trunkEnd - trunkTop) * 0.35),
      )

      // run1: vision → system → how、different の手前で途絶える
      const run1End = docY(different) - vh * 0.1
      // how へ渡るジョグは how の本文（tent space は、Web・スマホアプリ…）の
      // 手前で曲げる。テキストとの間隔を確保するため実測から逆算する
      const howText = how.querySelector<HTMLElement>(".tent-how__text")
      const strip1Bottom = docY(strips[1]) + strips[1].offsetHeight
      const howJogY = howText
        ? Math.max(strip1Bottom + 40, docY(howText) - vh * 0.12)
        : strip1Bottom + vh * 0.18
      // how は中央レーン = main。ブランチはレーンを移るのではなく main へ「戻る」。
      // main は合流点の手前（インディゴが明ける高さ）から実体として現れる
      const mainResumeY = Math.min(indigoEnd, howJogY - 40)
      const dMainRun = `M ${xHow} ${mainResumeY} L ${xHow} ${run1End}`

      // shift: main から切った 0.8w のレーン。system を切ったあと、
      // インディゴの手前で一旦見えなくなる（レーンは続いている扱い）。
      // S 字と縦の走りはセグメントを分ける（引かれる速さを揃えるため）
      const shiftRunTop = branchY + branchSway
      const sysSplitY = docY(strips[0]) - vh * 0.08
      const shiftHideY = docY(strips[0])
      const dShiftBranch = `M ${xHow} ${branchY}` + sway(xHow, xVision, branchY)
      const dShiftRunA = `M ${xVision} ${shiftRunTop} L ${xVision} ${shiftHideY}`

      // system: shift から切った 0.9w のレーン。インディゴ区間はこの 1 本だけ
      const dSystemBranch = `M ${xVision} ${sysSplitY}` + sway(xVision, xSystem, sysSplitY)

      // インディゴが明けると shift も再び現れ、system → shift → main の
      // 二段で合流して how へ向かう
      const sysSway = swaySpan(xVision, xSystem)
      const shiftRunEnd = howJogY - swaySpan(xVision, xHow)
      const sysMergeY = Math.max(
        indigoEnd + sysSway + 40,
        Math.min(shiftRunEnd - 40, indigoEnd + (howJogY - indigoEnd) * 0.45),
      )
      const sysRunTop = sysSplitY + sysSway
      const sysRunEnd = sysMergeY - sysSway
      const dSystemRun = `M ${xSystem} ${sysRunTop} L ${xSystem} ${sysRunEnd}`
      const dSystemJoin = `M ${xSystem} ${sysRunEnd}` + sway(xSystem, xVision, sysRunEnd)
      const dShiftRunB = `M ${xVision} ${indigoEnd} L ${xVision} ${shiftRunEnd}`
      const dShiftJoin = `M ${xVision} ${shiftRunEnd}` + sway(xVision, xHow, shiftRunEnd)

      // run2: works の後（with tent space）で再開 → services のレーンを
      // そのまま降りてマージ行で合流する（中央トランクは持たない）
      const stackEl = document.querySelector<HTMLElement>(".tent-stack-band")
      const stackBottom = stackEl
        ? docY(stackEl) + stackEl.offsetHeight
        : docY(strips[3]) + strips[3].offsetHeight
      const run2Top = docY(strips[2]) - vh * 0.5
      /** レーンを降りて、S 字でマージ点に寄りつく。マージ点に近いレーンが
          最後の瞬間に急に曲がって見えないよう、下限を高めに取る */
      const mergeSpan = (laneX: number) => Math.max(170, swaySpan(laneX, xMerge))
      const toMergeRow = (laneX: number) =>
        ` L ${laneX} ${mergeY - mergeSpan(laneX)}` +
        sway(laneX, xMerge, mergeY - mergeSpan(laneX), mergeSpan(laneX))
      // services: 縦の走りと合流の S 字を分けて、同じ速さで引く
      const svcSway = swaySpan(xServices, xMerge)
      const dSvcRun = `M ${xServices} ${run2Top} L ${xServices} ${mergeY - svcSway}`
      const dSvcJoin = `M ${xServices} ${mergeY - svcSway}` + sway(xServices, xMerge, mergeY - svcSway)

      // フィナーレ帯: 支流と main はこの帯で同時に現れる
      const zoneTop = stackBottom + 24
      // 帯の下端は、いちばん低く入る支流（0.16w）の入り S 字＋合流 S 字が
      // 折り返さずに収まる高さまで
      const zoneBottom = mergeY - (swaySpan(0.16 * w, xMerge) + swaySpan(-24, 0.16 * w) + 24)
      const span = Math.max(160, zoneBottom - zoneTop)
      const yAt = (f: number) => zoneTop + span * f

      // 左から入る 2 本は、テックアイコン上の罫線 → 内側(0.38w) → 外側(0.16w) の
      // 間隔を等しく取り、その 2 本のあいだにフッターの statement
      //（"作って終わり、にしない。…" と tent space）を収める
      const stackTopLine = stackEl ? docY(stackEl) : zoneTop - 24
      let yLeftInner: number
      const statement = document.querySelector<HTMLElement>(".tent-footer__statement")
      const lineGap = 28
      let yLeftOuter = yAt(0.4)
      if (statement) {
        const stTop = docY(statement)
        const stBottom = stTop + statement.offsetHeight
        yLeftOuter = Math.min(zoneBottom, Math.max(yLeftOuter, stBottom + lineGap))
        const inner = (stackTopLine + yLeftOuter) / 2
        // 等間隔の中点が帯の外や statement に掛かるときだけ寄せる
        yLeftInner = Math.min(Math.max(inner, zoneTop), stTop - lineGap)
      } else {
        yLeftInner = (stackTopLine + yLeftOuter) / 2
      }

      // main: 中央を通る本線。他のレーンはここへ合流してマージ点に至る
      const mainTop = yLeftInner
      const dMain = `M ${xMerge} ${mainTop} L ${xMerge} ${mergeY}`

      const segs: Seg[] = [
        { d: dTrunk, top: trunkTop, bottom: trunkEnd },
        { d: dShiftBranch, top: branchY, bottom: shiftRunTop },
        { d: dShiftRunA, top: shiftRunTop, bottom: shiftHideY },
        { d: dSystemBranch, top: sysSplitY, bottom: sysRunTop },
        { d: dSystemRun, top: sysRunTop, bottom: sysRunEnd },
        { d: dSystemJoin, top: sysRunEnd, bottom: sysMergeY },
        { d: dShiftRunB, top: indigoEnd, bottom: shiftRunEnd },
        { d: dShiftJoin, top: shiftRunEnd, bottom: howJogY },
        { d: dMainRun, top: mainResumeY, bottom: run1End },
        { d: dMain, top: mainTop, bottom: mergeY },
        { d: dSvcRun, top: run2Top, bottom: mergeY - svcSway },
        { d: dSvcJoin, top: mergeY - svcSway, bottom: mergeY },
      ]

      // フィナーレ: 支流も同じ S 字で入る — 画面外すぐの位置から自分の
      // レーンへ sway し、縦を走って、マージ点へ sway する。グラフ中の
      // 曲がりがすべて同じ語彙になる。内側のレーンほど先に入れて交差を避ける
      const edge = (fromX: number, laneX: number, y: number) =>
        `M ${fromX} ${y}` + sway(fromX, laneX, y) + toMergeRow(laneX)
      const yRight = (yLeftInner + yLeftOuter) / 2
      const tribDs: [string, number][] = [
        [edge(-24, 0.38 * w, yLeftInner), yLeftInner],
        [edge(w + 24, 0.96 * w, yRight), yRight],
        [edge(-24, 0.16 * w, yLeftOuter), yLeftOuter],
      ]
      for (const [d, top] of tribDs) segs.push({ d, top, bottom: mergeY, dim: true })

      // 本文テキストの矩形: 線はこの領域では描かない（マスクで抜く）
      const textRects: Rect[] = []
      document
        .querySelectorAll<HTMLElement>(
          "main h1, main h2, main h3, main p, main .tent-works__tags, main .main-btn, main .tent-win, main .tent-works__shot, main .tent-stack-band, .tent-footer p, .tent-footer a, .tent-footer nav, .tent-footer__legals",
        )
        .forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.width < 8 || r.height < 8) return
          textRects.push({ x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height })
        })
      if (pinHost) {
        const r = pinHost.getBoundingClientRect()
        textRects.push({ x: 0, y: r.top + window.scrollY, w, h: r.height })
      }

      // チャプターテキスト帯: コミットラインから最後の段落末尾までは
      // 線を通さない（段落と段落のすき間にも出さない）
      document.querySelectorAll<HTMLElement>("main .tent-text").forEach((sec) => {
        const chapter = sec.querySelector<HTMLElement>(".tent-chapter")
        const comps = sec.querySelectorAll<HTMLElement>(".tent-text__component")
        const last = comps[comps.length - 1]
        if (!chapter || !last) return
        const bandTop = docY(chapter)
        const bandBottom = docY(last) + last.offsetHeight
        textRects.push({ x: 0, y: bandTop, w, h: bandBottom - bandTop })
      })

      // 料金セクションの注記: 無料相談の一文から「対応可」の行末までは線を通さない
      const note = document.querySelector<HTMLElement>(".tent-pricing__note")
      if (note) textRects.push({ x: 0, y: docY(note), w, h: note.offsetHeight })

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
        vision: [trunkTop, branchY],
        shift: [shiftRunTop, sysSplitY - sysSway],
        system: [sysRunTop, sysRunEnd],
        "how-it-works": [howJogY, run1End],
        // main の末端 = different の入口。線が途切れる直前にノードを置く
        different: [run1End - vh * 0.4, run1End],
        services: [run2Top, mergeY - svcSway],
      }

      const nodes: Node[] = []
      for (const s of NODE_STOPS) {
        const el = secEl(s.id)
        if (!el) continue
        const x = s.x * w
        const [lt, lb] = laneRange[s.id]
        nodes.push({ id: s.id, label: s.label, x, y: placeOnLane(x, docY(el) + vh * 0.3, lt, lb) })
      }
      nodes.push({ id: "__merge", label: "(HEAD -> main)", x: xMerge, y: mergeY, merge: true })

      // 分岐・合流点のコミット。git graph では枝が分かれる・戻る点も
      // 必ずコミットなので、装飾として四角を置く（リンクは持たない）
      const dots: Dot[] = [
        { x: xHow, y: branchY }, // main → shift 分岐
        { x: xVision, y: sysSplitY }, // shift → system 分岐
        { x: xVision, y: sysMergeY }, // system → shift 合流
        { x: xHow, y: howJogY }, // shift → main 合流
      ]

      setLayout({ height, segs, nodes, dots, textRects })
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
        if (n.classList.contains("tent-branch__node--merge")) {
          if (on && !mergeWasOn) {
            const r = n.getBoundingClientRect()
            window.dispatchEvent(
              new CustomEvent("tent-merge", {
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
    const el = id === "__merge" ? document.querySelector<HTMLElement>(".tent-footer") : document.getElementById(id)
    if (!el) return
    const lenis = (window as any).__tentLenis
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

  if (!layout) return <div ref={rootRef} className="tent-branch" />

  return (
    <div ref={rootRef} style={{ display: "contents" }}>
      <div className="tent-branch" style={{ height: layout.height }}>
        <svg className="tent-branch__svg" width="100%" height={layout.height} aria-hidden="true">
          <defs>
            <mask id="tent-branch-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height={layout.height}>
              <rect width="100%" height={layout.height} fill="#fff" />
              {layout.textRects.map((r, i) => (
                <rect key={i} x={r.x - 10} y={r.y - 8} width={r.w + 20} height={r.h + 16} fill="#000" />
              ))}
            </mask>
          </defs>
          <g mask="url(#tent-branch-mask)">
            {layout.segs.map((s, i) => (
              <path key={i} d={s.d} data-seg data-top={s.top} data-bottom={s.bottom} opacity={s.dim ? 0.5 : 1} />
            ))}
          </g>
        </svg>
      </div>
      {/* section nodes = commits（前面レイヤー、difference 合成） */}
      <nav className="tent-branch__nodes" style={{ height: layout.height }} aria-label="セクションナビゲーション">
        {layout.dots.map((d, i) => (
          <span
            key={i}
            className="tent-branch__dot"
            style={{ left: d.x, top: d.y }}
            data-node-y={d.y}
            aria-hidden="true"
          />
        ))}
        {layout.nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            className={n.merge ? "tent-branch__node tent-branch__node--merge" : "tent-branch__node"}
            style={{ left: n.x, top: n.y }}
            data-node-y={n.y}
            onClick={() => jumpTo(n.id)}
            aria-label={n.merge ? "フッターへ" : `${n.label} セクションへ`}
          >
            <span className="tent-branch__label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
