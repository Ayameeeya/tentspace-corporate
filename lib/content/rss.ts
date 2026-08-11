import type { ContentManifestEntry } from "./post-schema"

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

export function buildRssFeed(
  posts: ContentManifestEntry[],
  options: { siteUrl: string; title: string; description: string },
) {
  const items = posts
    .map((post) => {
      const url = `${options.siteUrl}/blog/${post.slug}`
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(options.title)}</title>
    <link>${options.siteUrl}/blog</link>
    <description>${escapeXml(options.description)}</description>
    <language>ja</language>
${items}
  </channel>
</rss>
`
}
