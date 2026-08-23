"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrambleText } from "./ScrambleText"
import { prefersReducedMotion } from "./gsap-setup"

const CHAPTERS = [
  { kw: "intent", sub: "hearing + goal", statement: "まずは、じっくり聞く。\n作るべきものを見つける。" },
  { kw: "design", sub: "ux + architecture", statement: "画面も、仕組みも設計する。\nフロントからAWSまで。" },
  { kw: "build", sub: "code + review", statement: "AIが速く作り、\n人が丁寧に確かめる。" },
  { kw: "launch", sub: "deploy + operate", statement: "リリースして、終わりじゃない。\nそのまま運用まで。" },
  { kw: "evolve", sub: "automate + improve", statement: "運用を自動化して、\nデータをもとに進化し続ける。" },
]

const BAR_ACTIVE = { backgroundColor: "#0f00b0", color: "#e5e5e5" }
const BAR_IDLE = { backgroundColor: "#cbcadf", color: "#000000" }

/**
 * Pinned "system" scene: each process step opens as a retro-OS window and
 * cascades over the previous ones. The newest window carries the active
 * (indigo) title bar; older ones dim to the tint, old-desktop style.
 * Progress is mapped through a paused timeline (manual render, no scrub lag).
 */
export function SystemSection() {
  const pinRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const pin = pinRef.current
    const section = sectionRef.current
    if (!pin || !section) return
    const wins = Array.from(pin.querySelectorAll<HTMLElement>(".tent-system__win"))
    const bars = Array.from(pin.querySelectorAll<HTMLElement>(".tent-system__win-bar"))
    const reduced = prefersReducedMotion()

    // stack steps: older windows are sent back by this much per depth
    const STEP_X = 0.5 // em, to the left
    const STEP_Y = 2.8 // em, upwards (≈ title bar height)

    // all windows share the same centered base position
    gsap.set(wins, { xPercent: -50, yPercent: -50 })

    if (reduced) {
      // static: all windows open and stacked, last one active + centered
      wins.forEach((win, i) => {
        const depth = wins.length - 1 - i
        gsap.set(win, {
          autoAlpha: 1,
          visibility: "visible",
          x: `${-depth * STEP_X}em`,
          y: `${-depth * STEP_Y}em`,
        })
      })
      gsap.set(bars.slice(0, -1), BAR_IDLE)
      return
    }

    // paused master timeline: each window pops open, previous bar goes idle
    const tl = gsap.timeline({ paused: true })
    const REVEAL = 0.5
    const HOLD = 0.3

    wins.forEach((win, i) => {
      tl.set(win, { visibility: "visible" })
      // 新規ウィンドウは常に中央にポップする
      tl.fromTo(
        win,
        { autoAlpha: 0, scale: 0.88, y: "0.9em" },
        { autoAlpha: 1, scale: 1, y: 0, duration: REVEAL, ease: "systemChapterPop", transformOrigin: "50% 50%" },
      )
      const chars = win.querySelectorAll<HTMLElement>(".tent-system__win-ch")
      tl.set(chars, { autoAlpha: 0 }, "<")
      if (i > 0 && bars[i - 1]) {
        tl.to(bars[i - 1], { ...BAR_IDLE, duration: REVEAL * 0.4, ease: "systemEaseOut" }, "<")
      }
      // 既存のウィンドウを一段ずつ奥（上・少し左）へ送る
      for (let j = 0; j < i; j++) {
        const depth = i - j
        tl.to(
          wins[j],
          { x: `${-depth * STEP_X}em`, y: `${-depth * STEP_Y}em`, duration: REVEAL * 0.6, ease: "systemEaseOut" },
          "<",
        )
      }
      // プログレスバーのセグメントがカチカチと埋まる
      const segs = win.querySelectorAll<HTMLElement>('.tent-system__win-seg[data-on="true"]')
      if (segs.length > 0) {
        tl.fromTo(segs, { opacity: 0 }, { opacity: 1, duration: 0.03, stagger: 0.016, ease: "none" }, "<0.2")
      }
      // ステートメントを1文字ずつタイプ（Text Type）。カーソルがタイプ位置に追従する
      if (chars.length > 0) {
        const caret = win.querySelector<HTMLElement>(".tent-system__win-caret")
        const proxy = { n: 0 }
        if (caret) tl.set(caret, { autoAlpha: 1 }, "<0.1")
        tl.fromTo(
          proxy,
          { n: 0 },
          {
            n: chars.length,
            duration: chars.length * 0.013,
            ease: "none",
            onUpdate: () => {
              const count = Math.round(proxy.n)
              chars.forEach((ch, k) => gsap.set(ch, { autoAlpha: k < count ? 1 : 0 }))
              if (caret) {
                const anchor = count > 0 ? chars[count - 1] : chars[0]
                const x = count > 0 ? anchor.offsetLeft + anchor.offsetWidth : chars[0].offsetLeft
                gsap.set(caret, { x, y: anchor.offsetTop })
              }
            },
          },
          caret ? "<" : "<0.1",
        )
      }
      tl.to({}, { duration: HOLD })
    })
    tl.to({}, { duration: 0.2 })

    const st = ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: () => `+=${window.innerHeight * 3.8}`,
      pin,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        tl.progress(self.progress)
      },
    })

    return () => {
      st.kill()
      tl.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="tent-system" id="system">
      <div className="tent-container tent-system__intro">
        <ScrambleText as="h2" className="paragraph-m" intensity={2}>
          the system
        </ScrambleText>
        <div style={{ maxWidth: "62em", margin: "0.5em auto 0" }}>
          <ScrambleText as="h3" className="heading-l ws-pre-line" intensity={2}>
            {"聞いて、設計して、\n作って、育てる。\nAIがスピードを、\n人が品質を。"}
          </ScrambleText>
        </div>
      </div>
      <div ref={pinRef} className="tent-system__pin">
        <div className="tent-system__desktop">
          {CHAPTERS.map((c, i) => (
            <div key={c.kw} className="tent-system__win" style={{ "--wi": i } as CSSProperties}>
              <div className="tent-system__win-bar">
                <p className="tent-system__win-title">
                  {c.kw} — {c.sub}
                </p>
                <div className="tent-system__win-btns" aria-hidden="true">
                  <span>–</span>
                  <span>□</span>
                  <span>✕</span>
                </div>
              </div>
              <div className="tent-system__win-body">
                <div className="tent-system__win-progress">
                  <p className="tent-system__win-meta">
                    process {String(i + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
                  </p>
                  <div className="tent-system__win-track-row" aria-hidden="true">
                    <div className="tent-system__win-track">
                      {Array.from({ length: 20 }).map((_, k) => (
                        <span key={k} className="tent-system__win-seg" data-on={k < (i + 1) * 4} />
                      ))}
                    </div>
                    <p className="tent-system__win-pct">{(i + 1) * 20}%</p>
                  </div>
                </div>
                <p className="tent-system__win-statement">
                  {c.statement.split("").map((ch, k) =>
                    ch === "\n" ? <br key={k} /> : (
                      <span key={k} className="tent-system__win-ch">
                        {ch}
                      </span>
                    ),
                  )}
                  <span className="tent-system__win-caret" aria-hidden="true">
                    |
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
