import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プロフィール | TentSpace",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
