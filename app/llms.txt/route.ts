import { getPosts } from "@/lib/blog-content"
import { buildLlmsText } from "@/lib/content/llms"
import { SITE_URL } from "@/lib/site"

export const dynamic = "force-static"

export async function GET() {
  const { posts } = await getPosts({ perPage: 1000 })
  return new Response(buildLlmsText(posts, SITE_URL), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  })
}
