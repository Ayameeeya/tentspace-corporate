"use client"

import { TentShell } from "@/components/home/TentShell"
import { MainBtn } from "@/components/home/MainBtn"
import { HeroVisual } from "@/components/home/HeroVisual"
import { ScrambleText } from "@/components/home/ScrambleText"
import { ChapterTextSection } from "@/components/home/ChapterText"
import { ShutterScroll } from "@/components/home/ShutterScroll"
import { SystemSection } from "@/components/home/SystemSection"
import { HowSection } from "@/components/home/HowSection"
import { DifferentSection } from "@/components/home/DifferentSection"
import { WorksSection } from "@/components/home/WorksSection"
import { BranchGraph } from "@/components/home/BranchGraph"
import { ConsoleEasterEgg } from "@/components/home/ConsoleEasterEgg"
import { ServicesSection } from "@/components/home/ServicesSection"
import { LogoLoop } from "@/components/LogoLoop"
import { STACK_LOGOS } from "@/components/home/stack-logos"

export default function Home() {
  return (
    <TentShell>
      <ConsoleEasterEgg />
      <BranchGraph />
      <main id="main-content">
        {/* ---------- hero ---------- */}
        <section className="tent-hero" id="vision">
          <div className="tent-container tent-hero__content">
            <ScrambleText as="h1" className="heading-l" mode="load" intensity={5}>
              tent space は、webとスマホアプリの開発スタジオ。フロントからサーバ、AWSまでをひとつのチームで。AIとともに、速く、確かに作ります。
            </ScrambleText>
            <div className="tent-hero__usps">
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
          <div className="tent-hero__visual">
            <HeroVisual />
          </div>
          <div className="tent-hero__cta">
            <MainBtn label="start a project" href="/contact" variant="outside" />
          </div>
        </section>

        {/* ---------- chapter: the shift ---------- */}
        <ChapterTextSection
          id="shift"
          label="the shift"
          wrapperClass="tent-text__wrapper--first"
          paragraphs={[
            {
              text: "システム開発は、いまも分業と伝言ゲームでできている。要件定義、設計、実装、テスト、運用 — 担当が変わるたびに意図が薄れ、コストと時間だけが積み上がっていく。",
              indent: 5,
            },
            {
              text: "tent space は、少人数のエンジニアとAIで、そのすべてをひと続きに。調整のための時間も費用も、乗せない。窓口もひとつ、責任もひとつ。",
              indent: 0,
            },
          ]}
        />
        <ShutterScroll variant="indigo" navTheme="indigo" prevTheme="base" seed={11} height="55vh" />

        {/* ---------- the system (pinned, indigo) ---------- */}
        <SystemSection />
        <ShutterScroll variant="off-white" navTheme="base" prevTheme="indigo" bg="indigo" seed={23} height="30vh" />

        {/* ---------- how it works ---------- */}
        <HowSection />

        {/* ---------- a different studio ---------- */}
        <DifferentSection />

        {/* ---------- selected works ---------- */}
        <WorksSection />

        {/* ---------- chapter: with tent space ---------- */}
        <ChapterTextSection
          label="with tent space"
          wrapperClass="tent-text__wrapper--second"
          paragraphs={[
            {
              text: (
                <>
                  あなたの「作りたい」に、tent space の
                  <span style={{ whiteSpace: "nowrap" }}>「作れる」を。</span>
                </>
              ),
              indent: 5,
            },
          ]}
        />
        <ShutterScroll variant="lilac" navTheme="lilac" prevTheme="base" seed={37} height="55vh" />

        {/* ---------- services ---------- */}
        <ServicesSection />
        <ShutterScroll variant="off-white" navTheme="base" prevTheme="lilac" bg="lilac" seed={51} height="30vh" />

        {/* ---------- tech stack band (React Bits LogoLoop) ---------- */}
        <div className="tent-stack-band">
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
    </TentShell>
  )
}
