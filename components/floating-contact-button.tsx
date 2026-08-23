"use client"

import "@/app/home.css"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { PixelArrow } from "@/components/home/MainBtn"
import { attachHoverScramble } from "@/components/home/scramble"

/**
 * フローティングCTA（tent様式）:
 * 白地ヘアライン枠のラベル + インディゴ正方形のピクセル矢印。
 * ホバーでラベルがスクランブル、矢印は plop。最小化すると矢印箱のみ残る。
 */
export function FloatingContactButton({ label = "お問い合わせ" }: { label?: string }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [visible, setVisible] = useState(false)
  const linkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!linkRef.current || !isExpanded) return
    return attachHoverScramble(linkRef.current, 3)
  }, [isExpanded])

  return (
    <div className="tent-float" data-visible={visible}>
      {isExpanded ? (
        <>
          <Link ref={linkRef} href="/contact" className="tent-float__link" aria-label={`${label} - お問い合わせページへ`} data-tent-hover>
            <span className="tent-float__label" data-tent-hover-target>
              {label}
            </span>
            <span className="tent-float__box">
              <PixelArrow />
            </span>
          </Link>
          <button type="button" className="tent-float__close" onClick={() => setIsExpanded(false)} aria-label="最小化">
            ×
          </button>
        </>
      ) : (
        <Link href="/contact" className="tent-float__box" aria-label="お問い合わせページへ" style={{ textDecoration: "none" }}>
          <PixelArrow />
        </Link>
      )}
    </div>
  )
}
