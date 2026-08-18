import { readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"
import robots from "../app/robots"
import sitemap from "../app/sitemap"
import * as categoryLayout from "../app/blog/categories/[slug]/layout"
import { SITE_URL } from "./site"
import * as siteModule from "./site"

const root = process.cwd()

async function read(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8")
}

describe("SEO configuration", () => {
  it("apexのSITE_URL設定もcanonicalなwwwホストへ正規化する", () => {
    const normalizeSiteUrl = (
      siteModule as typeof siteModule & {
        normalizeSiteUrl?: (value: string) => string
      }
    ).normalizeSiteUrl

    expect(normalizeSiteUrl).toBeTypeOf("function")
    if (!normalizeSiteUrl) return
    expect(normalizeSiteUrl("https://tentspace.net")).toBe(
      "https://www.tentspace.net",
    )
  })

  it("公開URLを最終到達先のwwwホストへ統一する", () => {
    expect(SITE_URL).toBe("https://www.tentspace.net")
  })

  it("sitemapにはcanonicalな公開ページだけを含める", async () => {
    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls.every((url) => url.startsWith(`${SITE_URL}/`) || url === SITE_URL)).toBe(true)
    expect(urls).toEqual(
      expect.arrayContaining([
        `${SITE_URL}/contact`,
        `${SITE_URL}/legal`,
        `${SITE_URL}/blog/n8n`,
      ]),
    )
    expect(urls).not.toContain(`${SITE_URL}/blog/favorites`)
  })

  it("robots.txtはレンダリング資産とnoindexページを許可し、APIだけをクロール拒否する", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
    })
  })

  it("カテゴリページへ固有のcanonicalとOG URLを設定する", async () => {
    const generateMetadata = (
      categoryLayout as {
        generateMetadata?: (input: {
          params: Promise<{ slug: string }>
        }) => Promise<{
          title?: unknown
          alternates?: { canonical?: unknown }
          openGraph?: { url?: unknown }
        }>
      }
    ).generateMetadata

    expect(generateMetadata).toBeTypeOf("function")
    if (!generateMetadata) return

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "n8n" }),
    })

    expect(String(metadata.title)).toContain("n8n")
    expect(metadata.alternates?.canonical).toBe(
      `${SITE_URL}/blog/categories/n8n`,
    )
    expect(metadata.openGraph?.url).toBe(`${SITE_URL}/blog/categories/n8n`)
  })

  it("主要な公開ページに固有metadataを定義する", async () => {
    const layouts = [
      "app/about/layout.tsx",
      "app/ai-development/layout.tsx",
      "app/pricing/layout.tsx",
      "app/privacy/layout.tsx",
      "app/terms/layout.tsx",
      "app/legal/layout.tsx",
    ]

    for (const file of layouts) {
      const source = await read(file)
      expect(source, file).toContain("alternates")
      expect(source, file).toContain("canonical")
      expect(source, file).toContain("openGraph")
      expect(source, file).toContain("twitter")
    }
  })

  it("個人用ページをnoindexにする", async () => {
    const files = [
      "app/admin/layout.tsx",
      "app/contact/completed/page.tsx",
      "app/profile/layout.tsx",
      "app/write/layout.tsx",
      "app/settings/layout.tsx",
      "app/blog/favorites/page.tsx",
      "app/test/error-tracking/page.tsx",
      "app/unauthorized/page.tsx",
    ]

    for (const file of files) {
      const source = await read(file)
      expect(source, file).toContain("index: false")
      expect(source, file).toContain("follow: false")
      expect(source, file).toContain("canonical: null")
      expect(source, file).toContain("openGraph: null")
      expect(source, file).toContain("twitter: null")
    }
  })

  it("ホーム・ブログ・問い合わせのcanonicalとOG URLを定義する", async () => {
    const files = ["app/layout.tsx", "app/blog/layout.tsx", "app/contact/page.tsx"]

    for (const file of files) {
      const source = await read(file)
      expect(source, file).toContain("canonical")
      expect(source, file).toMatch(/openGraph:[\s\S]*url:/)
    }
  })

  it("ブログのページネーションへ自己参照canonicalを設定する", async () => {
    const buildBlogListingMetadata = (
      siteModule as typeof siteModule & {
        buildBlogListingMetadata?: (input: {
          basePath: string
          page: number
          search?: string
        }) => {
          alternates?: { canonical?: unknown }
          robots?: { index?: unknown; follow?: unknown }
        }
      }
    ).buildBlogListingMetadata

    expect(buildBlogListingMetadata).toBeTypeOf("function")
    if (!buildBlogListingMetadata) return

    const pageTwo = buildBlogListingMetadata({
      basePath: "/blog",
      page: 2,
    })
    expect(pageTwo.alternates?.canonical).toBe(`${SITE_URL}/blog?page=2`)
    expect(pageTwo.robots).toMatchObject({ index: true, follow: true })

    const search = buildBlogListingMetadata({
      basePath: "/blog",
      page: 1,
      search: "n8n",
    })
    expect(search.robots).toMatchObject({ index: false, follow: true })

    const pageSource = await read("app/blog/page.tsx")
    expect(pageSource).toContain("generateMetadata")
    expect(pageSource).toContain("buildBlogListingMetadata")
  })

  it("カテゴリのページネーションへ自己参照canonicalを設定する", async () => {
    const buildBlogListingMetadata = (
      siteModule as typeof siteModule & {
        buildBlogListingMetadata?: (input: {
          basePath: string
          page: number
        }) => { alternates?: { canonical?: unknown } }
      }
    ).buildBlogListingMetadata

    expect(buildBlogListingMetadata).toBeTypeOf("function")
    if (!buildBlogListingMetadata) return

    const metadata = buildBlogListingMetadata({
      basePath: "/blog/categories/seo",
      page: 2,
    })
    expect(metadata.alternates?.canonical).toBe(
      `${SITE_URL}/blog/categories/seo?page=2`,
    )

    const pageSource = await read("app/blog/categories/[slug]/page.tsx")
    expect(pageSource).toContain("generateMetadata")
    expect(pageSource).toContain("buildBlogListingMetadata")
  })
})
