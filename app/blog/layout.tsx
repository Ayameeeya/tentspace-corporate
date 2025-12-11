import type React from "react"
import type { Metadata } from "next"

const SITE_URL = "https://tentspace.net"

export const metadata: Metadata = {
  title: {
    template: '%s | tent space Blog',
    default: 'tent space Blog - AI開発・テクノロジー情報',
  },
  description: 'AI開発、テクノロジー、最新の取り組みについて発信しています。tent spaceのエンジニアが実践的な技術情報をお届けします。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'tent space Blog',
    images: [
      {
        url: `${SITE_URL}/logo_gradation_yoko.png`,
        width: 1200,
        height: 630,
        alt: 'tent space Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`${SITE_URL}/logo_gradation_yoko.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
}

// JSON-LD for Blog section
const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "tent space Blog",
  description: "AI開発、テクノロジー、最新の取り組みについて発信しています。",
  url: `${SITE_URL}/blog`,
  publisher: {
    "@type": "Organization",
    name: "tent space Inc.",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo_black_yoko.png`,
    },
  },
  inLanguage: "ja",
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "tent space",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([blogJsonLd, websiteJsonLd]),
        }}
      />
      {children}
    </>
  )
}

