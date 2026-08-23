"use client"

import gsap from "gsap"

/**
 * Word-level text scramble engine (layered-style).
 * Splits text into word spans; a chosen subset of characters in each word
 * shuffles among the word's own letters while unrevealed, then reveals
 * left-to-right as a gsap tween drives progress 0 -> 1.
 *
 * CJK text has no spaces, so long CJK runs are chunked into 3-char segments
 * that behave like words.
 */

type Mode = "load" | "scroll" | "hover"

const MODE_CONFIG: Record<Mode, { duration: number; staggerMin: number; staggerMax: number; intervalMin: number; intervalMax: number }> = {
  load: { duration: 1.45, staggerMin: 0.002, staggerMax: 0.024, intervalMin: 110, intervalMax: 26 },
  scroll: { duration: 1.65, staggerMin: 0.003, staggerMax: 0.03, intervalMin: 110, intervalMax: 26 },
  hover: { duration: 0.9, staggerMin: 0.002, staggerMax: 0.026, intervalMin: 95, intervalMax: 24 },
}

const RATIO_BY_INTENSITY = [0.4, 0.4, 0.6, 0.6, 0.75, 0.75, 0.9, 0.9, 1, 1]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function isScrambleChar(ch: string) {
  return /[0-9A-Za-zぁ-んァ-ヶ一-龠々ー]/.test(ch)
}

function segmentText(text: string): string[] {
  const out: string[] = []
  for (const word of text.split(/(\s+)/)) {
    if (!word) continue
    if (/^\s+$/.test(word)) {
      out.push(word)
      continue
    }
    // chunk long CJK runs so each behaves like a word
    if (/[ぁ-んァ-ヶ一-龠]/.test(word) && word.length > 4) {
      for (let i = 0; i < word.length; i += 3) out.push(word.slice(i, i + 3))
    } else {
      out.push(word)
    }
  }
  return out
}

interface WordPlan {
  el: HTMLElement
  original: string
  chars: string[]
  selected: number[]
  progress: number
}

function buildPlans(root: HTMLElement, intensity: number): WordPlan[] {
  const text = root.dataset.tentOriginal ?? root.textContent ?? ""
  root.dataset.tentOriginal = text
  const segments = segmentText(text)
  root.textContent = ""
  const plans: WordPlan[] = []
  const ratio = RATIO_BY_INTENSITY[Math.min(9, Math.max(0, Math.round(intensity) - 1))]

  for (const seg of segments) {
    if (/^\s+$/.test(seg)) {
      root.appendChild(document.createTextNode(seg))
      continue
    }
    const span = document.createElement("span")
    span.style.whiteSpace = "pre-wrap"
    span.textContent = seg
    root.appendChild(span)
    const chars = seg.split("")
    const candidates = chars.map((c, i) => (isScrambleChar(c) ? i : -1)).filter((i) => i >= 0)
    // distributed subset selection by ratio
    const count = Math.max(candidates.length > 0 ? 1 : 0, Math.round(candidates.length * ratio))
    const step = candidates.length / Math.max(1, count)
    const selected: number[] = []
    for (let k = 0; k < count; k++) selected.push(candidates[Math.min(candidates.length - 1, Math.floor(k * step))])
    plans.push({ el: span, original: seg, chars, selected, progress: 0 })
  }
  return plans
}

function renderPlan(plan: WordPlan) {
  const { chars, selected, progress } = plan
  if (selected.length === 0 || progress >= 1) {
    plan.el.textContent = plan.original
    return
  }
  const revealCount = Math.floor(progress * selected.length)
  const unrevealed = selected.slice(revealCount)
  if (unrevealed.length === 0) {
    plan.el.textContent = plan.original
    return
  }
  // shuffle the unrevealed slots among the word's own characters
  const pool = unrevealed.map((i) => chars[i])
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const out = chars.slice()
  unrevealed.forEach((idx, k) => (out[idx] = pool[k]))
  plan.el.textContent = out.join("")
}

