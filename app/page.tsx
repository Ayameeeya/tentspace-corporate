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
              tent space は、エンジニアリングで事業を良くする会社。webもスマホアプリも、作るだけじゃなく、運用も、整理も引き受けます。
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
              text: "AIで、作るのは速く安くなった。それでも、いま動いているシステムの保守費は重いまま。少し直すにも見積もりが要り、中身の分かる人が社内にいない。",
              indent: 5,
            },
            {
              text: "tent space となら、直したいときに直せて、畳むものは選べます。保守に消えていた費用と時間は、次の一手に回せます。エンジニアを抱えなくても、事業は良くしていけます。",
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
