import { readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

async function read(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8")
}

describe("semantic HTML", () => {
  it("全ページ共通のスキップリンクを提供する", async () => {
    const layout = await read("app/layout.tsx")

    expect(layout).toContain('href="#main-content"')
    expect(layout).toContain("本文へスキップ")
  })

  it("主要ページの全mainランドマークをスキップリンクの着地点にする", async () => {
    const files = [
      "app/page.tsx",
      "app/about/page.tsx",
      "app/ai-development/page.tsx",
      "app/pricing/page.tsx",
      "app/contact/page.tsx",
      "app/contact/completed/page.tsx",
      "app/blog/blog-page-client.tsx",
      "app/blog/seo/page.tsx",
      "app/blog/n8n/page.tsx",
      "app/blog/categories/[slug]/category-page-client.tsx",
      "app/blog/[slug]/blog-post-client.tsx",
      "app/blog/[slug]/not-found.tsx",
      "app/blog/favorites/favorites-client.tsx",
      "app/terms/page.tsx",
      "app/privacy/page.tsx",
      "app/legal/page.tsx",
      "app/not-found.tsx",
      "app/profile/page.tsx",
      "app/settings/settings-client-layout.tsx",
      "app/unauthorized/page.tsx",
      "app/test/error-tracking/page.tsx",
      "components/error-boundary.tsx",
      "components/home/MonoDoc.tsx",
    ]

    for (const file of files) {
      const source = await read(file)
      // 文書ページ（terms/privacy/legal）は MonoDoc が main を描画する
      if (source.includes("<MonoDoc")) continue
      const mainTags = source.match(/<main\b[^>]*>/g) ?? []

      expect(mainTags.length, `${file} must render a main landmark`).toBeGreaterThan(0)
      for (const tag of mainTags) {
        expect(tag, `${file}: ${tag}`).toContain('id="main-content"')
      }
    }
  })

  it("ブログ一覧とカテゴリ一覧に記事群を表すh2を置く", async () => {
    for (const file of [
      "app/blog/blog-page-client.tsx",
      "app/blog/categories/[slug]/category-page-client.tsx",
    ]) {
      const source = await read(file)
      expect(source, file).toMatch(/<h2[^>]*className="sr-only"[^>]*>\s*記事一覧\s*<\/h2>/)
    }
  })

  it("料金プラン名をページ直下のh2にする", async () => {
    const source = await read("app/pricing/page.tsx")

    expect(source).toContain('<h2 className="text-xl font-bold text-foreground mb-1">{plan.name}</h2>')
    expect(source).not.toContain('<h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>')
  })

  it("SEO特設ページのtitleと見出し階層を重複・飛びなしにする", async () => {
    const source = await read("app/blog/seo/page.tsx")

    expect(source).toMatch(/return\s*{\s*title: "SEO特設サイト",/)
    expect(source).not.toMatch(/return\s*{\s*title: "SEO特設サイト \| tent space Blog",/)
    expect(source).not.toMatch(/<h5\b/)
    // h1 → h2 のみの階層（h3/h4への飛びなし）
    expect(source).toContain('as="h1"')
    expect(source).toContain('as="h2"')
    expect(source).not.toMatch(/<h[34]\b|as="h[34]"/)
  })

  it("情報テーブルの各行に行見出しを付ける", async () => {
    for (const file of ["app/terms/page.tsx", "app/privacy/page.tsx", "app/legal/page.tsx"]) {
      const source = await read(file)
      const rowCount = source.match(/<tr\b/g)?.length ?? 0
      const rowHeaderCount = source.match(/<th\b[^>]*scope="row"/g)?.length ?? 0

      // テーブルを使う場合は全行に行見出しを付ける（mono-doc化で表を持たないページは0行）
      expect(rowHeaderCount, file).toBe(rowCount)
    }
  })

  it("問い合わせ入力にブラウザ補完の意味を付ける", async () => {
    const source = await read("app/contact/contact-form.tsx")

    expect(source).toContain('autoComplete="name"')
    expect(source).toContain('autoComplete="email"')
    expect(source).toContain('autoComplete="organization"')
    expect(source).toContain('autoComplete="tel"')
  })

  it("ブログ検索欄に明示的なラベルを付ける", async () => {
    const source = await read("app/blog/blog-page-client.tsx")

    expect(source).toContain('<label htmlFor="blog-search" className="sr-only">')
    expect(source).toContain('id="blog-search"')
    expect(source).toContain('name="query"')
  })

  it("Cookie通知を名前付きregionとして公開する", async () => {
    const source = await read("components/cookie-consent.tsx")

    expect(source).toContain('role="region"')
    expect(source).toContain('aria-labelledby="cookie-consent-title"')
    expect(source).toContain('aria-describedby="cookie-consent-description"')
    expect(source).toContain('id="cookie-consent-title"')
    expect(source).toContain('id="cookie-consent-description"')
  })

  it("ロゴ一覧のReactノードへアクセシブルな画像名を与える", async () => {
    const source = await read("components/LogoLoop.tsx")

    expect(source).toContain("role={isNodeItem && itemAriaLabel ? 'img' : undefined}")
    expect(source).toContain("aria-label={isNodeItem ? itemAriaLabel : undefined}")
  })

  it("フッターリンクを名前付きナビゲーションとして公開する", async () => {
    const source = await read("components/home/MonoFooter.tsx")

    expect(source).toContain('aria-label="フッターナビゲーション"')
  })

  it("トップとアバウトで低コントラスト文字を避ける", async () => {
    const [home, about] = await Promise.all([
      read("app/page.tsx"),
      read("app/about/page.tsx"),
    ])

    expect(home).not.toContain("text-primary/80")
    expect(home).toContain("MonoShell")
    expect(about).toContain("MonoShell")
    expect(about).not.toContain("text-white/40")
    expect(about).not.toContain("text-blue-500/50")
    expect(about).not.toContain("text-blue-500/10")
  })

  it("白背景上の小さい強調文字にAA相当の濃色を使う", async () => {
    const [development, pricing, terms, privacy, legal] = await Promise.all([
      read("app/ai-development/page.tsx"),
      read("app/pricing/page.tsx"),
      read("app/terms/page.tsx"),
      read("app/privacy/page.tsx"),
      read("app/legal/page.tsx"),
    ])

    expect(development).not.toContain("bg-blue-50 font-bold text-red-500")
    expect(development).not.toContain("text-blue-200 text-sm")
    expect(development).not.toContain("text-red-600 font-bold")
    expect(pricing).not.toContain("bg-violet-500/10 text-violet-500")
    expect(pricing).not.toContain("text-xs text-green-500")
    for (const source of [terms, privacy, legal]) {
      expect(source).not.toContain("text-blue-500 text-xs")
    }
  })

  it("記事UIの小文字とシェアボタンをAA相当の配色にする", async () => {
    const [article, comments] = await Promise.all([
      read("app/blog/[slug]/blog-post-client.tsx"),
      read("components/blog-comments.tsx"),
    ])

    expect(article).not.toContain("bg-blue-500/10 text-blue-500")
    expect(article).not.toContain("bg-[#1877F2]")
    expect(article).not.toContain("bg-[#00A4DE]")
    expect(article).not.toContain("bg-[#06C755]")
    expect(comments).not.toContain("text-gray-400 dark:text-gray-500")
  })

  it("フッターの背景ごとに読める前景色を使う", async () => {
    const pageFooter = await read("components/page-footer.tsx")

    expect(pageFooter).toContain("text-primary-foreground")
    expect(pageFooter).not.toContain("text-background/60")
    expect(pageFooter).not.toContain("text-primary-foreground/80")
  })

  it("ロゴの内側のSVGを装飾要素として隠す", async () => {
    const source = await read("components/LogoLoop.tsx")

    expect(source).toContain("React.cloneElement")
    expect(source).toContain("'aria-hidden': true")
    expect(source).toContain("focusable: false")
  })

  it("記事本文リンクを色以外でも識別できるようにする", async () => {
    const source = await read("app/globals.css")
    const linkRule = source.match(/\.article-content a \{[\s\S]*?\}/)?.[0] ?? ""

    expect(linkRule).toContain("text-decoration: underline")
    expect(linkRule).toContain("text-underline-offset")
  })

  it("コードのスクロールをフォーカス可能なpreだけに集約する", async () => {
    const source = await read("app/globals.css")
    const highlightedCodeRule = source.match(
      /\.ts-code-wrapper pre\.ts-code code\.hljs \{[\s\S]*?\}/,
    )?.[0] ?? ""

    expect(highlightedCodeRule).toContain("overflow-x: visible")
  })

  it("ブログカードの小さい引用文に透明色を使わない", async () => {
    for (const file of [
      "app/blog/blog-page-client.tsx",
      "app/blog/categories/[slug]/category-page-client.tsx",
    ]) {
      const source = await read(file)
      expect(source, file).not.toContain("text-muted-foreground/70")
    }
  })

  it("補助画面にもh1を置き、操作ボタンの文字コントラストを保つ", async () => {
    const [unauthorized, errorDemo] = await Promise.all([
      read("app/unauthorized/page.tsx"),
      read("components/error-tracking-demo.tsx"),
    ])

    expect(unauthorized).toContain('as="h1"')
    expect(unauthorized).toContain("access denied")
    expect(errorDemo).toContain('<h1 className="text-3xl font-bold mb-2">')
    expect(errorDemo).not.toContain("<h3")
    expect(errorDemo).not.toContain("bg-orange-600 text-white")
    expect(errorDemo).not.toContain("bg-green-600 text-white")
  })
})
