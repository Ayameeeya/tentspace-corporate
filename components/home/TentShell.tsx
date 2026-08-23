"use client"

import "@/app/home.css"

import { useEffect, type ReactNode } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { prefersReducedMotion, setupGsap } from "./gsap-setup"
import { TentNav } from "./TentNav"
import { TentFooter } from "./TentFooter"

setupGsap()

/** 到達時にチカチカさせるセクション名（本文中のラベル） */
const FLICKER_TARGETS = [
  ".tent-chapter",
  ".tent-system__intro h2",
  ".tent-diff__head p",
  ".tent-pricing__head p",
].join(", ")

/**
 * Shared page shell for the layered-style design:
 * .tent-page scope + Lenis smooth scroll + nav + footer.
 */
export function TentShell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches
    const lenis = new Lenis({
      lerp: isTouch ? 1 : 0.14,
      wheelMultiplier: isTouch ? 1 : 1.25,
    })
    ;(window as any).__tentLenis = lenis
    lenis.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    ScrollTrigger.refresh()
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      delete (window as any).__tentLenis
    }
  }, [])

  // セクション名は到達した瞬間にチカチカと灯る（CRT 風の点灯）
  useEffect(() => {
    if (prefersReducedMotion()) return
    const targets = Array.from(document.querySelectorAll<HTMLElement>(FLICKER_TARGETS))
    if (targets.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          el.classList.add("tent-flicker")
          io.unobserve(el)
        })
      },
      { rootMargin: "-22% 0px -28% 0px" },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="tent-page">
      <TentNav />
      {children}
      {footer && <TentFooter />}
    </div>
  )
}
