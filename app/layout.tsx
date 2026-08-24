import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, VT323, Audiowide, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { CookieConsent } from "@/components/cookie-consent"
import { ErrorBoundary } from "@/components/error-boundary"
import { ClientErrorTracker } from "@/components/client-error-tracker"
import { GoogleAnalytics } from "@/components/google-analytics"
import { SITE_URL } from "@/lib/site"
import "./globals.css"

const SITE_TITLE = "tent␣ - AI-Driven Development"
const SITE_DESCRIPTION =
  "tent space(テントスペース)は、AI駆動開発と実績のある専門知識を組み合わせて、より迅速でスマートなソリューションを提供するテックスタジオです。"
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/logo_gradation_yoko.png`

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-audiowide",
  preload: false,
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
})

const vt323 = VT323({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-vt323",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "tent space",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: "tent space",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#020212",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning className={`${inter.variable} ${audiowide.variable} ${geistMono.variable} ${vt323.variable}`}>
      <head>
        {/* Google Tag Consent Mode v2 - Default denied for EEA compliance.
            next/script の beforeInteractive はインライン script に非対応で
            hydration mismatch を起こすため、素の script タグで描画する */}
        <script
          id="gtag-consent-default"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}

              // Default consent state - denied until user accepts
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'wait_for_update': 500
              });
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[10000] rounded-md bg-background px-4 py-3 font-semibold text-foreground shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-primary"
        >
          本文へスキップ
        </a>
        <ErrorBoundary>
          <ClientErrorTracker />
          {children}
          <GoogleAnalytics />
          <CookieConsent />
        </ErrorBoundary>
        {/* AdSense ローダーは hydration 後に読み込む。head に生 script で置くと
            hydration 前に managed script が head へ注入され、React が consent
            script と誤って突き合わせて hydration mismatch になる */}
        <Script
          id="adsbygoogle-loader"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1533933816704006"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
