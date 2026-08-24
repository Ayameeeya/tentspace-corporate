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

  it("同意前もGoogleタグを読み込みdenied状態で計測を開始する", async () => {
    const [layout, analytics] = await Promise.all([
      read("app/layout.tsx"),
      readOptional("components/google-analytics.tsx"),
    ])

    expect(layout).toContain("'analytics_storage': 'denied'")
    expect(layout).toContain("<GoogleAnalytics />")
    expect(analytics).toContain("googletagmanager.com/gtag/js")
    expect(analytics).toContain('cookie_consent=')
    expect(analytics).not.toContain("if (!enabled) return null")
    expect(analytics).toContain('strategy="afterInteractive"')
  })

  it("同意前のcookieless pingをプライバシーポリシーで説明する", async () => {
    const privacy = await read("app/privacy/page.tsx")

    expect(privacy).toContain("Cookieを使用しない測定信号")
    expect(privacy).toContain("同意後にのみ")
  })

  it("gtag命令をGoogle標準のarguments形式でキューへ積む", async () => {
    const analytics = await read("components/google-analytics.tsx")

    expect(analytics).toContain("dataLayer.push(arguments)")
    expect(analytics).not.toContain("dataLayer.push(args)")
  })

  it("hydration後にAdSenseのサイト所有権確認コードを一度だけ読み込む", async () => {
    const layout = await read("app/layout.tsx")
    const adsenseScripts = layout.match(/<Script[\s\S]*?adsbygoogle\.js[\s\S]*?\/>/g) ?? []

    expect(adsenseScripts).toHaveLength(1)
    expect(adsenseScripts[0]).toContain('id="adsbygoogle-loader"')
    expect(adsenseScripts[0]).toContain('strategy="afterInteractive"')
    expect(adsenseScripts[0]).toContain(
      "client=ca-pub-1533933816704006",
    )
    expect(adsenseScripts[0]).toContain('crossOrigin="anonymous"')
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
    const [header, menu, article] = await Promise.all([
      read("components/home/TentBlogNav.tsx"),
      read("components/home/TentMenu.tsx"),
      read("app/blog/[slug]/blog-post-client.tsx"),
    ])

    // ヘッダー内のトップページへのリンクはすべて prefetch を止める
    const homeLinks = header.match(/<Link(?=[^>]*href="\/")[^>]*>/g) ?? []
    expect(homeLinks.length).toBeGreaterThan(0)
    for (const link of homeLinks) {
      expect(link).toContain("prefetch={false}")
    }
    // フルスクリーンメニューのページリンク（about / blog / contact）も同様
    expect(menu).toMatch(/<Link(?=[^>]*prefetch=\{false\})[^>]*href=\{e\.href\}/)
    expect(article).toMatch(/<Link\s+href="\/"\s+prefetch=\{false\}/)

    const aboutLinks = article.match(/<Link(?=[^>]*href="\/about")[^>]*>/g) ?? []
    expect(aboutLinks.length).toBeGreaterThan(0)
    for (const link of aboutLinks) {
      expect(link).toContain("prefetch={false}")
    }
  })

  it("ブログヘッダーの認証モーダルを初期JSから外す", async () => {
    const header = await read("components/home/TentBlogNav.tsx")

    expect(header).not.toContain('from "gsap"')
    expect(header).toMatch(/lazy\(\(\)\s*=>\s*import\("@\/components\/auth-modal"\)/)
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
    const header = await read("components/home/TentBlogNav.tsx")
    const logos = header.match(/<img[\s\S]*?logo_(?:black|white)_symbol\.png[\s\S]*?\/>/g) ?? []

    expect(logos.length).toBeGreaterThan(0)
    for (const logo of logos) {
      expect(logo).toContain("width={273}")
      expect(logo).toContain("height={183}")
    }
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
