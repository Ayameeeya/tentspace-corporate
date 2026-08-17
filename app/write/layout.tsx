import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "記事を書く | TentSpace",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
}

export default function WriteLayout({ children }: { children: React.ReactNode }) {
  return children
}
