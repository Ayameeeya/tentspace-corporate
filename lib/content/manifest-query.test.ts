import { describe, expect, it } from "vitest"
import type { ContentManifestEntry } from "./post-schema"
import { listCategories, queryPosts } from "./manifest-query"

const posts: ContentManifestEntry[] = [
  {
    id: 1,
    slug: "mdx-ui-parity",
    title: "MDX移行後もUIを変えない",
    description: "既存ブログの表示構造を維持します。",
    date: "2026-08-11T00:00:00.000Z",
    updated: "2026-08-11T00:00:00.000Z",
    categories: ["テクノロジー"],
    tags: ["MDX", "n8n"],
    draft: false,
    readingTime: 2,
    wordCount: 700,
  },
  {
    id: 2,
    slug: "content-as-code",
    title: "コンテンツをGitで管理する",
    description: "記事公開をPRフローに移行します。",
    date: "2026-08-10T00:00:00.000Z",
    updated: "2026-08-10T00:00:00.000Z",
    categories: ["SEO"],
    tags: ["MDX", "SEO"],
    draft: false,
    readingTime: 1,
    wordCount: 300,
  },
]

describe("queryPosts", () => {
  it("検索とページネーションをmanifest上で再現する", () => {
    const result = queryPosts(posts, {
      page: 1,
      perPage: 1,
      search: "表示構造",
    })

    expect(result.total).toBe(1)
    expect(result.totalPages).toBe(1)
    expect(result.posts.map((post) => post.slug)).toEqual(["mdx-ui-parity"])
  })

  it("タグslugで絞り込む", () => {
    const result = queryPosts(posts, { tags: ["seo"] })

    expect(result.posts.map((post) => post.slug)).toEqual(["content-as-code"])
  })

  it("カテゴリslugで絞り込む", () => {
    const result = queryPosts(posts, { categories: ["テクノロジー"] })

    expect(result.posts.map((post) => post.slug)).toEqual(["mdx-ui-parity"])
  })
})

describe("listCategories", () => {
  it("タグを既存カテゴリUI用の件数付き一覧へ変換する", () => {
    expect(listCategories(posts)).toEqual([
      { id: "seo", slug: "seo", name: "SEO", count: 1 },
      {
        id: "%e3%83%86%e3%82%af%e3%83%8e%e3%83%ad%e3%82%b8%e3%83%bc",
        slug: "%e3%83%86%e3%82%af%e3%83%8e%e3%83%ad%e3%82%b8%e3%83%bc",
        name: "テクノロジー",
        count: 1,
      },
    ])
  })
})
