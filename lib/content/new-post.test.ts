import { describe, expect, it } from "vitest"
import * as newPost from "./new-post"
import { parsePostSource } from "./post-schema"

const { createPostTemplate } = newPost

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

  it("実験メタデータをfrontmatterへ出力する", () => {
    const source = createPostTemplate({
      title: "実験付き記事",
      description: "仮説検証に使用する記事のテンプレートです。",
      date: "2026-08-11",
      slug: "experiment-post",
      categories: ["AI"],
      tags: ["検証"],
      experiment: {
        hook: "question",
        cta: "contact",
        targetKw: "AI 導入",
        utmCampaign: "blog_2026w33",
      },
    })

    const parsed = parsePostSource(
      source,
      "content/posts/experiment-post/index.mdx",
    )
    expect(parsed.metadata.experiment).toEqual({
      hook: "question",
      cta: "contact",
      targetKw: "AI 導入",
      utmCampaign: "blog_2026w33",
    })
  })

  it("SNS告知文の雛形を生成する", () => {
    const moduleWithSocial = newPost as typeof newPost & {
      createSocialTemplate?: (input: { title: string; slug: string }) => string
    }

    expect(typeof moduleWithSocial.createSocialTemplate).toBe("function")
    if (!moduleWithSocial.createSocialTemplate) return

    const social = moduleWithSocial.createSocialTemplate({
      title: "MDXで記事を書く",
      slug: "writing-with-mdx",
    })
    expect(social).toContain("# SNS告知文")
    expect(social).toContain("/blog/writing-with-mdx")
  })
})
