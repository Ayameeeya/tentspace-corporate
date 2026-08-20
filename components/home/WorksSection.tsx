"use client"

import { useEffect, useRef } from "react"
import { ScrambleText } from "./ScrambleText"
import { attachHoverScramble } from "./scramble"
import { prefersReducedMotion } from "./gsap-setup"

type Work = {
  num: string
  name: string
  url: string
  video: string
  poster: string
  desc: string
  tags: string[]
  /** タイトルのスクランブル演出を使わない */
  plainTitle?: boolean
}

const WORKS: Work[] = [
  {
    num: "01",
    name: "3Dasset",
    url: "https://3dasset.io/",
    video: "/works/3dasset.mp4",
    poster: "/works/3dasset.jpg?v=6",
    desc: "3Dアセットマーケットプレイス『3Dasset』のデザインおよび開発・保守運用を、tent space が担当しています。",
    tags: ["design", "build", "maintenance", "three.js"],
  },
  {
    num: "02",
    name: "TOKYO EPIC",
    url: "https://www.tokyo-epic.com/",
    video: "/works/tokyo-epic.mp4",
    poster: "/works/tokyo-epic.jpg?v=2",
    desc: "アニメーションIPスタジオ『TOKYO EPIC』のコーポレートサイトの制作を、tent space が行いました。",
    tags: ["design", "build", "maintenance"],
  },
  {
    num: "03",
    name: "MATCHA SELECT SHOP",
    url: "https://matcha-select.com/",
    video: "/works/matcha-select.mp4?v=2",
    poster: "/works/matcha-select.jpg",
    desc: "抹茶と茶道具のオンラインストア『抹茶セレクトショップ』のデザインと Shopify スクラッチ構築を、tent space が担当しました。",
    tags: ["design", "build", "shopify"],
    plainTitle: true,
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

    // hover devices: screenshot by default, the video fades in and plays on
    // hover. touch devices: play while on screen (as before). never animate
    // with reduced motion
    const reduced = prefersReducedMotion()
    const hoverable = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const extra: (() => void)[] = []

    if (hoverable) {
      root.querySelectorAll<HTMLElement>(".mono-works__shot").forEach((shot) => {
        const video = shot.querySelector("video")
        if (!video) return
        const enter = () => {
          if (!reduced) video.play().catch(() => {})
        }
        const leave = () => {
          video.pause()
          video.currentTime = 0
        }
        shot.addEventListener("mouseenter", enter)
        shot.addEventListener("mouseleave", leave)
        extra.push(() => {
          shot.removeEventListener("mouseenter", enter)
          shot.removeEventListener("mouseleave", leave)
        })
      })
    } else {
      const videos = Array.from(root.querySelectorAll<HTMLVideoElement>("video"))
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
      extra.push(() => io.disconnect())
    }

    return () => {
      cleanups.forEach((fn) => fn())
      extra.forEach((fn) => fn())
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
              {w.plainTitle ? (
                <h3 className="heading-s">{w.name}</h3>
              ) : (
                <ScrambleText as="h3" className="heading-s">
                  {w.name}
                </ScrambleText>
              )}
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
            <div className="mono-works__shot">
              {/* 固有寸法でレイアウトを先に確定させる（遅延読込によるずれ防止） */}
              <img src={w.poster} alt={`${w.name} のサイト画面`} loading="lazy" width={1120} height={700} />
              <video src={w.video} muted loop playsInline preload="none" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
