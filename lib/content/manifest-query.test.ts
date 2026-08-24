import { describe, expect, it } from "vitest"
import type { ContentManifestEntry } from "./post-schema"
import * as manifestQuery from "./manifest-query"

const { listCategories, queryPosts } = manifestQuery

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

describe("buildBlogPageHref", () => {
  it("一覧・検索・カテゴリのページ番号をクロール可能なURLへ変換する", () => {
    const buildBlogPageHref = (
      manifestQuery as typeof manifestQuery & {
        buildBlogPageHref?: (
          basePath: string,
          page: number,
          search?: string,
        ) => string
      }
    ).buildBlogPageHref

    expect(buildBlogPageHref).toBeTypeOf("function")
    if (!buildBlogPageHref) return

    expect(buildBlogPageHref("/blog", 1)).toBe("/blog")
    expect(buildBlogPageHref("/blog", 2)).toBe("/blog?page=2")
    expect(buildBlogPageHref("/blog", 2, "n8n 入門")).toBe(
      "/blog?search=n8n+%E5%85%A5%E9%96%80&page=2",
    )
    expect(buildBlogPageHref("/blog/categories/seo", 3)).toBe(
      "/blog/categories/seo?page=3",
    )
  })
})

describe("distributePostIndices", () => {
  it("ブラウザ計測前も全記事を決定的にMasonry列へ割り当てる", () => {
    const distributePostIndices = (
      manifestQuery as typeof manifestQuery & {
        distributePostIndices?: (postCount: number, columns: number) => number[][]
      }
    ).distributePostIndices

    expect(distributePostIndices).toBeTypeOf("function")
    if (!distributePostIndices) return

    expect(distributePostIndices(5, 3)).toEqual([[0, 3], [1, 4], [2]])
    expect(distributePostIndices(3, 1)).toEqual([[0, 1, 2]])
    expect(distributePostIndices(0, 3)).toEqual([[], [], []])
  })
})

describe("selectRelatedPosts", () => {
  it("すべての記事が関連記事リンクを受け取れるよう循環して選ぶ", () => {
    const selectRelatedPosts = (
      manifestQuery as typeof manifestQuery & {
        selectRelatedPosts?: (
          posts: ContentManifestEntry[],
          currentPostId: number,
          limit?: number,
        ) => ContentManifestEntry[]
      }
    ).selectRelatedPosts

    expect(selectRelatedPosts).toBeTypeOf("function")
    if (!selectRelatedPosts) return

    const categoryPosts = Array.from({ length: 5 }, (_, index) => ({
      ...posts[0],
      id: index + 1,
      slug: `post-${index + 1}`,
    }))
    const inboundCounts = new Map(
      categoryPosts.map((post) => [post.id, 0]),
    )

    for (const post of categoryPosts) {
      const related = selectRelatedPosts(categoryPosts, post.id, 3)

      expect(related).toHaveLength(3)
      expect(related.some((candidate) => candidate.id === post.id)).toBe(false)
      for (const candidate of related) {
        inboundCounts.set(candidate.id, (inboundCounts.get(candidate.id) ?? 0) + 1)
      }
    }

    expect([...inboundCounts.values()]).toEqual([3, 3, 3, 3, 3])
  })
})
