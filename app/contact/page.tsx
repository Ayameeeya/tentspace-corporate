import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SITE_URL } from "@/lib/site"
import { ContactForm } from "./contact-form"

const title = "お問い合わせ | tent space"
const description =
  "tent spaceへのお問い合わせはこちらから。AI開発、業務自動化、システム開発に関するご相談を承ります。"
const canonicalUrl = `${SITE_URL}/contact`
const socialImage = `${SITE_URL}/logo_gradation_yoko.png`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    siteName: "tent space",
    locale: "ja_JP",
    type: "website",
    images: [{ url: socialImage, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="mx-auto max-w-4xl px-6 py-24 pt-32">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
              お問い合わせ
            </h1>
            <p className="text-lg text-muted-foreground">
              開発のご相談、お見積もりなど、お気軽にお問い合わせください。
              <br />
              AI活用の可能性について、まずは無料でお話ししましょう。
            </p>
          </div>

          {/* Contact Form */}
          <ContactForm />

          {/* Additional Contact Info */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
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

