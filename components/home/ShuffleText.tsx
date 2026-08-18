"use client"

import { useEffect, useRef, type ElementType, type ReactNode, type Ref } from "react"
import { createElement } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { prefersReducedMotion } from "./gsap-setup"

/**
 * React Bits の Shuffle 相当: 文字ごとに幅でクリップした帯を作り、
 * 同じグリフの並びが横にスライドして定位置に揃う。odd/even の2群を
 * ずらして再生する（animationMode: "evenodd"）。1回だけスクロール発火。
 */
export function ShuffleText({
  as = "p",
  className,
  children,
  duration = 0.35,
  stagger = 0.03,
  shuffleTimes = 1,
  ease = "power3.out",
}: {
  as?: ElementType
  className?: string
  children: ReactNode
  duration?: number
  stagger?: number
  shuffleTimes?: number
  ease?: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return
    const original = el.textContent ?? ""
    if (!original) return

    // 文字ごとに span 化（スペースはそのままテキストノードに）
    el.textContent = ""
    const chars: HTMLElement[] = []
    for (const ch of original) {
      if (/\s/.test(ch)) {
        el.appendChild(document.createTextNode(ch))
        continue
      }
      const s = document.createElement("span")
      s.style.display = "inline-block"
      s.textContent = ch
      el.appendChild(s)
      chars.push(s)
    }

    // 各文字を overflow: hidden の枠で包み、同じグリフの帯を作る
    const rolls = Math.max(1, Math.floor(shuffleTimes))
    const strips: HTMLElement[] = []
    chars.forEach((ch) => {
      const w = ch.getBoundingClientRect().width
      if (!w || !ch.parentNode) return
      const wrap = document.createElement("span")
      Object.assign(wrap.style, {
        display: "inline-block",
        overflow: "hidden",
        width: `${w}px`,
        verticalAlign: "bottom",
      })
      const inner = document.createElement("span")
      Object.assign(inner.style, {
        display: "inline-block",
        whiteSpace: "nowrap",
        willChange: "transform",
      })
      ch.parentNode.insertBefore(wrap, ch)
      wrap.appendChild(inner)

      const cell = (node: HTMLElement) => {
        Object.assign(node.style, { display: "inline-block", width: `${w}px`, textAlign: "center" })
        return node
      }
      // 帯: [実体, コピー…, 末尾コピー]。開始位置は末尾コピーを表示しているので
      // 静止状態と見分けがつかず、発火時だけスライドが見える
      inner.appendChild(cell(ch))
      for (let k = 0; k < rolls + 1; k++) {
        const c = document.createElement("span")
        c.textContent = ch.textContent
        inner.appendChild(cell(c))
      }
      gsap.set(inner, { x: -(rolls + 1) * w, force3D: true })
      strips.push(inner)
    })

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        const odd = strips.filter((_, i) => i % 2 === 1)
        const even = strips.filter((_, i) => i % 2 === 0)
        const tl = gsap.timeline({
          onComplete: () => {
            el.textContent = original
          },
        })
        const oddTotal = duration + Math.max(0, odd.length - 1) * stagger
        if (odd.length) tl.to(odd, { x: 0, duration, ease, stagger, force3D: true }, 0)
        if (even.length) tl.to(even, { x: 0, duration, ease, stagger, force3D: true }, odd.length ? oddTotal * 0.7 : 0)
      },
    })

    return () => {
      st.kill()
      el.textContent = original
    }
  }, [duration, stagger, shuffleTimes, ease])

  // eslint-disable-next-line react-hooks/refs -- refオブジェクトを要素に渡すだけで、renderでは読まない
  return createElement(as, { ref: ref as Ref<never>, className }, children)
}
