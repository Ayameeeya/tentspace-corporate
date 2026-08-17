import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

const title = "料金プラン | tent space"
const description =
  "tent spaceが提供するサービスの料金プランと利用できる機能をご案内します。目的に合ったプランをご確認ください。"
const canonicalUrl = `${SITE_URL}/pricing`
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

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
