import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "お問い合わせ完了 | tent space",
  description:
    "お問い合わせありがとうございます。内容を確認次第、担当者よりご連絡いたします。",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ContactCompletedPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="mx-auto max-w-4xl px-6 py-24 pt-32">
          {/* Success Icon and Message */}
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-6 shadow-2xl">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
              送信完了
            </h1>
            <p className="mb-8 text-lg text-slate-600">
              お問い合わせいただき、ありがとうございます。
            </p>
          </div>

          {/* Details Card */}
          <div className="mb-12 rounded-2xl bg-white p-8 shadow-2xl md:p-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-blue-100 p-2">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="mb-2 text-xl font-bold text-slate-900">
                    お問い合わせを受け付けました
                  </h2>
                  <p className="text-slate-600">
                    内容を確認次第、担当者より2営業日以内にご連絡いたします。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-purple-100 p-2">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="mb-2 text-xl font-bold text-slate-900">
                    確認メールをご確認ください
                  </h2>
                  <p className="text-slate-600">
                    ご入力いただいたメールアドレス宛に、受付確認メールを送信しました。
                    <br />
                    メールが届かない場合は、迷惑メールフォルダもご確認ください。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-orange-100 p-2">
                  <svg
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="mb-2 text-xl font-bold text-slate-900">
                    お急ぎの場合
                  </h2>
                  <p className="text-slate-600">
                    お急ぎの場合は、直接メールでお問い合わせください。
                    <br />
                    <a
                      href="mailto:back-office@tentspace.net"
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      back-office@tentspace.net
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl sm:w-auto"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              トップページへ
            </Link>
            <Link
              href="/blog"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              ブログを読む
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

