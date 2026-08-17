import type { Metadata } from "next"
import SettingsClientLayout from "./settings-client-layout"

export const metadata: Metadata = {
  title: "アカウント設定 | TentSpace",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SettingsClientLayout>{children}</SettingsClientLayout>
}
