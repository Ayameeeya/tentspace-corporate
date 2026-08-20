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

type Stop = { id: string; label: string; frac: number }

/**
 * ページ全体を 1 本のブランチに見立てた固定レール（git log --graph）。
 * スクロールで線が伸び、セクションを通過するたびにノード＝コミットが灯る。
 * mix-blend-mode: difference で、下にあるセクション色へ自動で反転適応する。
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

  return (
    <div ref={railRef} className="mono-rail" aria-hidden="true">
      <div className="mono-rail__track" />
      <div ref={fillRef} className="mono-rail__fill" />
      {stops.map((s) => (
        <div key={s.id} className="mono-rail__node" data-frac={s.frac} style={{ top: `${s.frac * 100}%` }}>
          <span className="mono-rail__label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
