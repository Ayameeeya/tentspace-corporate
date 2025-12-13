import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Tentspace Blog",
  description: "株式会社テントスペースの特定商取引法に基づく表記ページです。",
  robots: {
    index: false,
    follow: false,
  },
}

export default function TokushohoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="light" data-theme="light" style={{ colorScheme: 'light' }}>
      {children}
    </div>
  )
}

