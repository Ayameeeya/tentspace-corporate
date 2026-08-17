import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

const title = "特定商取引法に基づく表記 | tent space"
const description =
  "tent spaceの事業者情報、連絡先、販売条件など、特定商取引法に基づく表記をご案内します。"
const canonicalUrl = `${SITE_URL}/legal`
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

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children
}
