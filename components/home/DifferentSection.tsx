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
    after: "Webアプリもサイトも、設計からAWS、運用まで、ひと続きで。",
    before: "フロントはA社、サーバはB社、インフラはC社。調整だけで日が暮れる。",
  },
  {
    num: "02",
    label: "mobile",
    after: "スマホアプリを、企画からストア公開、その後の改善まで。",
    before: "人月の積み上げ見積もり。仕様変更のたびに追加費用と再調整。",
  },
  {
    num: "03",
    label: "ai agents",
    after: "繰り返しの仕事はAIエージェントに。人は、考えることに集中できる。",
    before: "毎日の転記、集計、報告。人手でしか回らない業務が積み上がる。",
  },
  {
    num: "04",
    label: "dx",
    after: "業務の流れを見直して、自動化。良くなり続ける仕組みを作る。",
    before: "ツールを入れて終わり。現場に定着せず、元のやり方に戻る。",
  },
  {
    num: "05",
    label: "design",
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

function DifferentItem({ item }: { item: (typeof ITEMS)[number] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const inner = innerRef.current
    const bar = barRef.current
    const text = textRef.current
    const prog = progRef.current
    const label = labelRef.current
    const content = contentRef.current
    if (!root || !inner || !bar || !text || !prog || !label || !content) return

    const lines = content.querySelectorAll<HTMLElement>(".mono-diff__line-top, .mono-diff__line-left")
    const bgAt = gsap.utils.interpolate("rgba(15, 0, 176, 0)", "rgba(15, 0, 176, 1)")
    const inkAt = gsap.utils.interpolate("#000000", "#e5e5e5")

    // each element travels to its horizontally mirrored position within the row
    let shifts = { prog: 0, label: 0, content: 0 }
    let travel = 0
    const measure = () => {
      const mirror = (el: HTMLElement) => inner.clientWidth - el.offsetWidth - 2 * el.offsetLeft
      const wide = window.matchMedia("(min-width: 768px)").matches
      shifts = wide
        ? { prog: mirror(prog), label: mirror(label), content: mirror(content) }
        : { prog: 0, label: 0, content: 0 }
      travel = window.innerHeight * 0.9 * TRAVEL_RATIO
    }
    measure()

    const applyFlip = (s: number) => {
      gsap.set(prog, { x: shifts.prog * s })
      gsap.set(label, { x: shifts.label * s })
      // text whitens ahead of the background fill so the midpoint stays readable
      gsap.set(content, { x: shifts.content * s, backgroundColor: bgAt(s), color: inkAt(Math.min(1, s * 1.6)) })
      lines.forEach((l) => gsap.set(l, { opacity: 1 - s }))
    }

    if (prefersReducedMotion()) {
      text.textContent = item.after
      gsap.set(bar, { scaleY: 1 })
      applyFlip(1)
      return
    }

    const morph = createTextMorph(text, item.before, item.after)
    morph(0)
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 32%",
      end: () => "+=" + window.innerHeight * 0.9,
      scrub: 0.075,
      invalidateOnRefresh: true,
      onRefresh: measure,
      onUpdate: (self) => {
        const p = self.progress
        gsap.set(inner, { y: travel * p })
        gsap.set(bar, { scaleY: Math.min(1, p / 0.7) })
        morph(easeInOutCubic(clamp01((p - TEXT_START) / (TEXT_END - TEXT_START))))
        applyFlip(easeInOutCubic(clamp01((p - FLIP_START) / (FLIP_END - FLIP_START))))
      },
      onLeave: () => {
        morph(1)
        applyFlip(1)
        gsap.set(inner, { y: travel })
      },
      onLeaveBack: () => {
        morph(0)
        applyFlip(0)
        gsap.set(inner, { y: 0 })
      },
    })
    return () => st.kill()
  }, [item])

  return (
    <div ref={rootRef} className="mono-diff__slot">
      <div ref={innerRef} className="mono-diff__item">
        <div ref={progRef} className="mono-diff__progress">
          <div className="mono-diff__counter">
            <p className="paragraph-m">{item.num}</p>
            <div className="mono-diff__counter-line" />
          </div>
          <div ref={barRef} className="mono-diff__bar" />
        </div>
        <div ref={labelRef} className="mono-diff__label">
          <h3 className="paragraph-m">{item.label}</h3>
        </div>
        <div ref={contentRef} className="mono-diff__content">
          <div className="mono-diff__line-top" />
          <div className="mono-diff__line-left" />
          <p ref={textRef} className="heading-m" style={{ minHeight: "3.9em" }}>
            {item.before}
          </p>
        </div>
      </div>
    </div>
  )
}

export function DifferentSection() {
  return (
    <section id="different">
      <div className="mono-container">
        <div className="mono-diff__head">
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
