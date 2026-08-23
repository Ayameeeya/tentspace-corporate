"use client"

import { useEffect, useRef } from "react"
import { ScrambleText } from "./ScrambleText"

const STEPS = [
  { title: "consult", desc: "作りたいこと、お困りのこと。メモ一枚でも、雑談からでも大丈夫です。", num: "01" },
  { title: "propose", desc: "ちょうどいい構成と概算をご提案。プロトタイプで、イメージを合わせます。", num: "02" },
  { title: "build & operate", desc: "作って、届けて、その後も。改善を重ねていきます。", num: "03" },
]

export function HowSection() {
  const rootRef = useRef<HTMLElement>(null)

  // 背景の BranchGraph と同じ規則（画面の 72% 地点が描画前線）で、
  // レールの線が引かれ、届いたコミットが点灯する
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(".tent-how__node"))
    const update = () => {
      const revealY = window.scrollY + window.innerHeight * 0.72
      const dotY = (node: HTMLElement) => {
        const dot = node.querySelector<HTMLElement>(".tent-how__dot")
        if (!dot) return Infinity
        const r = dot.getBoundingClientRect()
        return r.top + window.scrollY + r.height / 2
      }
      nodes.forEach((node, i) => {
        const y = dotY(node)
        node.dataset.on = String(revealY >= y)
        if (nodes[i + 1]) {
          const p = Math.min(1, Math.max(0, (revealY - y) / Math.max(1, dotY(nodes[i + 1]) - y)))
          node.style.setProperty("--rail-p", p.toFixed(4))
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
  }, [])

  return (
    <section ref={rootRef} className="tent-how" id="how-it-works">
      <div className="tent-container">
        <div className="tent-how__wrapper">
          {/* git log --graph: プロセスをコミットグラフとして見せる */}
          <div className="tent-how__graph">
            {STEPS.map((s) => (
              <div key={s.num} className="tent-how__node">
                <div className="tent-how__rail" aria-hidden="true">
                  <span className="tent-how__dot" />
                </div>
                <div className="tent-how__node-body">
                  <p className="paragraph-regular opacity-64">{s.num}</p>
                  <ScrambleText as="h2" className="heading-s">
                    {s.title}
                  </ScrambleText>
                  <p className="paragraph-m opacity-64">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="tent-how__text">
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
