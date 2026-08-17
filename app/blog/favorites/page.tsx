import { Metadata } from "next"
import FavoritesClient from "./favorites-client"

export const metadata: Metadata = {
  title: "お気に入り記事 | TentSpace",
  description: "お気に入りに登録した記事の一覧",
  robots: {
    index: false,
    follow: false,
  },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
}

export default function FavoritesPage() {
  return <FavoritesClient />
}

