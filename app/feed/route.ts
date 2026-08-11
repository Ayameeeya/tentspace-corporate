import { getPosts } from "@/lib/blog-content"
import { buildRssFeed } from "@/lib/content/rss"

export const dynamic = "force-static"

export async function GET() {
  const { posts } = await getPosts({ perPage: 1000 })
  const xml = buildRssFeed(posts, {
    siteUrl: "https://tentspace.net",
    title: "tent space Blog",
    description: "AI、デザイン、テクノロジーの実践的な知見を届けるブログです。",
  })

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  })
}
