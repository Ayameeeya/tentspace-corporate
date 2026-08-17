import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

const title = "利用規約 | tent space"
const description =
  "tent spaceのサービス利用条件、禁止事項、免責事項、知的財産権などを定めた利用規約です。"
const canonicalUrl = `${SITE_URL}/terms`
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

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
