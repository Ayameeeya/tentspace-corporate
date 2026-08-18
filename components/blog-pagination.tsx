import Link from "next/link"
import { buildBlogPageHref } from "@/lib/content/manifest-query"

export function BlogPagination({
  basePath,
  currentPage,
  totalPages,
  search,
}: {
  basePath: string
  currentPage: number
  totalPages: number
  search?: string
}) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="記事一覧のページネーション"
      className="sr-only focus-within:not-sr-only focus-within:mt-8 focus-within:flex focus-within:justify-center focus-within:gap-4"
    >
      {currentPage > 1 && (
        <Link
          href={buildBlogPageHref(basePath, currentPage - 1, search)}
          rel="prev"
        >
          前のページ
        </Link>
      )}
      {currentPage < totalPages && (
        <Link
          href={buildBlogPageHref(basePath, currentPage + 1, search)}
          rel="next"
        >
          次のページ
        </Link>
      )}
    </nav>
  )
}
