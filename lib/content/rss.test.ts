import { describe, expect, it } from "vitest"
import type { ContentManifestEntry } from "./post-schema"
import { buildRssFeed } from "./rss"

describe("buildRssFeed", () => {
  it("記事URL・日付・XMLエスケープを含むRSS 2.0を作る", () => {
    const posts: ContentManifestEntry[] = [
      {
        id: 1,
        slug: "mdx-and-seo",
        title: "MDX & SEO",
        description: "安全に <公開> する",
        date: "2026-08-11T00:00:00.000Z",
        updated: "2026-08-11T00:00:00.000Z",
        categories: ["テクノロジー"],
        tags: ["MDX"],
        draft: false,
        readingTime: 1,
        wordCount: 100,
      },
    ]

    const xml = buildRssFeed(posts, {
      siteUrl: "https://tentspace.net",
      title: "tent space Blog",
      description: "技術ブログ",
    })

    expect(xml).toContain('<rss version="2.0">')
    expect(xml).toContain("https://tentspace.net/blog/mdx-and-seo")
    expect(xml).toContain("MDX &amp; SEO")
    expect(xml).toContain("安全に &lt;公開&gt; する")
    expect(xml).toContain("Tue, 11 Aug 2026 00:00:00 GMT")
  })
})
