"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrambleText } from "./ScrambleText"
import { ShuffleText } from "./ShuffleText"
import { createTextMorph } from "./scramble"
import { prefersReducedMotion } from "./gsap-setup"

const ITEMS = [
  {
    num: "01",
    label: "web",
    hash: "b7e2f4a",
    after: "Webアプリもサイトも、設計からAWS、運用まで、ひと続きで。",
    before: "フロントはA社、サーバはB社、インフラはC社。調整だけで日が暮れる。",
  },
  {
    num: "02",
    label: "mobile",
    hash: "3c91d08",
    after: "スマホアプリを、企画からストア公開、その後の改善まで。",
    before: "人月の積み上げ見積もり。仕様変更のたびに追加費用と再調整。",
  },
  {
    num: "03",
    label: "ai agents",
    hash: "f04a77e",
    after: "繰り返しの仕事はAIエージェントに。人は、考えることに集中できる。",
    before: "毎日の転記、集計、報告。人手でしか回らない業務が積み上がる。",
  },
  {
    num: "04",
    label: "dx",
    hash: "58c1b9d",
    after: "業務の流れを見直して、自動化。良くなり続ける仕組みを作る。",
    before: "ツールを入れて終わり。現場に定着せず、元のやり方に戻る。",
  },
  {
    num: "05",
    label: "design",
    hash: "a26e33f",
    after: "デザインから構築・保守まで、世界観ごとひとつのチームで形にする。",
    before: "デザイン会社と開発会社のあいだで、意図が少しずつ失われていく。",
  },
]

// motion leads, copy follows: the row flips and inverts first, then the text
// morphs while it settles — the "after" copy never appears in the "before" layout
const FLIP_START = 0.12
const FLIP_END = 0.5
const TEXT_START = 0.24
const TEXT_END = 0.55
// the row itself follows the scroll at 70% speed (pseudo-pin) so the flipped
// state stays on screen through the rest of the trigger range
const TRAVEL_RATIO = 0.7
// git ツリーの物語では、この行の変化はここで「コミット」される。
// モーフが落ち着いた直後を成立点とし、解除は少し手前に取って
// 境界上のスクロールで明滅しないようにする（ヒステリシス）
const COMMIT_AT = 0.58
const UNCOMMIT_AT = 0.5

