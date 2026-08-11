import manifest from "@/content-manifest.json"
import { listCategories, queryPosts, tagToSlug } from "@/lib/content/manifest-query"
import type { ContentManifestEntry } from "@/lib/content/post-schema"

export type BlogPost = ContentManifestEntry

export interface BlogAuthor {
  id: string
  name: string
  description: string
  avatarUrl: string
}

export interface BlogTerm {
  id: string
  name: string
  slug: string
}

export const DEFAULT_BLOG_AUTHOR: BlogAuthor = {
  id: "tentspace",
  name: "Hirokuma",
  description:
    "AI・自動化・SEOを中心に、実務で役立つ技術と運用の知見を発信しています。",
  avatarUrl: "/logo_black_symbol.png",
}

const publishedPosts = manifest as ContentManifestEntry[]

export async function getPosts(params?: {
  page?: number
  perPage?: number
  categories?: string[]
  tags?: string[]
  search?: string
}) {
  return queryPosts(publishedPosts, {
    page: params?.page,
    perPage: params?.perPage,
    search: params?.search,
    categories: params?.categories,
    tags: params?.tags,
  })
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return publishedPosts.find((post) => post.slug === slug) ?? null
}

export async function getCategories() {
  return listCategories(publishedPosts)
}

export async function getCategoryBySlug(slug: string) {
  const normalizedSlug = tagToSlug(decodeURIComponent(slug))
  return (
    listCategories(publishedPosts).find(
      (category) => category.slug === normalizedSlug,
    ) ?? null
  )
}

export function getFeaturedImageUrl(post: BlogPost): string | null {
  return post.ogImage ?? null
}

export function getPostTerms(post: BlogPost): BlogTerm[] {
  return post.categories.map((category) => ({
    id: tagToSlug(category),
    name: category,
    slug: tagToSlug(category),
  }))
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
