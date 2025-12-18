import { Send } from "lucide-react"

export function ContactForm() {
  return (
    <div className="rounded-2xl bg-card border border-border p-8 shadow-2xl md:p-12">
      <form
        action={process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}
        method="POST"
        className="space-y-6"
      >
        {/* Name and Email */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-bold text-foreground"
            >
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-blue-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田 太郎"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-bold text-foreground"
            >
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-blue-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="taro@example.com"
            />
          </div>
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-bold text-foreground">
            会社名
          </label>
          <input
            type="text"
            id="company"
            name="company"
            className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-blue-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="株式会社Example"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-bold text-foreground">
            電話番号
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-blue-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="03-1234-5678"
          />
        </div>

        {/* Inquiry Type */}
        <div className="space-y-2">
          <label
            htmlFor="inquiry_type"
            className="text-sm font-bold text-foreground"
          >
            お問い合わせ種別 <span className="text-red-500">*</span>
          </label>
          <select
            id="inquiry_type"
            name="inquiry_type"
            required
            className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground transition-colors focus:border-blue-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="text-sm font-bold text-foreground"
          >
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-blue-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="新規サービスの開発について相談したい..."
          />
        </div>

        {/* Privacy Policy Notice */}
        <div className="rounded-lg bg-muted border border-border p-4 text-sm text-muted-foreground">
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl md:w-auto"
          >
            <Send className="h-5 w-5" />
            送信する
          </button>
        </div>
      </form>
    </div>
  )
}

