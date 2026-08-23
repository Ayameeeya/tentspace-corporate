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

/** ヘッダーのシーケンスバー: ページの全セクションをステップとして並べる */
const SEQ_SECTIONS = [
  { id: "vision", label: "vision" },
  { id: "system", label: "system" },
  { id: "how-it-works", label: "how it works" },
  { id: "different", label: "different" },
  { id: "works", label: "works" },
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
  const seqRef = useRef<HTMLDivElement>(null)
  const [steps, setSteps] = useState<{ id: string; label: string; frac: number; row: number }[]>([])

  // 各セクションのスクロール進捗上の位置を測る（= バー上のステップ位置）
  useEffect(() => {
    const measure = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      if (docH <= 0) return
      const measured = SEQ_SECTIONS.flatMap((s) => {
        const el = document.getElementById(s.id)
        if (!el) return []
        const top = el.getBoundingClientRect().top + window.scrollY
        const frac = Math.min(0.985, Math.max(0.015, (top - window.innerHeight * 0.4) / docH))
        return [{ ...s, frac }]
      })
      // ラベルが近すぎるステップは 2 段目に落として重なりを避ける
      const nav = document.querySelector<HTMLElement>(".mono-nav")
      const em = nav ? parseFloat(getComputedStyle(nav).fontSize) : 12
      let lastRight = -Infinity
      setSteps(
        measured.map((s) => {
          const x = s.frac * window.innerWidth
          const half = (s.label.length * 0.42 * em + em) / 2
          const row = x - half < lastRight ? 1 : 0
          if (row === 0) lastRight = x + half
          return { ...s, row }
        }),
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  // scroll progress bar + バー上のステップ点灯（進捗ラインが到達したら灯る）
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const st = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress })
        const nodes = seqRef.current?.querySelectorAll<HTMLElement>("[data-frac]")
        if (!nodes) return
        let active = -1
        nodes.forEach((n, i) => {
          const on = self.progress >= parseFloat(n.dataset.frac || "1")
          n.dataset.on = String(on)
          if (on) active = i
        })
        nodes.forEach((n, i) => {
          n.dataset.active = String(i === active)
        })
      },
    })
    return () => st.kill()
  }, [steps])

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
            <Link href="/" className="mono-logo" aria-label="Home">
              {/* symbol mark; black/white variants swapped by nav theme */}
              <img src="/logo_black_symbol.png" alt="tent space" className="mono-logo__img mono-logo__img--dark" />
              <img src="/logo_white_symbol.png" alt="" aria-hidden="true" className="mono-logo__img mono-logo__img--light" />
            </Link>
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
        </div>
        <div ref={barRef} className="mono-nav__progress-bar" />
        {/* シーケンスバー: 進捗ライン上に乗るセクションのステップ */}
        <div ref={seqRef} className="mono-nav__seq" role="navigation" aria-label="セクションナビゲーション">
          {steps.map((s) => (
            <button
              key={s.id}
              type="button"
              className="mono-nav__step"
              data-frac={s.frac}
              data-row={s.row}
              style={{ left: `${s.frac * 100}%` }}
              onClick={() => jumpTo(s.id)}
              aria-label={`${s.label} セクションへ`}
            >
              <span className="mono-nav__step-label">{s.label}</span>
            </button>
          ))}
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
