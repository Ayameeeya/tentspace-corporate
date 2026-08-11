import renderedPosts from "@/content-rendered.json"

const contentBySlug = renderedPosts as Record<string, string>

export function getRenderedPostBySlug(slug: string): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  return contentBySlug[slug] ?? null
}
