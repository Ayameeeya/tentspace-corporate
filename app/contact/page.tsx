import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "お問い合わせ | tent space",
  description:
    "tent spaceへのお問い合わせはこちらから。AI開発、業務自動化、システム開発に関するご相談を承ります。",
  openGraph: {
    title: "お問い合わせ | tent space",
    description:
      "tent spaceへのお問い合わせはこちらから。AI開発、業務自動化、システム開発に関するご相談を承ります。",
    url: "https://tentspace.net/contact",
    siteName: "tent space",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "お問い合わせ | tent space",
    description:
      "tent spaceへのお問い合わせはこちらから。AI開発、業務自動化、システム開発に関するご相談を承ります。",
  },
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="mx-auto max-w-4xl px-6 py-24 pt-32">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
              お問い合わせ
            </h1>
            <p className="text-lg text-slate-600">
              開発のご相談、お見積もりなど、お気軽にお問い合わせください。
              <br />
              AI活用の可能性について、まずは無料でお話ししましょう。
            </p>
          </div>

          {/* Contact Form */}
          <ContactForm />

          {/* Additional Contact Info */}
          <div className="mt-12 text-center">
            <p className="text-slate-600">
              お急ぎの場合は、直接メールでお問い合わせください
            </p>
            <a
              href="mailto:back-office@tentspace.net"
              className="mt-2 inline-block text-lg font-semibold text-blue-600 hover:text-blue-700"
            >
              back-office@tentspace.net
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

