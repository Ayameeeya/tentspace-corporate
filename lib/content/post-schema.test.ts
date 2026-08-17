import { describe, expect, it } from "vitest"
import { createContentManifest, parsePostSource } from "./post-schema"

const validSource = `---
title: "MDX移行後もUIを変えない"
description: "外部CMSを廃止しながら既存ブログの表示構造を維持するためのサンプル記事です。"
date: 2026-08-11
slug: mdx-ui-parity
categories: [テクノロジー]
tags: [MDX, n8n]
experiment:
  hook: howto
  cta: inquiry
  targetKw: "Next.js MDX"
  utmCampaign: blog_2026w33
---

## MDXで管理する

本文をリポジトリ内で管理します。
`

describe("parsePostSource", () => {
  it("frontmatterを検証して既定値を補う", () => {
    const post = parsePostSource(
      validSource,
      "content/posts/mdx-ui-parity/index.mdx",
    )

    expect(post.metadata.slug).toBe("mdx-ui-parity")
    expect(post.metadata.date).toEqual(new Date("2026-08-11"))
    expect(post.metadata.draft).toBe(false)
    expect(post.metadata.tags).toEqual(["MDX", "n8n"])
    expect(post.metadata.categories).toEqual(["テクノロジー"])
    expect(post.body).toContain("## MDXで管理する")
  })

  it("ディレクトリ名とslugが一致しない記事を拒否する", () => {
    expect(() =>
      parsePostSource(validSource, "content/posts/different-slug/index.mdx"),
    ).toThrow(/directory.*slug/i)
  })

  it("不正なslugを拒否する", () => {
    const source = validSource.replace("mdx-ui-parity", "MDX_UI_PARITY")

    expect(() =>
      parsePostSource(source, "content/posts/MDX_UI_PARITY/index.mdx"),
    ).toThrow(/slug/i)
  })

  it("experimentがある新規記事では全属性と許可済みCTAを要求する", () => {
    const missingCampaign = validSource.replace(
      "  utmCampaign: blog_2026w33\n",
      "",
    )
    const unsupportedCta = validSource.replace("cta: inquiry", "cta: contact")

    expect(() =>
      parsePostSource(
        missingCampaign,
        "content/posts/mdx-ui-parity/index.mdx",
      ),
    ).toThrow(/utmCampaign/i)
    expect(() =>
      parsePostSource(
        unsupportedCta,
        "content/posts/mdx-ui-parity/index.mdx",
      ),
    ).toThrow(/cta|invalid/i)
  })
})

describe("createContentManifest", () => {
  it("下書きを除外し日付順のmanifestを作る", () => {
    const draftSource = validSource
      .replace("slug: mdx-ui-parity", "slug: hidden-draft\ndraft: true")
      .replace("date: 2026-08-11", "date: 2026-08-12")

    const manifest = createContentManifest([
      {
        source: validSource,
        sourcePath: "content/posts/mdx-ui-parity/index.mdx",
      },
      {
        source: draftSource,
        sourcePath: "content/posts/hidden-draft/index.mdx",
      },
    ])

    expect(manifest).toHaveLength(1)
    expect(manifest[0]).toMatchObject({
      slug: "mdx-ui-parity",
      title: "MDX移行後もUIを変えない",
      date: "2026-08-11T00:00:00.000Z",
      tags: ["MDX", "n8n"],
      categories: ["テクノロジー"],
      readingTime: 1,
    })
    expect(manifest[0]).not.toHaveProperty("legacy")
  })
})
