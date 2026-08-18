import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { MonoShell } from "@/components/home/MonoShell"
import { ChapterLabel } from "@/components/home/ChapterText"
import { ScrambleText } from "@/components/home/ScrambleText"
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
    <MonoShell>
      <main id="main-content" className="mono-doc">
        <div className="mono-container">
          <ChapterLabel label="contact" />
          <ScrambleText as="h1" className="heading-l" mode="load" intensity={2}>
            お問い合わせ
          </ScrambleText>
          <div className="mono-doc__meta">
            <ScrambleText as="p" className="paragraph-regular opacity-64" mode="load" intensity={2}>
              開発のご相談、お見積もりなど、お気軽にどうぞ。AI活用の可能性について、まずは無料でお話ししましょう。
            </ScrambleText>
          </div>

          <div style={{ marginTop: "6em" }}>
            <ContactForm />
          </div>

          <div className="mono-doc__rows" style={{ marginTop: "6em", maxWidth: "62em" }}>
            <div className="mono-doc__row">
              <p className="paragraph-regular opacity-64">お急ぎの場合</p>
              <p className="paragraph-regular">
                <a href="mailto:back-office@tentspace.net" className="mono-ul">
                  back-office@tentspace.net
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </MonoShell>
  )
}
