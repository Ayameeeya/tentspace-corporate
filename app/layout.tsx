import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono, Orbitron } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

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
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
