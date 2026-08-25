"use client"

import { ScrambleText } from "./ScrambleText"
import { ShuffleText } from "./ShuffleText"
import { MainBtn } from "./MainBtn"

// 料金プランではなく「いまの状態」から入ってもらう。
// 3つの入口は system セクションのライフサイクル（build / operate / prune）と同じ語彙。
// 状況の声を主役にした全幅の帯で、窓のクロームは使わない
const ENTRIES = [
  {
    num: "01",
    kw: "build",
    voice: "これから、作りたいものがある。",
    res: "じっくり聞いて、設計から作って、届けます。運用も、そのまま続けます。",
    meta: [
      ["engagement", "プロジェクト型"],
      ["scope", "設計〜運用まで"],
    ],
  },
  {
    num: "02",
    kw: "operate",
    voice: "動いてはいるが、保守が重い。",
    res: "コードごと引き継いで、運用を自動化。毎月かかる手間と費用を軽くしていきます。",
    meta: [
      ["engagement", "伴走型 / 月額"],
      ["scope", "引き継ぎ〜自動化"],
    ],
  },
  {
    num: "03",
    kw: "prune",
    voice: "増えすぎて、全体が見えない。",
    res: "資産を棚卸しして、残すか畳むか、判断できる材料を揃えます。整理だけでも大丈夫です。",
    meta: [
      ["engagement", "相談から"],
      ["scope", "棚卸し〜クローズ"],
    ],
  },
]

export function ServicesSection() {
  return (
    <section className="tent-pricing" id="services">
      <div className="tent-container">
        <div className="tent-pricing__head">
          <h2 className="heading-m ti-2">これから作る人も、すでに持っている人も。</h2>
          <ScrambleText as="p" className="paragraph-l">
            three ways in, one team
          </ScrambleText>
        </div>
        <div className="tent-svc">
          {ENTRIES.map((e) => (
            <div key={e.kw} className="tent-svc__row">
              <div className="tent-svc__id">
                <p className="paragraph-regular opacity-64">{e.num}</p>
                <ScrambleText as="p" className="paragraph-l">
                  {e.kw}
                </ScrambleText>
              </div>
              <div className="tent-svc__main">
                <ShuffleText as="h3" className="heading-m">
                  {`「${e.voice}」`}
                </ShuffleText>
                <p className="paragraph-m opacity-64">{e.res}</p>
              </div>
              <div className="tent-svc__meta">
                {e.meta.map(([k, v]) => (
                  <div key={k} className="tent-svc__meta-row">
                    <p className="paragraph-regular opacity-64">{k}</p>
                    <ScrambleText as="p" className="paragraph-m">
                      {v}
                    </ScrambleText>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="tent-pricing__foot">
          <div className="tent-pricing__foot-note">
            <ScrambleText as="p" className="paragraph-s">
              まずは無料相談から。課題の整理だけでも歓迎です。費用はお見積もりの際に、ご予算に合わせてお伝えします。
            </ScrambleText>
            <p className="paragraph-m opacity-64">
              契約形態: 請負 / 準委任 ・ サイトデザインのみ対応可 ・ IoT・BLEデバイス連携対応可 ・ AI導入・DXの相談歓迎
            </p>
          </div>
          <MainBtn label="start a project" href="/contact" variant="inside" twoLine />
        </div>
      </div>
    </section>
  )
}
