"use client"

import "@/app/home.css"

import { useEffect, type ReactNode } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { setupGsap } from "./gsap-setup"
import { MonoNav } from "./MonoNav"
import { MonoFooter } from "./MonoFooter"

setupGsap()

/**
 * Shared page shell for the monolayer-style design:
 * .mono-page scope + Lenis smooth scroll + nav + footer.
 */
export function MonoShell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches
    const lenis = new Lenis({
      lerp: isTouch ? 1 : 0.14,
      wheelMultiplier: isTouch ? 1 : 1.25,
    })
    ;(window as any).__monoLenis = lenis
    lenis.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    ScrollTrigger.refresh()
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      delete (window as any).__monoLenis
    }
  }, [])

  return (
    <div className="mono-page">
      <MonoNav />
      {children}
      {footer && <MonoFooter />}
    </div>
  )
}
