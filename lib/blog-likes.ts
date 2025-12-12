import { supabaseClient } from "./supabase/client"

const STORAGE_KEY = "tentspace_blog_client_id"

// Generate or retrieve a stable client-side ID for like uniqueness
export function getClientId(): string | null {
  if (typeof window === "undefined") return null

  const existing = window.localStorage.getItem(STORAGE_KEY)
  if (existing) return existing

  const newId = crypto.randomUUID()
  window.localStorage.setItem(STORAGE_KEY, newId)
  return newId
}

// Fetch like counts for a set of slugs
export async function fetchLikeCounts(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {}
  const uniqueSlugs = Array.from(new Set(slugs))

  const { data, error } = await supabaseClient
    .from("blog_like_counts")
    .select("post_slug, likes")
    .in("post_slug", uniqueSlugs)

  if (error) {
    console.error("Failed to fetch like counts", error)
    return {}
  }

  return (data || []).reduce<Record<string, number>>((acc, row) => {
    acc[row.post_slug] = Number(row.likes) || 0
    return acc
  }, {})
}

// Check if current client already liked the post
export async function fetchHasLiked(slug: string, clientId: string): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from("blog_likes")
    .select("id")
    .eq("post_slug", slug)
    .eq("client_id", clientId)
    .limit(1)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("Failed to check like status", error)
    return false
  }

  return Boolean(data)
}

// Insert a like; returns true if inserted or already present
export async function addLike(slug: string, clientId: string, userAgent?: string): Promise<{
  inserted: boolean
  alreadyLiked: boolean
}> {
  const { error } = await supabaseClient.from("blog_likes").insert({
    post_slug: slug,
    client_id: clientId,
    user_agent: userAgent?.slice(0, 255),
  })

  if (error) {
    // 23505 = unique_violation
    if ((error as { code?: string }).code === "23505") {
      return { inserted: false, alreadyLiked: true }
    }
    console.error("Failed to add like", error)
    throw error
  }

  return { inserted: true, alreadyLiked: false }
}

// Total likes across all posts
export async function fetchTotalLikes(): Promise<number> {
  const { count, error } = await supabaseClient
    .from("blog_likes")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("Failed to fetch total likes", error)
    return 0
  }

  return count ?? 0
}
