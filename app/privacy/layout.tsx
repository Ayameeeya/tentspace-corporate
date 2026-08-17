import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

const title = "プライバシーポリシー | tent space"
const description =
  "tent spaceにおける個人情報の取得、利用目的、管理、安全対策、第三者提供について定めたプライバシーポリシーです。"
const canonicalUrl = `${SITE_URL}/privacy`
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

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
