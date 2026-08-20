"use client"

import { useEffect, useRef } from "react"
import { attachHoverScramble } from "./scramble"

/** 14x14 pixel arrow (diagonal with head), drawn as 2x2 rects. */
const ARROW_CELLS: [number, number][] = [
  [2, 10],
  [4, 8],
  [6, 6],
  [8, 4],
  [4, 2], [6, 2], [8, 2], [10, 2],
  [10, 4], [10, 6], [10, 8],
  [0, 12],
]

export function PixelArrow() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true">
      {ARROW_CELLS.map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={2}
          height={2}
          fill="currentColor"
          style={{ ["--plop-delay" as string]: `${0.01 + (i % 8) * 0.009}s` }}
        />
      ))}
    </svg>
  )
}

function twoLineLabel(label: string) {
  const i = label.lastIndexOf(" ")
  if (i < 0) return label
  return `${label.slice(0, i)}\n${label.slice(i + 1)}`
}

export function MainBtn({
  label,
  href,
  variant = "outside",
  twoLine = false,
}: {
  label: string
  href?: string
  variant?: "outside" | "inside"
  /** wrap the label onto two lines like the sticky hero CTA (outside is always two-line) */
  twoLine?: boolean
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    return attachHoverScramble(ref.current, 3)
  }, [])

  const wrapLabel = variant === "outside" || twoLine

  const inner = (
    <>
      <p
        className="main-btn__text"
        data-mono-hover-target
        style={twoLine ? { whiteSpace: "pre-line" } : undefined}
      >
        {wrapLabel ? twoLineLabel(label) : label}
      </p>
      <div className="main-btn__wrap">
        <div className="main-btn__line" />
        <div className="main-btn__box">
          <div className="main-btn__arrow">
            <PixelArrow />
          </div>
        </div>
        <div className="main-btn__line" />
      </div>
    </>
  )

  if (!href) {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={`main-btn main-btn--${variant}`}>
        {inner}
      </span>
    )
  }
  return (
    <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={`main-btn main-btn--${variant}`}>
      {inner}
    </a>
  )
}
