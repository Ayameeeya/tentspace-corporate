import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { TentShell } from "@/components/home/TentShell"
import { ChapterLabel } from "@/components/home/ChapterText"
import { ScrambleText } from "@/components/home/ScrambleText"
import { ContactForm } from "./contact-form"

const title = "お問い合わせ | tent space"
const description =
  "tent spaceへのお問い合わせはこちらから。Web・スマホアプリ開発、AIエージェント開発・業務自動化に関するご相談を承ります。"
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
    <TentShell>
      <main id="main-content" className="tent-doc">
        <div className="tent-container">
          <ChapterLabel label="contact" />
          <ScrambleText as="h1" className="heading-l" mode="load" intensity={2}>
            お問い合わせ
          </ScrambleText>
          <div className="tent-doc__meta">
            <ScrambleText as="p" className="paragraph-regular opacity-64" mode="load" intensity={2}>
              開発のご相談、お見積もりなど、お気軽にどうぞ。まずは無料で、作りたいものの話から始めましょう。
            </ScrambleText>
          </div>

          <div style={{ marginTop: "6em" }}>
            <ContactForm />
          </div>

          <div className="tent-doc__rows" style={{ marginTop: "6em", maxWidth: "62em" }}>
            <div className="tent-doc__row">
              <p className="paragraph-regular opacity-64">お急ぎの場合</p>
              <p className="paragraph-regular">
                <a href="mailto:back-office@tentspace.net" className="tent-ul">
                  back-office@tentspace.net
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </TentShell>
  )
}
