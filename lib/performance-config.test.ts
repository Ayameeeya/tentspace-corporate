import { readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

async function read(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8")
}

async function readOptional(relativePath: string) {
  return read(relativePath).catch(() => "")
}

describe("performance configuration", () => {
  it("Next Imageでローカル画像とSupabaseのアバターを最適化する", async () => {
    const config = await read("next.config.mjs")

    expect(config).not.toContain("unoptimized: true")
    expect(config).toContain('hostname: "zbgzvbcgjvnsgildrmta.supabase.co"')
    expect(config).toContain('pathname: "/storage/v1/object/public/avatars/**"')
  })

  it("同意前にGoogle Analyticsをダウンロードしない", async () => {
    const [layout, analytics] = await Promise.all([
      read("app/layout.tsx"),
      readOptional("components/google-analytics.tsx"),
    ])

    expect(layout).not.toContain("googletagmanager.com")
    expect(layout).toContain("<GoogleAnalytics />")
    expect(analytics).toContain('cookie_consent=')
    expect(analytics).toContain('detail === "granted"')
    expect(analytics).toContain('strategy="lazyOnload"')
  })

  it("無効なVercel Analyticsのスクリプトを配信しない", async () => {
    const [layout, packageJson] = await Promise.all([
      read("app/layout.tsx"),
      read("package.json"),
    ])

    expect(layout).not.toContain("@vercel/analytics")
    expect(layout).not.toContain("<Analytics />")
    expect(packageJson).not.toContain('"@vercel/analytics"')
  })

  it("装飾フォントを初期表示の高優先度リソースにしない", async () => {
    const layout = await read("app/layout.tsx")

    for (const font of ["audiowide", "geistMono", "vt323"]) {
      const declaration = layout.match(
        new RegExp(`const ${font} = [\\s\\S]*?\\n\\}`),
      )?.[0]
      expect(declaration, font).toContain("preload: false")
    }
  })

  it("ブログヘッダーから重量級ページを自動先読みしない", async () => {
    const [header, article] = await Promise.all([
      read("components/blog-header.tsx"),
      read("app/blog/[slug]/blog-post-client.tsx"),
    ])

    expect(header).toMatch(/<Link\s+href="\/"\s+prefetch=\{false\}/)
    expect(header).toMatch(/<Link\s+href="\/about"\s+prefetch=\{false\}/)
    expect(article).toMatch(/<Link\s+href="\/"\s+prefetch=\{false\}/)

    const aboutLinks = article.match(/<Link(?=[^>]*href="\/about")[^>]*>/g) ?? []
    expect(aboutLinks.length).toBeGreaterThan(0)
    for (const link of aboutLinks) {
      expect(link).toContain("prefetch={false}")
    }
  })

  it("ブログヘッダーのアニメーションと認証モーダルを初期JSから外す", async () => {
    const header = await read("components/blog-header.tsx")

    expect(header).not.toContain('from "gsap"')
    expect(header).toContain("transition-transform duration-300 ease-in-out")
    expect(header).toContain(
      'lazy(() => import("@/components/auth-modal")',
    )
    expect(header).toContain("{showAuthModal && (")
  })

  it("ブログのLCP画像を明示的に高優先度で取得する", async () => {
    const article = await read("app/blog/[slug]/blog-post-client.tsx")
    const featuredImage = article.match(
      /\{\/\* Featured Image \*\/\}[\s\S]*?<Image[\s\S]*?\/>/,
    )?.[0]

    expect(featuredImage).toContain('fetchPriority="high"')
  })

  it("構文ハイライトをコードブロックがある記事だけで読み込む", async () => {
    const article = await read("app/blog/[slug]/blog-post-client.tsx")
    const guardIndex = article.indexOf("if (codeBlocks.length === 0) return")
    const dynamicImportIndex = article.indexOf(
      "await import('highlight.js/lib/core')",
    )

    expect(article).not.toMatch(/^import hljs from/m)
    expect(guardIndex).toBeGreaterThan(0)
    expect(dynamicImportIndex).toBeGreaterThan(guardIndex)
  })

  it("ブログロゴのintrinsic比率を実ファイルに合わせる", async () => {
    const header = await read("components/blog-header.tsx")
    const logos = header.match(/<Image[\s\S]*?logo_(?:black|white)_yoko\.png[\s\S]*?\/>/g) ?? []

    expect(logos.length).toBeGreaterThan(0)
    for (const logo of logos) {
      expect(logo).toContain("width={682}")
      expect(logo).toContain("height={125}")
    }
    expect(header).toContain('sizes="(max-width: 768px) 80px, 110px"')
  })

  it("Cookie選択をAnalyticsローダーへ通知する", async () => {
    const consent = await read("components/cookie-consent.tsx")

    expect(consent).toContain('new CustomEvent("cookie-consent-changed"')
    expect(consent).toContain('detail: "granted"')
    expect(consent).toContain('detail: "denied"')
  })

  it("モバイルで非表示になるコードコピー文言をアクセシブル名で補う", async () => {
    const article = await read("app/blog/[slug]/blog-post-client.tsx")

    expect(article).toContain("copyBtn.type = 'button'")
    expect(article).toContain(
      "copyBtn.setAttribute('aria-label', 'コードをコピー')",
    )
    expect(article).toContain(
      "copyBtn.setAttribute('aria-label', 'コピー完了')",
    )
  })

  it("匿名用と認証用のSupabaseクライアントで認証ストレージを共有しない", async () => {
    const client = await read("lib/supabase/client.ts")

    expect(client).toContain('storageKey: "tentspace-anonymous"')
  })
})
