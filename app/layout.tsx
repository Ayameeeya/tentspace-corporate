import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono, Orbitron } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { CookieConsent } from "@/components/cookie-consent"
import { ErrorBoundary } from "@/components/error-boundary"
import { ClientErrorTracker } from "@/components/client-error-tracker"
import "./globals.css"

const GA_MEASUREMENT_ID = "G-1XCFVFP5DX"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "500", "700"] })

export const metadata: Metadata = {
  title: "tent␣ - AI Driven Development",
  description: "tent space(テントスペース)は、AI駆動開発と実績のある専門知識を組み合わせて、より迅速でスマートなソリューションを提供するテックスタジオです。",
  generator: "v0.app",
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
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* Google Tag Consent Mode v2 - Default denied for EEA compliance */}
        <Script id="gtag-consent-default" strategy="beforeInteractive">
          {`
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
          `}
        </Script>

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <ClientErrorTracker />
          {children}
          <Analytics />
          <CookieConsent />
        </ErrorBoundary>
      </body>
    </html>
  )
}
