"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { attachHoverScramble } from "./scramble"
import { HeroVisual } from "./HeroVisual"

export function MonoFooter() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cleanups = Array.from(root.querySelectorAll<HTMLElement>("[data-mono-hover]")).map((el) =>
      attachHoverScramble(el, 3),
    )
    return () => cleanups.forEach((fn) => fn())
  }, [])

  // reaching the footer resets the nav theme to base; leaving back restores
  // whatever theme was active before (olive on the top page, base elsewhere)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let prevTheme = "base"
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 70%",
      onEnter: () => {
        const nav = document.querySelector<HTMLElement>("[data-mono-nav]")
        if (!nav) return
        prevTheme = nav.dataset.navTheme || "base"
        nav.dataset.navTheme = "base"
      },
      onLeaveBack: () => {
        const nav = document.querySelector<HTMLElement>("[data-mono-nav]")
        if (nav) nav.dataset.navTheme = prevTheme
      },
    })
    return () => st.kill()
  }, [])

  return (
    <footer ref={rootRef} className="mono-footer">
      <div className="mono-container">
        <div className="mono-footer__nav">
          <div className="mono-footer__statement">
            <p className="paragraph-m">
              “作って終わり、にしない。届けた後も、ともに育てていく。”
            </p>
            <div className="mono-footer__statement-author">
              <div className="mono-footer__statement-line" />
              <p className="paragraph-regular">tent space</p>
            </div>
          </div>
        </div>

        <div className="mono-footer__btm">
          <div className="mono-footer__social">
            <a href="https://www.linkedin.com/in/hirokuma/" target="_blank" rel="noreferrer" className="paragraph-m mono-ul" data-mono-hover>
              <span data-mono-hover-target>LinkedIn</span>
            </a>
            <a href="https://x.com/hirokuma_negio/" target="_blank" rel="noreferrer" className="paragraph-m mono-ul" data-mono-hover>
              <span data-mono-hover-target>X</span>
            </a>
            <a href="https://www.threads.com/@hirokumaxhiro/" target="_blank" rel="noreferrer" className="paragraph-m mono-ul" data-mono-hover>
              <span data-mono-hover-target>Threads</span>
            </a>
          </div>
          <div className="mono-footer__legals">
            <nav aria-label="フッターナビゲーション">
              <Link href="/terms" className="paragraph-regular mono-ul" data-mono-hover>
                <span data-mono-hover-target>Terms</span>
              </Link>
              <Link href="/privacy" className="paragraph-regular mono-ul" data-mono-hover>
                <span data-mono-hover-target>Privacy</span>
              </Link>
            </nav>
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
