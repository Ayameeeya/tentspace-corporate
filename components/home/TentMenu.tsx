"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { scrambleIn } from "./scramble"
import { prefersReducedMotion, seededRandom } from "./gsap-setup"

const MENU_ROWS = 6
const MENU_COLS = 4

export type TentMenuEntry =
  | { type: "link"; href: string; label: string }
  | { type: "jump"; id: string; label: string }

/**
 * Fullscreen tent menu (cell shutter + link scramble), shared by the top nav
 * and the blog nav. The parent owns the `open` state; this component runs the
 * open/close animations and unmounts itself after the close animation ends.
 * Render it inside a `.tent-page` scope so the em scale applies.
 */
export function TentMenu({
  open,
  entries,
  onClose,
  onJump,
}: {
  open: boolean
  entries: TentMenuEntry[]
  onClose: () => void
  onJump?: (id: string) => void
}) {
  const [mounted, setMounted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cellsRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => {
        const cells = cellsRef.current?.children
        const links = linksRef.current?.querySelectorAll(".tent-menu__link-inner")
        if (!cells || !links) return
        const rand = seededRandom(1729)
        tlRef.current?.kill()
        const tl = gsap.timeline()
        tlRef.current = tl
        if (prefersReducedMotion()) {
          gsap.set(cells, { scaleY: 1 })
          gsap.set(links, { y: 0 })
          gsap.set(overlayRef.current, { autoAlpha: 0.24 })
          return
        }
        tl.to(overlayRef.current, { autoAlpha: 0.24, duration: 0.58, ease: "none" }, 0)
        Array.from(cells).forEach((cell, i) => {
          const row = Math.floor(i / MENU_COLS)
          gsap.to(cell, { scaleY: 1, duration: 0.12, ease: "none", delay: (row / MENU_ROWS) * 0.46 + rand() * 0.08 })
        })
        tl.fromTo(
          links,
          { y: "1.15em" },
          { y: 0, duration: 0.46, ease: "power3.out", stagger: 0.035 },
          0.12,
        )
        linksRef.current
          ?.querySelectorAll<HTMLElement>(".tent-menu__link-inner")
          .forEach((el, i) => {
            gsap.delayedCall(0.14 + i * 0.035, () => scrambleIn(el, "hover", 6))
          })
      })
    } else if (mounted) {
      const cells = cellsRef.current?.children
      const links = linksRef.current?.querySelectorAll(".tent-menu__link-inner")
      tlRef.current?.kill()
      if (!cells || !links || prefersReducedMotion()) {
        setMounted(false)
        return
      }
      const tl = gsap.timeline({ onComplete: () => setMounted(false) })
      tlRef.current = tl
      tl.to(links, { y: "1.15em", duration: 0.26, ease: "power3.in", stagger: { each: 0.028, from: "end" } }, 0)
      tl.to(cells, { scaleY: 0, duration: 0.1, ease: "none", stagger: { amount: 0.4, from: "end" } }, 0.1)
      tl.to(overlayRef.current, { autoAlpha: 0, duration: 0.24, ease: "none" }, 0.26)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    return () => {
      tlRef.current?.kill()
    }
  }, [])

  return (
    <div className="tent-menu" data-open={mounted} aria-hidden={!mounted}>
      <div ref={overlayRef} className="tent-menu__overlay" />
      <div
        ref={cellsRef}
        className="tent-menu__grid"
        style={{
          gridTemplateRows: `repeat(${MENU_ROWS}, 1fr)`,
          gridTemplateColumns: `repeat(${MENU_COLS}, 1fr)`,
        }}
      >
        {Array.from({ length: MENU_ROWS * MENU_COLS }).map((_, i) => (
          <div key={i} className="tent-menu__cell" />
        ))}
      </div>
      <div className="tent-menu__content">
        <div ref={linksRef} className="tent-menu__links">
          {entries.map((e) =>
            e.type === "link" ? (
              <Link key={e.label} href={e.href} prefetch={false} className="tent-menu__link" onClick={onClose}>
                <span className="tent-menu__link-inner">{e.label}</span>
              </Link>
            ) : (
              <button
                key={e.label}
                type="button"
                className="tent-menu__link"
                onClick={() => {
                  if (onJump) onJump(e.id)
                  else {
                    onClose()
                    window.location.href = `/#${e.id}`
                  }
                }}
              >
                <span className="tent-menu__link-inner">{e.label}</span>
              </button>
            ),
          )}
        </div>
        <div className="tent-menu__bottom">
          <div style={{ display: "flex", gap: "1.5em" }}>
            <a href="https://www.linkedin.com/in/hirokuma/" target="_blank" rel="noreferrer" className="paragraph-regular tent-ul">
              LinkedIn
            </a>
            <a href="https://x.com/hirokuma_negio/" target="_blank" rel="noreferrer" className="paragraph-regular tent-ul">
              X
            </a>
            <a href="https://www.threads.com/@hirokumaxhiro/" target="_blank" rel="noreferrer" className="paragraph-regular tent-ul">
              Threads
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
            <Link
              href="/contact"
              prefetch={false}
              className="paragraph-regular tent-ul"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={onClose}
            >
              start a project
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
