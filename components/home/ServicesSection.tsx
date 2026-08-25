"use client"

import { ScrambleText } from "./ScrambleText"
import { MainBtn } from "./MainBtn"

// 料金プランではなく「いまの状態」から入ってもらう。
// 3つの入口は system セクションのライフサイクル（build / operate / prune）と同じ語彙
const ENTRIES = [
  {
    num: "01",
    kw: "build",
    voice: "これから、作りたいものがある。",
    res: "じっくり聞いて、設計から作って、届けます。運用も、そのまま続けます。",
    rows: [
      ["engagement", "プロジェクト型"],
      ["scope", "設計〜運用まで"],
    ],
  },
  {
    num: "02",
    kw: "operate",
    voice: "動いてはいるが、保守が重い。",
    res: "コードごと引き継いで、運用を自動化。毎月かかる手間と費用を軽くしていきます。",
    rows: [
      ["engagement", "伴走型 / 月額"],
      ["scope", "引き継ぎ〜自動化"],
    ],
  },
  {
    num: "03",
    kw: "prune",
    voice: "増えすぎて、全体が見えない。",
    res: "資産を棚卸しして、残すか畳むか、判断できる材料を揃えます。整理だけでも大丈夫です。",
    rows: [
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
        <div className="tent-pricing__entries">
          {ENTRIES.map((e) => (
            <div key={e.kw} className="tent-win">
              {/* system セクションと同じ mac 風ウィンドウで入口を見せる */}
              <div className="tent-win__bar">
                <div className="tent-win__btns" aria-hidden="true">
                  <span data-role="close" />
                  <span data-role="min" />
                  <span data-role="max" />
                </div>
                <p className="tent-win__title">
                  entry {e.num} — {e.kw}
                </p>
                <div className="tent-win__btns tent-win__btns--ghost" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="tent-win__body">
                <div className="tent-pricing__entry-lead">
                  <ScrambleText as="h3" className="heading-s">
                    {`「${e.voice}」`}
                  </ScrambleText>
                  <p className="paragraph-m opacity-64">{e.res}</p>
                </div>
                {e.rows.map(([k, v]) => (
                  <div key={k} className="tent-pricing__row">
                    <p className="paragraph-l">{k}</p>
                    <ScrambleText as="p" className="heading-s">
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