export function scrambleIn(root: HTMLElement, mode: Exclude<Mode, "hover"> | "hover" = "scroll", intensity = 5): gsap.core.Timeline {
  const cfg = MODE_CONFIG[mode]
  const t = (Math.min(10, Math.max(1, intensity)) - 1) / 9
  const stagger = lerp(cfg.staggerMin, cfg.staggerMax, t)
  const interval = lerp(cfg.intervalMin, cfg.intervalMax, t)
  const plans = buildPlans(root, intensity)
  const tl = gsap.timeline({
    onComplete: () => {
      plans.forEach((p) => (p.el.textContent = p.original))
    },
  })
  plans.forEach((plan, i) => {
    let last = 0
    const proxy = { p: 0 }
    tl.to(
      proxy,
      {
        p: 1,
        duration: cfg.duration,
        ease: "none",
        onUpdate: () => {
          plan.progress = proxy.p
          const now = performance.now()
          if (now - last >= interval || proxy.p >= 1) {
            last = now
            renderPlan(plan)
          }
        },
      },
      i * stagger,
    )
  })
  return tl
}

/** Attach hover scramble to a link wrapper; the [data-tent-hover-target] inside scrambles. */
export function attachHoverScramble(link: HTMLElement, intensity = 3) {
  let active: gsap.core.Timeline | null = null
  const onEnter = (e: Event) => {
    // マウス押下でもfocusinは発火する。ここでDOMを組み替えるとmousedownと
    // mouseupの間に押下ノードが切り離されclickが失われるため、
    // キーボード由来のフォーカスに限って再生する。
    if (e.type === "focusin" && !link.matches(":focus-visible")) return
    const target = link.querySelector<HTMLElement>("[data-tent-hover-target]") ?? link
    active?.kill()
    if (target.dataset.tentOriginal) target.textContent = target.dataset.tentOriginal
    active = scrambleIn(target, "hover", intensity)
  }
  const onLeave = () => {
    const target = link.querySelector<HTMLElement>("[data-tent-hover-target]") ?? link
    active?.kill()
    active = null
    if (target.dataset.tentOriginal) target.textContent = target.dataset.tentOriginal
  }
  link.addEventListener("mouseenter", onEnter)
  link.addEventListener("focusin", onEnter)
  link.addEventListener("mouseleave", onLeave)
  link.addEventListener("focusout", onLeave)
  return () => {
    active?.kill()
    link.removeEventListener("mouseenter", onEnter)
    link.removeEventListener("focusin", onEnter)
    link.removeEventListener("mouseleave", onLeave)
    link.removeEventListener("focusout", onLeave)
  }
}

/**
 * Scrub-driven morph between two strings (the "different" section).
 * setProgress(p): 0 -> shows `before`, 1 -> shows `after`; between, characters
 * scramble-blend from one to the other, revealing left to right.
 */
export function createTextMorph(el: HTMLElement, before: string, after: string) {
  const maxLen = Math.max(before.length, after.length)
  const pad = (s: string) => s.padEnd(maxLen, " ")
  const a = pad(before)
  const b = pad(after)
  let last = -1
  return (progress: number) => {
    const p = Math.min(1, Math.max(0, progress))
    if (p === last) return
    last = p
    if (p <= 0) {
      el.textContent = before
      return
    }
    if (p >= 1) {
      el.textContent = after
      return
    }
    const boundary = Math.floor(p * maxLen)
    const band = Math.max(2, Math.floor(maxLen * 0.14))
    let out = ""
    for (let i = 0; i < maxLen; i++) {
      if (i < boundary) out += b[i]
      else if (i < boundary + band) {
        // scramble band: borrow chars from both strings
        const src = Math.random() > 0.5 ? a : b
        out += src[Math.floor(Math.random() * maxLen)]
      } else out += a[i]
    }
    el.textContent = out.replace(/\s+$/, "")
  }
}
