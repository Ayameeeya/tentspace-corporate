"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { attachHoverScramble } from "./scramble"
import { HeroVisual } from "./HeroVisual"
import { NAV_SECTIONS } from "./MonoNav"

const NEWS_LINKS = [
  { href: "/blog", label: "all posts" },
  { href: "/about", label: "about tent space" },
]

function Cropmark() {
  return (
    <svg viewBox="0 0 6 6" aria-hidden="true">
      <path d="M0.5 5.5V0.5H4.5H5.5" stroke="currentColor" fill="none" />
    </svg>
  )
}

export function MonoFooter() {
  const rootRef = useRef<HTMLElement>(null)
  const [tab, setTab] = useState<"product" | "news">("product")

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cleanups = Array.from(root.querySelectorAll<HTMLElement>("[data-mono-hover]")).map((el) =>
      attachHoverScramble(el, 3),
    )
    return () => cleanups.forEach((fn) => fn())
  }, [tab])

  // reaching the footer resets the nav theme to base
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 70%",
      onEnter: () => {
        const nav = document.querySelector<HTMLElement>("[data-mono-nav]")
        if (nav) nav.dataset.navTheme = "base"
      },
      onLeaveBack: () => {
        const nav = document.querySelector<HTMLElement>("[data-mono-nav]")
        if (nav) nav.dataset.navTheme = "olive"
      },
    })
    return () => st.kill()
  }, [])

  const jumpTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) {
      window.location.href = `/#${id}`
      return
    }
    const lenis = (window as any).__monoLenis
    if (lenis) lenis.scrollTo(el, { duration: 1.4 })
    else el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <footer ref={rootRef} className="mono-footer">
      <div className="mono-container">
        <div className="mono-footer__nav">
          <div className="mono-footer__statement">
            <p className="paragraph-m">
              “作って終わり、にしない。設計から運用まで、動き続けるソフトウェアを届ける。”
            </p>
            <div className="mono-footer__statement-author">
              <div className="mono-footer__statement-line" />
              <p className="paragraph-regular">tent space</p>
            </div>
          </div>

          <div className="mono-footer__tabs">
            {(["product", "news"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className="mono-tab paragraph-regular"
                data-active={tab === t}
                onClick={() => setTab(t)}
              >
                {tab === t && (
                  <span className="mono-cropmarks" style={{ inset: 0 }}>
                    <Cropmark />
                    <Cropmark />
                    <Cropmark />
                    <Cropmark />
                  </span>
                )}
                [ {t} ]
              </button>
            ))}
          </div>

          <nav className="mono-footer__links" aria-label="フッターナビゲーション">
            {tab === "product"
              ? NAV_SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="mono-footer__link paragraph-m"
                    data-mono-hover
                    onClick={() => jumpTo(s.id)}
                  >
                    <span data-mono-hover-target>{s.label}</span>
                  </button>
                ))
              : NEWS_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="mono-footer__link paragraph-m" data-mono-hover>
                    <span data-mono-hover-target>{l.label}</span>
                  </Link>
                ))}
          </nav>
        </div>

        <div className="mono-footer__btm">
          <div className="mono-footer__social">
            <a href="https://www.linkedin.com/company/tentspace" target="_blank" rel="noreferrer" className="paragraph-m mono-ul" data-mono-hover>
              <span data-mono-hover-target>LinkedIn</span>
            </a>
            <a href="https://x.com/" target="_blank" rel="noreferrer" className="paragraph-m mono-ul" data-mono-hover>
              <span data-mono-hover-target>X</span>
            </a>
          </div>
          <div className="mono-footer__legals">
            <Link href="/terms" className="paragraph-regular mono-ul" data-mono-hover>
              <span data-mono-hover-target>Terms</span>
            </Link>
            <Link href="/privacy" className="paragraph-regular mono-ul" data-mono-hover>
              <span data-mono-hover-target>Privacy</span>
            </Link>
            <p className="paragraph-regular" style={{ opacity: 0.64 }}>
              © 2026, tent space Inc.
            </p>
          </div>
          <div className="mono-footer__made">
            <p className="paragraph-regular" style={{ opacity: 0.64 }}>
              Made in Izu, Japan
            </p>
          </div>
        </div>
      </div>
      <div className="mono-footer__visual" aria-hidden="true">
        <HeroVisual />
      </div>
      <div className="mono-footer__logo-wrap">
        <Link href="/" className="mono-footer__logo" aria-label="Home">
          tent␣
        </Link>
      </div>
    </footer>
  )
}
