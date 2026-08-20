"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { attachHoverScramble } from "./scramble"
import { MonoMenu, type MonoMenuEntry } from "./MonoMenu"

export const NAV_SECTIONS = [
  { id: "vision", label: "vision" },
  { id: "system", label: "system" },
  { id: "how-it-works", label: "how it works" },
  { id: "services", label: "services" },
]

export const MENU_ENTRIES: MonoMenuEntry[] = [
  { type: "link", href: "/about", label: "about" },
  ...NAV_SECTIONS.map((s): MonoMenuEntry => ({ type: "jump", id: s.id, label: s.label })),
  { type: "link", href: "/blog", label: "blog" },
  { type: "link", href: "/contact", label: "contact" },
]

export function MonoNav() {
  const navRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // scroll progress bar
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const st = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    })
    return () => st.kill()
  }, [])

  // hover scramble on nav links
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const cleanups = Array.from(nav.querySelectorAll<HTMLElement>("[data-mono-hover]")).map((el) =>
      attachHoverScramble(el, 3),
    )
    return () => cleanups.forEach((fn) => fn())
  }, [])

  const jumpTo = (id: string) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (!el) {
      // section lives on the top page — navigate there
      window.location.href = `/#${id}`
      return
    }
    const lenis = (window as any).__monoLenis
    const distance = Math.abs(el.getBoundingClientRect().top)
    const duration = Math.min(2.35, 0.72 + Math.pow(distance / window.innerHeight, 0.72) * 0.34)
    if (lenis) lenis.scrollTo(el, { duration, easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) })
    else el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <nav ref={navRef} className="mono-nav" data-nav-theme="base" data-mono-nav>
        <div className="mono-nav__main">
          <div className="mono-nav__left">
            <button
              type="button"
              className="mono-menu-btn"
              aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
            </button>
            <Link href="/" className="mono-logo" aria-label="Home">
              {/* symbol mark; black/white variants swapped by nav theme */}
              <img src="/logo_black_symbol.png" alt="tent space" className="mono-logo__img mono-logo__img--dark" />
              <img src="/logo_white_symbol.png" alt="" aria-hidden="true" className="mono-logo__img mono-logo__img--light" />
            </Link>
          </div>
          {/* セクションリンクはコミットレールへ移管。バーは進捗ラインのみ */}
          <div className="mono-nav__progress">
            <div ref={barRef} className="mono-nav__progress-bar" />
          </div>
          <div className="mono-nav__docs">
            <Link href="/blog" className="paragraph-regular" data-mono-hover style={{ textDecoration: "none", color: "inherit" }}>
              <span data-mono-hover-target>[ blog ]</span>
            </Link>
          </div>
          <div className="mono-nav__signin">
            <Link href="/contact" className="paragraph-regular mono-ul" data-mono-hover>
              <span data-mono-hover-target>contact</span>
            </Link>
          </div>
        </div>
        <div className="mono-nav__border" />
      </nav>

      <MonoMenu
        open={menuOpen}
        entries={MENU_ENTRIES}
        onClose={() => setMenuOpen(false)}
        onJump={jumpTo}
      />
    </>
  )
}
