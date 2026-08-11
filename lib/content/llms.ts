import type { ContentManifestEntry } from "./post-schema"

function escapeMarkdownLabel(value: string) {
  return value.replace(/[\[\]\\]/g, "\\$&")
}

export function buildLlmsText(
  posts: ContentManifestEntry[],
  siteUrl: string,
): string {
  const articles = posts.map((post) => {
    const htmlUrl = `${siteUrl}/blog/${post.slug}`
    const markdownUrl = `${htmlUrl}/index.md`
    return `- [${escapeMarkdownLabel(post.title)}](${htmlUrl}) — [Markdown](${markdownUrl})`
  })

  return `# tent space Blog

> AI、自動化、SEO、テクノロジーに関する実践的な記事を公開しています。

- [Content manifest](${siteUrl}/content-manifest.json)
- [Blog index](${siteUrl}/blog)

## Articles

${articles.join("\n")}
`
}