function DifferentItem({ item }: { item: (typeof ITEMS)[number] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const traceRef = useRef<SVGPathElement>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const inner = innerRef.current
    const bar = barRef.current
    const text = textRef.current
    const prog = progRef.current
    const label = labelRef.current
    const content = contentRef.current
    const trace = traceRef.current
    const node = nodeRef.current
    if (!root || !inner || !bar || !text || !prog || !label || !content || !trace || !node) return

    const lines = content.querySelectorAll<HTMLElement>(".tent-diff__line-top, .tent-diff__line-left")
    const bgAt = gsap.utils.interpolate("rgba(15, 0, 176, 0)", "rgba(15, 0, 176, 1)")
    const inkAt = gsap.utils.interpolate("#000000", "#e5e5e5")

    // each element travels to its horizontally mirrored position within the row
    let shifts = { prog: 0, label: 0, content: 0 }
    let travel = 0
    let traceLen = 0
    const measure = () => {
      const mirror = (el: HTMLElement) => inner.clientWidth - el.offsetWidth - 2 * el.offsetLeft
      const wide = window.matchMedia("(min-width: 768px)").matches
      shifts = wide
        ? { prog: mirror(prog), label: mirror(label), content: mirror(content) }
        : { prog: 0, label: 0, content: 0 }
      travel = window.innerHeight * 0.9 * TRAVEL_RATIO
      // トレース線: バーの元位置から足元を右へ走り、大きくゆったりした
      // カーブで移動後のバーへ合流する。ツリーの sway と同じく接線連続で
      // 90° の角を作らない。offsetLeft/Top は transform の影響を
      // 受けないので、フリップ途中のリフレッシュでも素の位置が取れる
      const traceX = bar.offsetLeft
      const endX = traceX + shifts.prog
      const yLine = prog.offsetTop + prog.offsetHeight - 0.5
      const r = Math.min(180, Math.max(48, shifts.prog * 0.3))
      if (shifts.prog > 0) {
        trace.setAttribute(
          "d",
          `M ${traceX} ${yLine}` +
            ` L ${endX - r} ${yLine}` +
            ` Q ${endX} ${yLine}, ${endX} ${yLine - r}`,
        )
        traceLen = trace.getTotalLength()
        trace.style.strokeDasharray = `${traceLen}`
        trace.style.strokeDashoffset = `${traceLen}`
      } else {
        trace.setAttribute("d", "")
        traceLen = 0
      }
      // コミットはトレースがバーに合流する点に打つ
      node.style.left = `${endX + 0.5}px`
      node.style.top = `${yLine - r}px`
    }
    measure()

    const applyFlip = (s: number) => {
      gsap.set(prog, { x: shifts.prog * s })
      gsap.set(label, { x: shifts.label * s })
      // text whitens ahead of the background fill so the midpoint stays readable
      gsap.set(content, { x: shifts.content * s, backgroundColor: bgAt(s), color: inkAt(Math.min(1, s * 1.6)) })
      // レーン移動の軌跡は移動と同じ速さで左から右へ引かれる
      if (traceLen) trace.style.strokeDashoffset = `${traceLen * (1 - s)}`
      lines.forEach((l) => gsap.set(l, { opacity: 1 - s }))
    }

    if (prefersReducedMotion()) {
      text.textContent = item.after
      gsap.set(bar, { scaleY: 1 })
      applyFlip(1)
      root.dataset.committed = "true"
      return
    }

    const morph = createTextMorph(text, item.before, item.after)
    morph(0)
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

    // 生の onUpdate ではなくプロキシトゥイーンに scrub を効かせる。
    // タッチ端末は Lenis の補間を通らない（ネイティブスクロール）ため、
    // scrub の追従補間だけが滑らかさの源になる — 長めに取る
    const proxy = { p: 0 }
    // コミット成立の一発演出: わずかに沈んで定着するスタンプ＋ハッシュ点灯。
    // スクラブとは独立に時間で走る。取り消し（逆走）は事件ではないので、
    // 演出なしで静かに戻す
    const commit = { on: false, armed: false }
    const playCommit = () => {
      gsap.fromTo(content, { scale: 1.016 }, { scale: 1, duration: 0.5, ease: "power4.out" })
    }
    const render = () => {
      const p = proxy.p
      gsap.set(inner, { y: travel * p })
      // バーはコミット成立と同時に下端（トレースとの角）へ届く
      gsap.set(bar, { scaleY: Math.min(1, p / COMMIT_AT) })
      morph(easeInOutCubic(clamp01((p - TEXT_START) / (TEXT_END - TEXT_START))))
      applyFlip(easeInOutCubic(clamp01((p - FLIP_START) / (FLIP_END - FLIP_START))))
      const committed = commit.on ? p > UNCOMMIT_AT : p >= COMMIT_AT
      if (committed !== commit.on) {
        commit.on = committed
        root.dataset.committed = String(committed)
        // ページ読み込み時点で既に越えていた行は、状態だけ合わせて演出は撃たない
        if (committed && commit.armed) playCommit()
      }
      commit.armed = true
    }
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches
    const tween = gsap.to(proxy, {
      p: 1,
      ease: "none",
      onUpdate: render,
      scrollTrigger: {
        trigger: root,
        start: "top 32%",
        end: () => "+=" + window.innerHeight * 0.9,
        scrub: coarse ? 0.45 : 0.075,
        invalidateOnRefresh: true,
        onRefresh: measure,
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [item])

  return (
    <div ref={rootRef} className="tent-diff__slot">
      <div ref={innerRef} className="tent-diff__item">
        <div ref={progRef} className="tent-diff__progress">
          <div className="tent-diff__counter">
            <p className="paragraph-m">{item.num}</p>
          </div>
          <div ref={barRef} className="tent-diff__bar" />
        </div>
        <div ref={labelRef} className="tent-diff__label">
          {/* 行の識別子はディスプレイ扱い — 本文（heading-m）に対する見出し */}
          <h3 className="heading-s">{item.label}</h3>
        </div>
        <div ref={contentRef} className="tent-diff__content">
          <div className="tent-diff__line-top" />
          <div className="tent-diff__line-left" />
          <p ref={textRef} className="heading-m" style={{ minHeight: "3.9em" }}>
            {item.before}
          </p>
        </div>
        <svg className="tent-diff__trace" aria-hidden="true">
          <path ref={traceRef} />
        </svg>
        <div ref={nodeRef} className="tent-diff__node" aria-hidden="true">
          <span className="tent-diff__node-label">commit {item.hash}</span>
        </div>
      </div>
    </div>
  )
}

export function DifferentSection() {
  return (
    <section id="different">
      <div className="tent-container">
        <div className="tent-diff__head">
          <ShuffleText as="h2" className="heading-s">
            いつものシステム開発が、tent space だとこう変わる
          </ShuffleText>
          <ScrambleText as="p" className="paragraph-l">
            a different studio
          </ScrambleText>
        </div>
        {ITEMS.map((item) => (
          <DifferentItem key={item.num} item={item} />
        ))}
      </div>
    </section>
  )
}
