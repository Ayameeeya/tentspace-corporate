import type { ContentManifestEntry } from "./post-schema"

export interface BlogCategory {
  id: string
  slug: string
  name: string
  count: number
  description?: string
}

export interface PostQueryOptions {
  page?: number
  perPage?: number
  search?: string
  categories?: string[]
  tags?: string[]
}

export interface PostQueryResult {
  posts: ContentManifestEntry[]
  totalPages: number
  total: number
}

export function buildBlogPageHref(
  basePath: string,
  page: number,
  search?: string,
): string {
  const params = new URLSearchParams()
  const normalizedSearch = search?.trim()
  if (normalizedSearch) params.set("search", normalizedSearch)
  if (page > 1) params.set("page", String(Math.floor(page)))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export function distributePostIndices(
  postCount: number,
  columns: number,
): number[][] {
  const columnCount = Math.max(1, Math.floor(columns))
  const distributed = Array.from({ length: columnCount }, () => [] as number[])
  for (let index = 0; index < postCount; index += 1) {
    distributed[index % columnCount].push(index)
  }
  return distributed
}

export function selectRelatedPosts(
  posts: ContentManifestEntry[],
  currentPostId: ContentManifestEntry["id"],
  limit = 3,
): ContentManifestEntry[] {
  const currentIndex = posts.findIndex((post) => post.id === currentPostId)
  const relatedLimit = Math.min(
    Math.max(0, Math.floor(limit)),
    Math.max(0, posts.length - 1),
  )

  if (currentIndex < 0 || relatedLimit === 0) return []

  return Array.from(
    { length: relatedLimit },
    (_, offset) => posts[(currentIndex + offset + 1) % posts.length],
  )
}

export function tagToSlug(tag: string): string {
  const trimmed = tag.trim()
  let decoded = trimmed
  try {
    decoded = decodeURIComponent(trimmed)
  } catch {
    decoded = trimmed
  }
  return decoded.toLowerCase()
}

export function queryPosts(
  posts: ContentManifestEntry[],
  options: PostQueryOptions = {},
): PostQueryResult {
  const page = Math.max(1, options.page ?? 1)
  const perPage = Math.max(1, options.perPage ?? 12)
  const search = options.search?.trim().toLocaleLowerCase("ja")
  const requestedCategories = new Set(
    (options.categories ?? []).map((category) => tagToSlug(category)),
  )
  const requestedTags = new Set((options.tags ?? []).map((tag) => tagToSlug(tag)))

  const filtered = posts.filter((post) => {
    const matchesSearch =
      !search ||
      [post.title, post.description, ...post.categories, ...post.tags]
        .join(" ")
        .toLocaleLowerCase("ja")
        .includes(search)
    const matchesTags =
      requestedTags.size === 0 ||
      post.tags.some((tag) => requestedTags.has(tagToSlug(tag)))
    const matchesCategories =
      requestedCategories.size === 0 ||
      post.categories.some((category) =>
        requestedCategories.has(tagToSlug(category)),
      )

    return matchesSearch && matchesTags && matchesCategories
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage

  return {
    posts: filtered.slice(start, start + perPage),
    totalPages,
    total,
  }
}

export function listCategories(posts: ContentManifestEntry[]): BlogCategory[] {
  const categories = new Map<string, BlogCategory>()

  for (const post of posts) {
    for (const category of post.categories) {
      const slug = tagToSlug(category)
      const current = categories.get(slug)
      if (current) {
        current.count += 1
      } else {
        categories.set(slug, { id: slug, slug, name: category, count: 1 })
      }
    }
  }

  return [...categories.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "en", { sensitivity: "base" }),
  )
}
