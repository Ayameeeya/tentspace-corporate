"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"

export function ContactForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "",
        {
          method: "POST",
          body: formData,
        }
      )

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
    <div className="rounded-2xl bg-white p-8 shadow-2xl md:p-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-bold text-slate-700"
            >
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="山田 太郎"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-bold text-slate-700"
            >
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="taro@example.com"
            />
          </div>
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-bold text-slate-700">
            会社名
          </label>
          <input
            type="text"
            id="company"
            name="company"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="株式会社Example"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-bold text-slate-700">
            電話番号
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="03-1234-5678"
          />
        </div>

        {/* Inquiry Type */}
        <div className="space-y-2">
          <label
            htmlFor="inquiry_type"
            className="text-sm font-bold text-slate-700"
          >
            お問い合わせ種別 <span className="text-red-500">*</span>
          </label>
          <select
            id="inquiry_type"
            name="inquiry_type"
            required
            disabled={isSubmitting}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">選択してください</option>
            <option value="ai-development">AI開発・導入のご相談</option>
            <option value="automation">業務自動化のご相談</option>
            <option value="n8n">n8n導入・構築サポート</option>
            <option value="system-development">
              システム開発のご相談
            </option>
            <option value="estimate">お見積もり依頼</option>
            <option value="other">その他</option>
          </select>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-sm font-bold text-slate-700"
          >
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            disabled={isSubmitting}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="新規サービスの開発について相談したい..."
          />
        </div>

        {/* Privacy Policy Notice */}
        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            お問い合わせいただいた内容は、
            <a
              href="/privacy"
              className="text-blue-600 underline hover:text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              プライバシーポリシー
            </a>
            に基づき適切に管理いたします。
          </p>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                送信中...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                送信する
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

