"use client"

import { createElement, useEffect, useRef, type ElementType, type ReactNode, type Ref } from "react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { scrambleIn } from "./scramble"
import { prefersReducedMotion } from "./gsap-setup"

/**
 * Text block that scrambles in — on page load or once when scrolled into view.
 */
export function ScrambleText({
  as = "p",
  mode = "scroll",
  intensity = 5,
  className,
  children,
}: {
  as?: ElementType
  mode?: "load" | "scroll"
  intensity?: number
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return

    if (mode === "load") {
      const tl = scrambleIn(el, "load", intensity)
      return () => tl.kill()
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      once: true,
      onEnter: () => scrambleIn(el, "scroll", intensity),
    })
    return () => st.kill()
  }, [mode, intensity])

  // eslint-disable-next-line react-hooks/refs -- refオブジェクトを要素に渡すだけで、renderでは読まない
  return createElement(as, { ref: ref as Ref<never>, className }, children)
}
