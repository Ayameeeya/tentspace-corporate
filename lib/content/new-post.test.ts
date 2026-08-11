import { describe, expect, it } from "vitest"
import { createPostTemplate } from "./new-post"
import { parsePostSource } from "./post-schema"

describe("createPostTemplate", () => {
  it("検証可能な下書きMDXテンプレートを作る", () => {
    const source = createPostTemplate({
      title: "MDXで記事を書く",
      description: "新しい記事を作成するためのテンプレートです。",
      date: "2026-08-11",
      slug: "writing-with-mdx",
      categories: ["テクノロジー"],
      tags: ["MDX", "SEO"],
    })

    const parsed = parsePostSource(
      source,
      "content/posts/writing-with-mdx/index.mdx",
    )

    expect(parsed.metadata).toMatchObject({
      title: "MDXで記事を書く",
      slug: "writing-with-mdx",
      draft: true,
      categories: ["テクノロジー"],
      tags: ["MDX", "SEO"],
    })
    expect(parsed.body).toContain("## はじめに")
  })

  it("不正なslugを拒否する", () => {
    expect(() =>
      createPostTemplate({
        title: "記事",
        description: "説明",
        date: "2026-08-11",
        slug: "Invalid_Slug",
        categories: [],
        tags: [],
      }),
    ).toThrow(/slug/i)
  })
})
