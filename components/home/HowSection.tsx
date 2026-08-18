"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrambleText } from "./ScrambleText"
import { prefersReducedMotion } from "./gsap-setup"

const STEPS = [
  { title: "consult", desc: "課題やアイデアをお聞かせください。ラフなメモ一枚でも、相談だけでも構いません。", num: "01" },
  { title: "propose", desc: "最適な構成と概算お見積もりをご提案。プロトタイプで認識を合わせます。", num: "02" },
  { title: "build & operate", desc: "開発からリリース、保守運用まで。継続的に改善を回します。", num: "03" },
]

export function HowSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const list = listRef.current
    if (!wrap || !list || prefersReducedMotion()) return

    const tween = gsap.fromTo(
      list,
      { y: 0 },
      {
        y: () => -(list.scrollHeight - wrap.clientHeight),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top 30%",
          end: "bottom 60%",
          scrub: 0.075,
          invalidateOnRefresh: true,
        },
      },
    )
    const ro = new ResizeObserver(() => ScrollTrigger.refresh())
    ro.observe(list)
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      ro.disconnect()
    }
  }, [])

  return (
    <section className="mono-how" id="how-it-works">
      <div className="mono-container">
        <div className="mono-how__wrapper">
          <div ref={wrapRef} className="mono-how__track-wrap">
            <div ref={listRef}>
              {STEPS.map((s) => (
                <div key={s.num} className="mono-how__item">
                  <div className="mono-how__info">
                    <ScrambleText as="h2" className="paragraph-m">
                      {s.title}
                    </ScrambleText>
                    <ScrambleText as="p" className="paragraph-m opacity-64">
                      {s.desc}
                    </ScrambleText>
                  </div>
                  <div className="mono-how__num">{s.num}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mono-how__text">
            <p className="heading-m ti-2">
              tent space は、Web・スマホアプリの開発を軸に、AIエージェント開発や業務改善・DX・運用自動化まで手がける開発パートナー。
            </p>
            <p className="heading-m">
              設計も、実装も、インフラも、デザインも。分業で薄まらない、一気通貫のものづくり。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
