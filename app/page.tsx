"use client"

import { MonoShell } from "@/components/home/MonoShell"
import { MainBtn } from "@/components/home/MainBtn"
import { HeroVisual } from "@/components/home/HeroVisual"
import { ScrambleText } from "@/components/home/ScrambleText"
import { ChapterTextSection } from "@/components/home/ChapterText"
import { ShutterScroll } from "@/components/home/ShutterScroll"
import { SystemSection } from "@/components/home/SystemSection"
import { HowSection } from "@/components/home/HowSection"
import { DifferentSection } from "@/components/home/DifferentSection"
import { WorksSection } from "@/components/home/WorksSection"
import { ServicesSection } from "@/components/home/ServicesSection"
import { LogoLoop } from "@/components/LogoLoop"
import { STACK_LOGOS } from "@/components/home/stack-logos"

export default function Home() {
  return (
    <MonoShell>
      <main id="main-content">
        {/* ---------- hero ---------- */}
        <section className="mono-hero" id="vision">
          <div className="mono-container mono-hero__content">
            <ScrambleText as="h1" className="heading-l" mode="load" intensity={5}>
              tent space は、webとスマホアプリの開発スタジオ。フロントからサーバ、AWSまでを一気通貫で設計し、AIと共に速く、確かに作る。
            </ScrambleText>
            <div className="mono-hero__usps">
              <ScrambleText as="p" className="paragraph-m" mode="load" intensity={5}>
                design to operation
              </ScrambleText>
              <ScrambleText as="p" className="paragraph-m" mode="load" intensity={5}>
                tent space ©2026
              </ScrambleText>
              <ScrambleText as="p" className="paragraph-m" mode="load" intensity={5}>
                web · mobile · ai
              </ScrambleText>
            </div>
          </div>
          <div className="mono-hero__visual">
            <HeroVisual />
          </div>
          <div className="mono-hero__cta">
            <MainBtn label="start a project" href="/contact" variant="outside" />
          </div>
        </section>

        {/* ---------- chapter: the shift ---------- */}
        <ChapterTextSection
          label="the shift"
          wrapperClass="mono-text__wrapper--first"
          paragraphs={[
            {
              text: "システム開発は、いまも分業と伝言ゲームでできている。要件定義、設計、実装、テスト、運用 — 担当が変わるたびに意図が薄れ、コストと時間だけが積み上がっていく。",
              indent: 5,
            },
            {
              text: "tent space は、少数のエンジニアとAIで、そのすべてを一気通貫で引き受ける。フロントエンドからサーバサイド、AWSまで。窓口はひとつ、責任もひとつ。",
              indent: 0,
            },
          ]}
        />
        <ShutterScroll variant="indigo" navTheme="indigo" prevTheme="base" seed={11} />

        {/* ---------- the system (pinned, indigo) ---------- */}
        <SystemSection />
        <ShutterScroll variant="off-white" navTheme="base" prevTheme="indigo" bg="indigo" seed={23} height="6em" />

        {/* ---------- how it works ---------- */}
        <HowSection />

        {/* ---------- a different studio ---------- */}
        <DifferentSection />

        {/* ---------- selected works ---------- */}
        <WorksSection />

        {/* ---------- chapter: with tent space ---------- */}
        <ChapterTextSection
          label="with tent space"
          wrapperClass="mono-text__wrapper--second"
          paragraphs={[
            {
              text: "あなたは「何を作るか」に集中すればいい。「どう作るか」は、tent space が引き受ける。",
              indent: 5,
            },
          ]}
        />
        <ShutterScroll variant="olive" navTheme="olive" prevTheme="base" seed={37} />

        {/* ---------- services ---------- */}
        <ServicesSection />
        <ShutterScroll variant="off-white" navTheme="base" prevTheme="olive" bg="olive" seed={51} height="6em" />

        {/* ---------- tech stack band (React Bits LogoLoop) ---------- */}
        <div className="mono-stack-band">
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

      </main>
    </MonoShell>
  )
}
