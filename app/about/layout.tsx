import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

const title = "私たちについて | tent space"
const description =
  "tent spaceのビジョン、開発スタイル、技術領域をご紹介します。AIとソフトウェア開発を通じて、事業の前進を支援します。"
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
