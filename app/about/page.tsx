"use client"

import { TentShell } from "@/components/home/TentShell"
import { ChapterLabel, ChapterTextSection } from "@/components/home/ChapterText"
import { ScrambleText } from "@/components/home/ScrambleText"
import { MainBtn } from "@/components/home/MainBtn"
import { LogoLoop } from "@/components/LogoLoop"
import { STACK_LOGOS } from "@/components/home/stack-logos"

const VALUES = [
  { num: "01", title: "one team", desc: "設計も実装も運用も、同じチームで最後まで。はじめの想いを薄めない。" },
  { num: "02", title: "ai-augmented", desc: "AIと、ともに作る。繰り返しはエージェントに任せて、人は判断と品質に集中する。" },
  { num: "03", title: "build to last", desc: "作って終わりにしない。公開の後も、育ち続けるソフトウェアを。" },
]

const SERVICES = [
  { num: "01", title: "system development", desc: "Web・スマホアプリの開発" },
  { num: "02", title: "full-stack", desc: "フロントからサーバサイド、AWSまでの設計・構築・保守" },
  { num: "03", title: "ai & automation", desc: "AIエージェント開発、業務改善・DX、運用自動化" },
  { num: "04", title: "design", desc: "サイトデザイン（構築・保守まで一貫対応）" },
  { num: "05", title: "iot & devices", desc: "IoT・BLEデバイス連携を含むアプリ・システム開発" },
]

const COVERAGE = [
  ["frontend", "UI設計からフロントエンド実装まで"],
  ["backend", "API・データベースの設計と構築"],
  ["cloud", "AWSを中心としたインフラ設計・運用"],
  ["ai", "AIエージェントの開発と業務への組み込み"],
]

const COMPANY = [
  ["社名", "株式会社tent space"],
  ["設立", "2023年8月1日"],
  ["資本金", "¥1,000,000（資本準備金含む）"],
  ["事業内容", "ソフトウェア開発、ITコンサルティング"],
  ["代表者", "代表取締役 石井 絢子 / 取締役 根岸 宏繁"],
  ["所在地", "〒355-0316 埼玉県比企郡小川町大字角山323"],
]


export default function AboutPage() {
  return (
    <TentShell>
      <main id="main-content">
        {/* hero */}
        <section className="tent-doc" style={{ paddingBottom: "10vh" }}>
          <div className="tent-container">
            <ChapterLabel label="about" />
            <ScrambleText as="h1" className="heading-l" mode="load" intensity={5}>
              小さなテントから、無限の可能性を。
            </ScrambleText>
            <div className="tent-doc__meta">
              <ScrambleText as="p" className="paragraph-m" mode="load" intensity={5}>
                est. 2023 — izu, japan
              </ScrambleText>
            </div>
          </div>
        </section>

        {/* story */}
        <ChapterTextSection
          label="our story"
          wrapperClass="tent-text__wrapper--second"
          paragraphs={[
            {
              text: "テントは、私たち。大きなビルより速く建ち、必要な場所に張り、役目を終えれば次の場所へ。スペースは、これから何かが建つ空白であり、どこまでも広がる宇宙でもあります。",
              indent: 5,
            },
            {
              text: "その空白に、あなたのビジネスを建てる。そして小さなテントの中に、無限の可能性を抱く。社名の「␣」は、空白の記号 — tent space という名前には、そんな意味を込めています。",
              indent: 0,
            },
            {
              text: "少人数のチームに、AIエージェントという仲間を加え、設計から運用までを一気通貫で担う。2023年、伊豆の小さな拠点から始まりました。",
              indent: 0,
            },
          ]}
        />

        {/* coverage */}
        <section>
          <div className="tent-container">
            <div className="tent-stat-rows">
              {COVERAGE.map(([value, label], i) => (
                <div key={i} className="tent-stat-row">
                  <p className="paragraph-regular opacity-64">{String(i + 1).padStart(2, "0")}</p>
                  <ScrambleText as="p" className="heading-m">
                    {value}
                  </ScrambleText>
                  <p className="paragraph-m opacity-64">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* values */}
        <section style={{ paddingTop: "20vh" }}>
          <div className="tent-container">
            <div className="tent-diff__head" style={{ padding: "0 0 8em" }}>
              <ScrambleText as="h2" className="heading-s">
                私たちの働き方
              </ScrambleText>
              <ScrambleText as="p" className="paragraph-l">
                how we work
              </ScrambleText>
            </div>
            <div className="tent-stat-rows">
              {VALUES.map((v) => (
                <div key={v.num} className="tent-stat-row">
                  <p className="paragraph-regular opacity-64">{v.num}</p>
                  <ScrambleText as="h3" className="heading-s">
                    {v.title}
                  </ScrambleText>
                  <p className="paragraph-m opacity-64">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* services */}
        <section style={{ paddingTop: "20vh" }}>
          <div className="tent-container">
            <div className="tent-diff__head" style={{ padding: "0 0 8em" }}>
              <ScrambleText as="h2" className="heading-s">
                事業内容
              </ScrambleText>
              <ScrambleText as="p" className="paragraph-l">
                what we do
              </ScrambleText>
            </div>
            <div className="tent-stat-rows">
              {SERVICES.map((s) => (
                <div key={s.num} className="tent-stat-row">
                  <p className="paragraph-regular opacity-64">{s.num}</p>
                  <ScrambleText as="h3" className="heading-s">
                    {s.title}
                  </ScrambleText>
                  <p className="paragraph-m opacity-64">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* tech stack */}
        <section style={{ padding: "20vh 0 0" }}>
          <div className="tent-container">
            <ChapterLabel label="tech stack" />
          </div>
          <div className="tent-stack-band" style={{ borderTop: "none", paddingTop: "1em" }}>
            <LogoLoop
              logos={STACK_LOGOS}
              speed={60}
              logoHeight={28}
              gap={64}
              pauseOnHover
              fadeOut
              fadeOutColor="#e5e5e5"
              ariaLabel="tent space tech stack"
            />
          </div>
        </section>

        {/* company info */}
        <section style={{ paddingTop: "15vh" }}>
          <div className="tent-container">
            <div className="tent-diff__head" style={{ padding: "0 0 8em" }}>
              <ScrambleText as="h2" className="heading-s">
                会社概要
              </ScrambleText>
              <ScrambleText as="p" className="paragraph-l">
                company
              </ScrambleText>
            </div>
            <div className="tent-doc__rows" style={{ maxWidth: "62em" }}>
              {COMPANY.map(([k, v], i) => (
                <div key={i} className="tent-doc__row">
                  <p className="paragraph-regular opacity-64">{k}</p>
                  <p className="paragraph-regular">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* cta */}
        <section style={{ padding: "20vh 0 10vh" }}>
          <div className="tent-container" style={{ display: "flex", flexDirection: "column", gap: "3em", alignItems: "flex-start" }}>
            <ScrambleText as="h2" className="heading-m">
              まずは、作りたいものの話から始めましょう。
            </ScrambleText>
            <MainBtn label="start a project" href="/contact" variant="inside" twoLine />
          </div>
        </section>
      </main>
    </TentShell>
  )
}
