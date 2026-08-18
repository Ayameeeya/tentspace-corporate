"use client"

import { useEffect, useRef } from "react"
import { ScrambleText } from "./ScrambleText"
import { attachHoverScramble } from "./scramble"
import { prefersReducedMotion } from "./gsap-setup"

const WORKS = [
  {
    num: "01",
    name: "3Dasset",
    url: "https://3dasset.io/",
    video: "/works/3dasset.mp4",
    poster: "/works/3dasset.jpg",
    desc: "3Dアセットのマーケットプレイス。デザインから開発、保守までを一貫して担当。",
    tags: ["design", "build", "maintenance"],
  },
  {
    num: "02",
    name: "TOKYO EPIC",
    url: "https://www.tokyo-epic.com/",
    video: "/works/tokyo-epic.mp4",
    poster: "/works/tokyo-epic.jpg",
    desc: "アニメーションIPスタジオのコーポレートサイト。デザインから開発、保守までを一貫して担当。",
    tags: ["design", "build", "maintenance"],
  },
]

export function WorksSection() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cleanups = Array.from(root.querySelectorAll<HTMLElement>("[data-mono-hover]")).map((el) =>
      attachHoverScramble(el, 3),
    )

    // play the site videos only while on screen (and never with reduced motion)
    const videos = Array.from(root.querySelectorAll<HTMLVideoElement>("video"))
    const reduced = prefersReducedMotion()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting && !reduced) video.play().catch(() => {})
          else video.pause()
        })
      },
      { rootMargin: "100px" },
    )
    videos.forEach((v) => io.observe(v))

    return () => {
      cleanups.forEach((fn) => fn())
      io.disconnect()
    }
  }, [])

  return (
    <section ref={rootRef} className="mono-works" id="works">
      <div className="mono-container">
        <div className="mono-diff__head" style={{ padding: "0 0 8em" }}>
          <h2 className="heading-s">デザインも、開発も、運用も。手がけたサイトの一部</h2>
          <ScrambleText as="p" className="paragraph-l">
            selected works
          </ScrambleText>
        </div>
        {WORKS.map((w) => (
          <div key={w.num} className="mono-works__item">
            <div className="mono-works__info">
              <p className="paragraph-regular opacity-64">{w.num}</p>
              <ScrambleText as="h3" className="heading-s">
                {w.name}
              </ScrambleText>
              <div className="mono-works__tags">
                {w.tags.map((t) => (
                  <span key={t} className="mono-works__tag">
                    {t}
                  </span>
                ))}
              </div>
              <p className="paragraph-m opacity-64">{w.desc}</p>
              <a href={w.url} target="_blank" rel="noreferrer" className="paragraph-m mono-ul" data-mono-hover>
                <span data-mono-hover-target>visit site ↗</span>
              </a>
            </div>
            <a href={w.url} target="_blank" rel="noreferrer" className="mono-works__shot" aria-label={`${w.name} を開く`}>
              <video src={w.video} poster={w.poster} muted loop playsInline preload="none" aria-label={`${w.name} のサイト画面`} />
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
