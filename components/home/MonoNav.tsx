"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { attachHoverScramble, scrambleIn } from "./scramble"
import { prefersReducedMotion, seededRandom } from "./gsap-setup"

export const NAV_SECTIONS = [
  { id: "vision", label: "vision" },
  { id: "system", label: "system" },
  { id: "how-it-works", label: "how it works" },
  { id: "services", label: "services" },
]

const MENU_ROWS = 6
const MENU_COLS = 4

export function MonoNav() {
  const navRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cellsRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const openTl = useRef<gsap.core.Timeline | null>(null)

  // scroll progress bar + active section tracking
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const st = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    })
    const sectionTriggers = NAV_SECTIONS.map((s) => {
      const el = document.getElementById(s.id)
      if (!el) return null
      return ScrollTrigger.create({
        trigger: el,
        start: "top 60px",
        end: "bottom 60px",
        onToggle: (self) => self.isActive && setActiveSection(s.id),
      })
    })
    return () => {
      st.kill()
      sectionTriggers.forEach((t) => t?.kill())
    }
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
    closeMenu()
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

  const openMenu = () => {
    setMenuOpen(true)
    requestAnimationFrame(() => {
      const cells = cellsRef.current?.children
      const links = linksRef.current?.querySelectorAll(".mono-menu__link-inner")
      if (!cells || !links) return
      const rand = seededRandom(1729)
      openTl.current?.kill()
      const tl = gsap.timeline()
      openTl.current = tl
      if (prefersReducedMotion()) {
        gsap.set(cells, { scaleY: 1 })
        gsap.set(links, { y: 0 })
        gsap.set(overlayRef.current, { autoAlpha: 0.24 })
        return
      }
      tl.to(overlayRef.current, { autoAlpha: 0.24, duration: 0.58, ease: "none" }, 0)
      tl.to(
        cells,
        {
          scaleY: 1,
          duration: 0.12,
          ease: "none",
          stagger: {
            amount: 0.46,
            from: "start",
            // bias top-down with mild randomness
            each: undefined,
          },
        },
        0,
      )
      // scatter: randomize order slightly by per-cell delay
      Array.from(cells).forEach((cell, i) => {
        const row = Math.floor(i / MENU_COLS)
        tl.set(cell, {}, 0) // keep in timeline
        gsap.to(cell, { scaleY: 1, duration: 0.12, ease: "none", delay: (row / MENU_ROWS) * 0.46 + rand() * 0.08 })
      })
      tl.fromTo(
        links,
        { y: "1.15em" },
        { y: 0, duration: 0.46, ease: "power3.out", stagger: 0.035 },
        0.12,
      )
      // scramble link texts in
      linksRef.current
        ?.querySelectorAll<HTMLElement>(".mono-menu__link-inner")
        .forEach((el, i) => {
          gsap.delayedCall(0.14 + i * 0.035, () => scrambleIn(el, "hover", 6))
        })
    })
  }

  const closeMenu = () => {
    const cells = cellsRef.current?.children
    const links = linksRef.current?.querySelectorAll(".mono-menu__link-inner")
    openTl.current?.kill()
    if (!cells || !links || prefersReducedMotion()) {
      setMenuOpen(false)
      return
    }
    const tl = gsap.timeline({ onComplete: () => setMenuOpen(false) })
    openTl.current = tl
    tl.to(links, { y: "1.15em", duration: 0.26, ease: "power3.in", stagger: { each: 0.028, from: "end" } }, 0)
    tl.to(cells, { scaleY: 0, duration: 0.1, ease: "none", stagger: { amount: 0.4, from: "end" } }, 0.1)
    tl.to(overlayRef.current, { autoAlpha: 0, duration: 0.24, ease: "none" }, 0.26)
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
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
            >
              <span />
              <span />
            </button>
            <Link href="/" className="mono-logo" aria-label="Home">
              {/* original brand logo; black/white variants swapped by nav theme */}
              <img src="/logo_black_yoko.png" alt="tent space" className="mono-logo__img mono-logo__img--dark" />
              <img src="/logo_white_yoko.png" alt="" aria-hidden="true" className="mono-logo__img mono-logo__img--light" />
            </Link>
          </div>
          <div className="mono-nav__progress">
            <div ref={barRef} className="mono-nav__progress-bar" />
            <div className="mono-nav__labels">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="mono-nav__label"
                  data-active={activeSection === s.id}
                  data-mono-hover
                  onClick={() => jumpTo(s.id)}
                >
                  <span className="paragraph-regular" data-mono-hover-target>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="mono-nav__docs">
            <Link href="/blog" className="paragraph-regular" data-mono-hover style={{ textDecoration: "none", color: "inherit" }}>
              <span data-mono-hover-target>[ blog ]</span>
            </Link>
          </div>
          <div className="mono-nav__signin">
            <Link href="/about" className="paragraph-regular mono-ul" data-mono-hover>
              <span data-mono-hover-target>about</span>
            </Link>
            <span className="paragraph-regular">/</span>
            <Link href="/contact" className="paragraph-regular mono-ul" data-mono-hover>
              <span data-mono-hover-target>contact</span>
            </Link>
          </div>
        </div>
        <div className="mono-nav__border" />
      </nav>

      <div ref={menuRef} className="mono-menu" data-open={menuOpen} aria-hidden={!menuOpen}>
        <div ref={overlayRef} className="mono-menu__overlay" />
        <div
          ref={cellsRef}
          className="mono-menu__grid"
          style={{
            gridTemplateRows: `repeat(${MENU_ROWS}, 1fr)`,
            gridTemplateColumns: `repeat(${MENU_COLS}, 1fr)`,
          }}
        >
          {Array.from({ length: MENU_ROWS * MENU_COLS }).map((_, i) => (
            <div key={i} className="mono-menu__cell" />
          ))}
        </div>
        <div className="mono-menu__content">
          <div ref={linksRef} className="mono-menu__links">
            {NAV_SECTIONS.map((s) => (
              <button key={s.id} type="button" className="mono-menu__link" onClick={() => jumpTo(s.id)}>
                <span className="mono-menu__link-inner">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="mono-menu__bottom">
            <div style={{ display: "flex", gap: "1.5em" }}>
              <a href="https://www.linkedin.com/in/hirokuma/" target="_blank" rel="noreferrer" className="paragraph-regular mono-ul">
                LinkedIn
              </a>
              <a href="https://x.com/hirokuma_negio" target="_blank" rel="noreferrer" className="paragraph-regular mono-ul">
                X
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
              <p className="paragraph-regular" style={{ margin: 0 }}>
                start a project
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
