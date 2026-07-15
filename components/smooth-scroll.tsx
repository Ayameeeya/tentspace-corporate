"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useScrollStore } from "@/lib/stores/scroll-store"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Lenis smooth scroll wired to the GSAP ticker (single rAF loop),
 * feeding normalized progress + velocity into the Zustand store so
 * that DOM (GSAP) and WebGL (R3F) share the same scroll timeline.
 */
export function SmoothScroll() {
  useEffect(() => {
    const store = useScrollStore.getState()

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    store.setReducedMotion(mq.matches)

    // Device tier: low-end mobiles get reduced particle counts
    const isCoarse = window.matchMedia("(pointer: coarse)").matches
    const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4
    store.setQuality(isCoarse || lowCpu ? "low" : "high")

    const updateFromNative = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      useScrollStore
        .getState()
        .setScroll(max > 0 ? Math.min(window.scrollY / max, 1) : 0, 0)
    }

    if (mq.matches) {
      // Reduced motion: no scroll smoothing, but keep progress in sync
      updateFromNative()
      window.addEventListener("scroll", updateFromNative, { passive: true })
      return () => window.removeEventListener("scroll", updateFromNative)
    }

    const lenis = new Lenis({ lerp: 0.1 })

    lenis.on("scroll", ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      ScrollTrigger.update()
      const max = document.documentElement.scrollHeight - window.innerHeight
      useScrollStore
        .getState()
        .setScroll(max > 0 ? Math.min(scroll / max, 1) : 0, velocity)
    })

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return null
}
