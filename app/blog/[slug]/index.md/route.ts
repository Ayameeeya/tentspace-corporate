import { getPosts } from "@/lib/blog-content"
import { loadPostMarkdownBySlug } from "@/lib/content/markdown"

export const dynamic = "force-static"

export async function generateStaticParams() {
  const { posts } = await getPosts({ perPage: 1000 })
  return posts.map((post) => ({ slug: post.slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const markdown = await loadPostMarkdownBySlug(slug)
  if (!markdown) return new Response("Not found\n", { status: 404 })

  return new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
    },
  })
}
