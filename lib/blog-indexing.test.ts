import { readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"
import manifest from "../content-manifest.json"
import nextConfig from "../next.config.mjs"

const root = process.cwd()

async function read(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8")
}

async function readIfExists(relativePath: string) {
  return read(relativePath).catch(() => "")
}

const historicalArticleRedirects = new Map([
  [
    "/blog/【緊急】next-js／reactに深刻な脆弱性「react2shell」｜rceの実攻撃",
    "/blog/react2shell-vulnerability-alert",
  ],
  [
    "/blog/【上級者向け】n8nでragシステムを構築する｜ベクト",
    "/blog/n8n-rag-system-guide",
  ],
  [
    "/blog/【完全ガイド】n8n-webhookの使い方｜設定から認証・レス",
    "/blog/n8n-webhook-guide",
  ],
  [
    "/blog/【デバイス別】chatgptの始め方｜スマホ・pcそれぞれの",
    "/blog/chatgpt-device-setup-guide",
  ],
  [
    "/blog/n8n-aiエージェント活用ガイド｜2025年注目の自動化事例1",
    "/blog/n8n-ai-agent-guide",
  ],
  [
    "/blog/【seo】アンカーテキストとは？6つの種類と最適化",
    "/blog/anchor-text-guide",
  ],
  [
    "/blog/【seo】コンテンツseoとは？実践の4ステップと成功の",
    "/blog/content-seo-guide",
  ],
  [
    "/blog/【seo】alt属性とは？適切な設定方法と書き方を種類",
    "/blog/alt-attribute-guide",
  ],
  ["/blog/descartes", "/blog/descartes-philosophy-guide"],
  [
    "/blog/dockerの辛いところ｜20年現場で見てきた「便利だけど",
    "/blog/docker-challenges-guide",
  ],
  [
    "/blog/docker入門｜20年現場で見てきた環境構築の変遷と始め",
    "/blog/docker-beginner-guide",
  ],
  [
    "/blog/trello-mcp-ai経由でタスク管理を自動化する新しい業務効",
    "/blog/trello-mcp-ai-automation",
  ],
  [
    "/blog/【seo】パンくずリストとは？seo効果と設置方法を徹",
    "/blog/breadcrumb-guide",
  ],
  [
    "/blog/【seo】内部リンクとは？seoでの重要性と効果的な張",
    "/blog/internal-link-guide",
  ],
  [
    "/blog/【seo】seo効果測定とは？見るべき重要6指標と推奨ツ",
    "/blog/seo-measurement-guide",
  ],
  [
    "/blog/【seo】titleタグとは？検索順位とクリック率を上げる",
    "/blog/title-tag-guide",
  ],
  [
    "/blog/【seo】xmlサイトマップとは？seo効果と作成方法を徹底",
    "/blog/xml-sitemap-guide",
  ],
  [
    "/blog/【seo】被リンクとは？seo効果と良質なリンクの増や",
    "/blog/backlink-guide",
  ],
  [
    "/blog/【seo】htmlサイトマップとは？xmlとの違いと作り方を徹",
    "/blog/html-sitemap-guide",
  ],
])

describe("blog indexing recovery", () => {
  it("apexホストをwwwへ308で恒久転送する", async () => {
    const redirects = nextConfig.redirects

    expect(redirects).toBeTypeOf("function")
    if (!redirects) return

    expect(await redirects()).toContainEqual({
      source: "/:path*",
      has: [{ type: "host", value: "tentspace.net" }],
      destination: "https://www.tentspace.net/:path*",
      permanent: true,
    })
  })

  it("検索実績または404が確認された旧記事URLを対応するMDX記事へ恒久転送する", async () => {
    const redirects = nextConfig.redirects

    expect(redirects).toBeTypeOf("function")
    if (!redirects) return

    const configured = new Map(
      (await redirects())
        .filter((entry) => !entry.has)
        .map((entry) => [entry.source, entry.destination]),
    )

    expect(configured).toEqual(historicalArticleRedirects)

    const currentSlugs = new Set(manifest.map((post) => post.slug))
    for (const destination of configured.values()) {
      expect(currentSlugs.has(destination.replace("/blog/", "")), destination).toBe(
        true,
      )
    }
  })

  it("ブログ一覧をサーバーで取得しクライアントUIへ初期データを渡す", async () => {
    const [page, client] = await Promise.all([
      read("app/blog/page.tsx"),
      readIfExists("app/blog/blog-page-client.tsx"),
    ])

    expect(page.trimStart()).not.toMatch(/^["']use client["']/)
    expect(page).toContain("await getPosts")
    expect(page).toContain("await getCategories")
    expect(page).toContain("searchParams")
    expect(page).toContain("initialPosts")
    expect(client.trimStart()).toMatch(/^["']use client["']/)
    expect(client).toContain("initialPosts")
    expect(client).toContain("<BlogPagination")
  })

  it("カテゴリ一覧をサーバーで取得しクライアントUIへ初期データを渡す", async () => {
    const [page, client] = await Promise.all([
      read("app/blog/categories/[slug]/page.tsx"),
      readIfExists("app/blog/categories/[slug]/category-page-client.tsx"),
    ])

    expect(page.trimStart()).not.toMatch(/^["']use client["']/)
    expect(page).toContain("await getCategoryBySlug")
    expect(page).toContain("await getPosts")
    expect(page).toContain("initialPosts")
    expect(client.trimStart()).toMatch(/^["']use client["']/)
    expect(client).toContain("initialPosts")
    expect(client).toContain("<BlogPagination")
  })

  it("無限スクロールを実URLの前後ページリンクで補強する", async () => {
    const pagination = await readIfExists("components/blog-pagination.tsx")

    expect(pagination).toContain("<nav")
    expect(pagination).toContain('aria-label="記事一覧のページネーション"')
    expect(pagination).toContain("buildBlogPageHref")
    expect(pagination).toContain("<Link")
  })
})
