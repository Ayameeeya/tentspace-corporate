"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainBtn } from "@/components/home/MainBtn"

export function ContactForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
          <select id="inquiry_type" name="inquiry_type" required disabled={isSubmitting} className="mono-field">
            <option value="">選択してください</option>
            <option value="ai-development">AI開発・導入のご相談</option>
            <option value="automation">業務自動化のご相談</option>
            <option value="n8n">n8n導入・構築サポート</option>
            <option value="system-development">システム開発のご相談</option>
            <option value="estimate">お見積もり依頼</option>
            <option value="other">その他</option>
          </select>
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
          <MainBtn label={isSubmitting ? "sending..." : "send message"} variant="inside" />
        </button>
      </form>
    </div>
  )
}
