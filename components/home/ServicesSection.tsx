"use client"

import { ScrambleText } from "./ScrambleText"
import { MainBtn } from "./MainBtn"

const PLANS = [
  {
    name: "Project",
    price: "ask",
    per: "/project",
    rows: [
      ["engagement", "プロジェクト型"],
      ["scope", "設計〜リリース"],
      ["stack", "web · mobile · aws"],
      ["estimate", "無料"],
    ],
  },
  {
    name: "Partner",
    price: "ask",
    per: "/month",
    rows: [
      ["engagement", "伴走型"],
      ["scope", "開発〜保守運用"],
      ["automation", "運用自動化"],
      ["estimate", "無料"],
    ],
  },
]

export function ServicesSection() {
  return (
    <section className="mono-pricing" id="services">
      <div className="mono-container">
        <div className="mono-pricing__head">
          <h2 className="heading-m ti-2">作りたいものに合わせて、ふたつの関わり方</h2>
          <ScrambleText as="p" className="paragraph-l">
            project-based, or ongoing. your choice.
          </ScrambleText>
        </div>
        <div className="mono-pricing__grid">
          <div className="mono-pricing__cards">
            {PLANS.map((plan) => (
              <div key={plan.name} className="mono-win">
                {/* system セクションと同じレトロ OS ウィンドウでプランを見せる */}
                <div className="mono-win__bar">
                  <p className="mono-win__title">plan — {plan.name.toLowerCase()}</p>
                  <div className="mono-win__btns" aria-hidden="true">
                    <span>–</span>
                    <span>□</span>
                    <span>✕</span>
                  </div>
                </div>
                <div className="mono-win__body">
                  <div className="mono-pricing__row mono-pricing__row--top">
                    <h3 className="paragraph-l">plan</h3>
                    <div style={{ textAlign: "right" }}>
                      <ScrambleText as="p" className="heading-s">
                        {plan.name}
                      </ScrambleText>
                      <div className="mono-pricing__cost">
                        <p className="heading-s">¥</p>
                        <ScrambleText as="p" className="heading-s">
                          {plan.price}
                        </ScrambleText>
                        <p className="paragraph-m">{plan.per}</p>
                      </div>
                    </div>
                  </div>
                  {plan.rows.map(([k, v]) => (
                    <div key={k} className="mono-pricing__row">
                      <h3 className="paragraph-l">{k}</h3>
                      <ScrambleText as="p" className="heading-s">
                        {v}
                      </ScrambleText>
                    </div>
                  ))}
                  <div className="mono-pricing__row" style={{ justifyContent: "flex-end", minHeight: "6em" }}>
                    <MainBtn label="start a project" href="/contact" variant="inside" twoLine />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mono-pricing__note">
            <ScrambleText as="p" className="paragraph-s">
              まずは無料相談から。課題の整理だけでも歓迎です。費用はお見積もりの際に、はっきりお伝えします。
            </ScrambleText>
            <div>
              <div className="mono-pricing__row" style={{ minHeight: "3em" }}>
                <p className="paragraph-m">契約形態: 請負 / 準委任</p>
              </div>
              <div className="mono-pricing__row" style={{ minHeight: "3em" }}>
                <p className="paragraph-m">AI導入・DXの相談: 歓迎</p>
              </div>
              <div className="mono-pricing__row" style={{ minHeight: "3em" }}>
                <p className="paragraph-m">サイトデザインのみ: 対応可</p>
              </div>
              <div className="mono-pricing__row" style={{ minHeight: "3em" }}>
                <p className="paragraph-m">IoT・BLEデバイス連携: 対応可</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
