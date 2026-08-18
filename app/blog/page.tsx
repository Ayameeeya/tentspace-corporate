import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogPageClient } from "./blog-page-client"
import { getCategories, getPosts } from "@/lib/blog-content"
import { buildBlogListingMetadata } from "@/lib/site"

const POSTS_PER_PAGE = 12

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function parsePage(value: string | string[] | undefined): number {
  const page = Number.parseInt(firstValue(value), 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[]
    search?: string | string[]
  }>
}): Promise<Metadata> {
  const query = await searchParams
  return buildBlogListingMetadata({
    basePath: "/blog",
    page: parsePage(query.page),
    search: firstValue(query.search).trim() || undefined,
  })
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[]
    search?: string | string[]
  }>
}) {
  const query = await searchParams
  const page = parsePage(query.page)
  const search = firstValue(query.search).trim()
  const { posts, total, totalPages } = await getPosts({
    page,
    perPage: POSTS_PER_PAGE,
    search: search || undefined,
  })
  const categories = await getCategories()

  if (page > totalPages) notFound()

  return (
    <BlogPageClient
      key={`${search}:${page}`}
      initialPosts={posts}
      initialCategories={categories.filter((category) => category.count > 0)}
      initialPage={page}
      initialTotalPages={totalPages}
      initialTotalPosts={total}
      initialSearchQuery={search}
    />
  )
}
