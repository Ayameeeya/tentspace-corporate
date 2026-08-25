import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

const title = "私たちについて | tent space"
const description =
  "tent spaceのビジョン、働き方、技術領域をご紹介します。エンジニアリングで事業を良くする会社として、作ることから運用、整理までを手がけます。"
const canonicalUrl = `${SITE_URL}/about`
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
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
