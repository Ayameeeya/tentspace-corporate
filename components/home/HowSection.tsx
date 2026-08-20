"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrambleText } from "./ScrambleText"
import { prefersReducedMotion } from "./gsap-setup"

const STEPS = [
  { title: "consult", desc: "作りたいこと、お困りのこと。メモ一枚でも、雑談からでも大丈夫です。", num: "01" },
  { title: "propose", desc: "ちょうどいい構成と概算をご提案。プロトタイプで、イメージを合わせます。", num: "02" },
  { title: "build & operate", desc: "作って、届けて、その後も。改善を重ねていきます。", num: "03" },
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
          // ナビからのジャンプはセクション上端に着地する（track 上端 ≈ 画面の
          // 8〜18%）。開始をそれより下に置き、着地時は必ず 01 から始める
          start: "top 8%",
          end: "bottom 30%",
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
                    {/* 日本語の説明文はスクランブルさせず静的に出す */}
                    <p className="paragraph-m opacity-64">{s.desc}</p>
                  </div>
                  <div className="mono-how__num">{s.num}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mono-how__text">
            <p className="heading-m ti-2">
              tent space は、Web・スマホアプリの開発を軸に、AIエージェント開発や業務改善・DX・運用自動化まで、ともに手がける開発パートナー。
            </p>
            <p className="heading-m">
              設計も、実装も、インフラも、デザインも。はじめから終わりまで、ひとつのチームで。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
