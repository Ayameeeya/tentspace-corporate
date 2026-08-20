"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { MainBtn } from "@/components/home/MainBtn"

const INQUIRY_OPTIONS = [
  { value: "ai-development", label: "AI開発・導入のご相談" },
  { value: "automation", label: "業務自動化のご相談" },
  { value: "n8n", label: "n8n導入・構築サポート" },
  { value: "system-development", label: "システム開発のご相談" },
  { value: "estimate", label: "お見積もり依頼" },
  { value: "other", label: "その他" },
]

/** mono-styled dropdown: the open list matches the design system (the native
 *  select popup cannot be styled). Submits via a hidden input. */
function MonoSelect({
  id,
  name,
  options,
  placeholder,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string
  name: string
  options: { value: string; label: string }[]
  placeholder: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  error?: string | null
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={rootRef} className="mono-select">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        className="mono-field mono-select__btn"
        data-placeholder={!selected}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        {selected ? selected.label : placeholder}
      </button>
      {open && (
        <ul className="mono-select__list" role="listbox" aria-labelledby={id}>
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                className="mono-select__option"
                data-selected={o.value === value}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mono-select__error">{error}</p>}
    </div>
  )
}

export function ContactForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inquiryType, setInquiryType] = useState("")
  const [inquiryError, setInquiryError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inquiryType) {
      setInquiryError("お問い合わせ種別を選択してください")
      document.getElementById("inquiry_type")?.focus()
      return
    }
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        router.push("/contact/completed")
      } else {
        alert("送信に失敗しました。もう一度お試しください。")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("送信に失敗しました。もう一度お試しください。")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mono-form">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2em" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16em, 1fr))", gap: "2em" }}>
          <div>
            <label htmlFor="name">お名前 *</label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              required
              disabled={isSubmitting}
              className="mono-field"
              placeholder="山田 太郎"
            />
          </div>
          <div>
            <label htmlFor="email">メールアドレス *</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              spellCheck={false}
              required
              disabled={isSubmitting}
              className="mono-field"
              placeholder="taro@example.com"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16em, 1fr))", gap: "2em" }}>
          <div>
            <label htmlFor="company">会社名</label>
            <input
              type="text"
              id="company"
              name="company"
              autoComplete="organization"
              disabled={isSubmitting}
              className="mono-field"
              placeholder="株式会社Example"
            />
          </div>
          <div>
            <label htmlFor="phone">電話番号</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              disabled={isSubmitting}
              className="mono-field"
              placeholder="03-1234-5678"
            />
          </div>
        </div>

        <div>
          <label htmlFor="inquiry_type">お問い合わせ種別 *</label>
          <MonoSelect
            id="inquiry_type"
            name="inquiry_type"
            options={INQUIRY_OPTIONS}
            placeholder="選択してください"
            value={inquiryType}
            onChange={(v) => {
              setInquiryType(v)
              setInquiryError(null)
            }}
            disabled={isSubmitting}
            error={inquiryError}
          />
        </div>

        <div>
          <label htmlFor="message">お問い合わせ内容 *</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            disabled={isSubmitting}
            className="mono-field"
            placeholder="新規サービスの開発について相談したい..."
          />
        </div>

        <p className="paragraph-s opacity-64">
          お問い合わせいただいた内容は、
          <a href="/privacy" className="mono-ul mono-ul--static" target="_blank" rel="noopener noreferrer">
            プライバシーポリシー
          </a>
          に基づき適切に管理いたします。
        </p>

        <button type="submit" disabled={isSubmitting} className="mono-submit" style={{ alignSelf: "flex-end" }}>
          <MainBtn label={isSubmitting ? "sending..." : "send message"} variant="inside" twoLine />
        </button>
      </form>
    </div>
  )
}
