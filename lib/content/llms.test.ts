import { describe, expect, it } from "vitest"
import type { ContentManifestEntry } from "./post-schema"
import { buildLlmsText } from "./llms"

describe("buildLlmsText", () => {
  it("公開manifestとHTML・Markdown記事への静的リンクを出力する", () => {
    const post: ContentManifestEntry = {
      id: 1,
      slug: "mdx-post",
      title: "MDX記事",
      description: "エージェント向け配信のテスト記事です。",
      date: "2026-08-11T00:00:00.000Z",
      updated: "2026-08-11T00:00:00.000Z",
      categories: ["AI"],
      tags: ["MDX"],
      draft: false,
      readingTime: 1,
      wordCount: 100,
    }

    const output = buildLlmsText([post], "https://tentspace.net")

    expect(output).toContain("https://tentspace.net/content-manifest.json")
    expect(output).toContain("https://tentspace.net/blog/mdx-post")
    expect(output).toContain("https://tentspace.net/blog/mdx-post/index.md")
  })
})
