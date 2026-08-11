import type { ReactNode } from "react"
import { getCategories } from "@/lib/blog-content"

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({
    slug: decodeURIComponent(category.slug),
  }))
}

export default function CategoryLayout({ children }: { children: ReactNode }) {
  return children
}
