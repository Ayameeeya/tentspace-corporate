"use client"

import { useEffect, useRef, useState } from "react"

const STOPS = [
  { id: "vision", label: "vision" },
  { id: "system", label: "system" },
  { id: "how-it-works", label: "how it works" },
  { id: "different", label: "different" },
  { id: "works", label: "works" },
  { id: "services", label: "services" },
]

type Stop = { id: string; label: string; frac: number; merge?: boolean }

/**
 * ページ全体を 1 本のブランチに見立てた固定レール（git log --graph）。
 * ヘッダーに代わるセクションナビでもある: ノードをクリックでジャンプ。
 * スクロールで線が伸び、通過したノード＝コミットが灯り、
 * 終端（フッター）でブランチが main にマージされる。
 * mix-blend-mode: difference で下のセクション色へ自動で反転適応する。
 */
export function CommitRail() {
  const railRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const [stops, setStops] = useState<Stop[]>([])

  // セクション位置の計測（レイアウト変化にも追従）
  useEffect(() => {
    const measure = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      if (docH <= 0) return
      const arr: Stop[] = []
      for (const s of STOPS) {
        const el = document.getElementById(s.id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        arr.push({ ...s, frac: Math.min(1, Math.max(0, (top - window.innerHeight * 0.4) / docH)) })
      }
      // 終端: フッターに入ったらブランチは main にマージされる
      const footer = document.querySelector<HTMLElement>(".mono-footer")
      if (footer) {
        const top = footer.getBoundingClientRect().top + window.scrollY
        arr.push({
          id: "__merge",
          label: "merged → main",
          frac: Math.min(1, Math.max(0, (top - window.innerHeight * 0.55) / docH)),
          merge: true,
        })
      }
      setStops(arr)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  // スクロール追従（再レンダーせず DOM を直接更新）
  useEffect(() => {
    const update = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      const p = docH > 0 ? Math.min(1, window.scrollY / docH) : 0
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`
      railRef.current?.querySelectorAll<HTMLElement>("[data-frac]").forEach((n) => {
        n.dataset.on = String(p >= parseFloat(n.dataset.frac || "0"))
      })
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [stops])

  const jumpTo = (id: string) => {
    const el = id === "__merge" ? document.querySelector<HTMLElement>(".mono-footer") : document.getElementById(id)
    if (!el) return
    const lenis = (window as any).__monoLenis
    const distance = Math.abs(el.getBoundingClientRect().top)
    const duration = Math.min(2.35, 0.72 + Math.pow(distance / window.innerHeight, 0.72) * 0.34)
    if (lenis) {
      lenis.scrollTo(el, {
        duration,
        easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      })
    } else {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav ref={railRef} className="mono-rail" aria-label="セクションナビゲーション">
      <div className="mono-rail__track" aria-hidden="true" />
      <div ref={fillRef} className="mono-rail__fill" aria-hidden="true" />
      {stops.map((s) => (
        <button
          key={s.id}
          type="button"
          className={s.merge ? "mono-rail__node mono-rail__node--merge" : "mono-rail__node"}
          data-frac={s.frac}
          style={{ top: `${s.frac * 100}%` }}
          onClick={() => jumpTo(s.id)}
          aria-label={s.merge ? "フッターへ" : `${s.label} セクションへ`}
        >
          <span className="mono-rail__label">{s.label}</span>
        </button>
      ))}
    </nav>
  )
}
