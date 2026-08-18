import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryPageClient } from "./category-page-client"
import { getCategories, getCategoryBySlug, getPosts } from "@/lib/blog-content"
import { buildBlogListingMetadata } from "@/lib/site"

const POSTS_PER_PAGE = 12

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const page = Number.parseInt(raw ?? "", 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string | string[] }>
}): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug)
  if (!category) return { robots: { index: false, follow: false } }

  return buildBlogListingMetadata({
    basePath: `/blog/categories/${category.slug}`,
    page: parsePage(query.page),
  })
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string | string[] }>
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const page = parsePage(query.page)
  const category = await getCategoryBySlug(slug)

  if (!category) notFound()

  const categories = await getCategories()
  const { posts, total, totalPages } = await getPosts({
    categories: [category.id],
    page,
    perPage: POSTS_PER_PAGE,
  })

  if (page > totalPages) notFound()

  return (
    <CategoryPageClient
      key={`${category.slug}:${page}`}
      initialCategory={category}
      initialCategories={categories.filter((item) => item.count > 0)}
      initialPosts={posts}
      initialPage={page}
      initialTotalPages={totalPages}
      initialTotalPosts={total}
    />
  )
}
