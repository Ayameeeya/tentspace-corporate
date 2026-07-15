import { create } from "zustand"

export type Quality = "high" | "low"

interface ScrollState {
  /** Normalized page scroll progress 0..1 */
  progress: number
  /** Lenis scroll velocity (px/frame-ish), used for adaptive pacing */
  velocity: number
  /** Active narrative chapter (0..5) */
  section: number
  /** prefers-reduced-motion */
  reducedMotion: boolean
  /** Device tier for particle counts / effects */
  quality: Quality
  setScroll: (progress: number, velocity: number) => void
  setReducedMotion: (v: boolean) => void
  setQuality: (q: Quality) => void
}

// Chapter thresholds: hero / CREATE / INNOVATE / TRANSFORM / OVERDRIVE / FINALE
export const SECTION_THRESHOLDS = [0.14, 0.32, 0.5, 0.68, 0.86]

export function sectionFromProgress(progress: number): number {
  for (let i = 0; i < SECTION_THRESHOLDS.length; i++) {
    if (progress < SECTION_THRESHOLDS[i]) return i
  }
  return SECTION_THRESHOLDS.length
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  velocity: 0,
  section: 0,
  reducedMotion: false,
  quality: "high",
  setScroll: (progress, velocity) =>
    set({ progress, velocity, section: sectionFromProgress(progress) }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setQuality: (quality) => set({ quality }),
}))
