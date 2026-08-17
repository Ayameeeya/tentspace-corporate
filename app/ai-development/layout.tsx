import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

const title = "AI駆動開発支援 | tent space"
const description =
  "AIを活用したソフトウェア開発、業務自動化、システム改善をtent spaceが支援します。課題に合わせた開発体制をご提案します。"
const canonicalUrl = `${SITE_URL}/ai-development`
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

export default function AIDevelopmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
