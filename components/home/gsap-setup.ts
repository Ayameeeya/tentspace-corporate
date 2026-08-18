"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CustomEase } from "gsap/CustomEase"

let registered = false

export function setupGsap() {
  if (registered || typeof window === "undefined") return
  registered = true
  gsap.registerPlugin(ScrollTrigger, CustomEase)
  CustomEase.create("mainEase", "0.625, 0.05, 0, 1")
  CustomEase.create("systemEaseOut", "0.215, 0.61, 0.355, 1")
  CustomEase.create("systemChapterPop", "0.34, 1.12, 0.64, 1")
  CustomEase.create("systemSequenceThree", "0.76, 0, 0.24, 1")
  gsap.defaults({ ease: "mainEase", duration: 0.6 })
}

/** Seeded PRNG (Lehmer 16807) for deterministic shutter randomness. */
export function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
