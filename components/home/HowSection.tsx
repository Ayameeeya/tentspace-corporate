"use client"

import { ScrambleText } from "./ScrambleText"

const STEPS = [
  { title: "consult", desc: "作りたいこと、お困りのこと。メモ一枚でも、雑談からでも大丈夫です。", num: "01" },
  { title: "propose", desc: "ちょうどいい構成と概算をご提案。プロトタイプで、イメージを合わせます。", num: "02" },
  { title: "build & operate", desc: "作って、届けて、その後も。改善を重ねていきます。", num: "03" },
]

export function HowSection() {
  return (
    <section className="mono-how" id="how-it-works">
      <div className="mono-container">
        <div className="mono-how__wrapper">
          {/* git log --graph: プロセスをコミットグラフとして見せる */}
          <div className="mono-how__graph">
            {STEPS.map((s) => (
              <div key={s.num} className="mono-how__node">
                <div className="mono-how__rail" aria-hidden="true">
                  <span className="mono-how__dot" />
                </div>
                <div className="mono-how__node-body">
                  <p className="paragraph-regular opacity-64">{s.num}</p>
                  <ScrambleText as="h2" className="heading-s">
                    {s.title}
                  </ScrambleText>
                  <p className="paragraph-m opacity-64">{s.desc}</p>
                </div>
              </div>
            ))}
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
