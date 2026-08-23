import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it, vi } from "vitest"
import { renderMdxToHtml } from "./render-mdx"

async function createLinkCardPost(
  postsDirectory: string,
  slug: string,
  metadata: { title: string; description: string; ogImage?: string },
) {
  const postDirectory = path.join(postsDirectory, slug)
  await mkdir(postDirectory, { recursive: true })
  await writeFile(
    path.join(postDirectory, "index.mdx"),
    `---
title: "${metadata.title}"
description: "${metadata.description}"
date: 2026-08-24
slug: ${slug}
tags: [MDX]
draft: false
${metadata.ogImage ? `ogImage: "${metadata.ogImage}"` : ""}
---

本文です。
`,
  )
}

describe("renderMdxToHtml", () => {
  it("既存記事DOMが期待する見出し・表・コード構造へ変換する", async () => {
    const html = await renderMdxToHtml(`## 導入

| 項目 | 内容 |
| --- | --- |
| CMS | MDX |

\`\`\`typescript
const source = "mdx"
\`\`\`
`)

    expect(html).toContain("<h2>導入</h2>")
    expect(html).toContain("<table>")
    expect(html).toContain('class="ts-code"')
    expect(html).toContain('data-lang="typescript"')
    expect(html).toContain('tabindex="0"')
    expect(html).toContain("const source")
  })

  it("言語指定のないコードブロックもキーボードでスクロールできる", async () => {
    const html = await renderMdxToHtml(`\`\`\`
const source = "mdx"
\`\`\`
`)

    expect(html).toContain('<pre tabindex="0"><code>')
  })

  it("埋め込みコンポーネントを安全なHTMLへ変換する", async () => {
    const html = await renderMdxToHtml(
      '<YouTube id="dQw4w9WgXcQ" title="動画サンプル" />',
    )

    expect(html).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ")
    expect(html).toContain('title="動画サンプル"')
  })

  it("Dialogueを話者ごとの左右・表示名・アバター付きで描画する", async () => {
    const html = await renderMdxToHtml(`<Dialogue>
  <Say by="hiro">別スレッドの内容を記事化したいです。</Say>
  <Say by="ai">導入の会話として再構成しましょう。</Say>
</Dialogue>`)

    expect(html).toContain('class="dialogue"')
    expect(html).toContain('aria-label="記事導入の会話"')
    expect(html).toContain(
      'class="dialogue__turn dialogue__turn--right dialogue__turn--hiro"',
    )
    expect(html).toContain(
      'class="dialogue__turn dialogue__turn--left dialogue__turn--ai"',
    )
    expect(html).toContain('class="dialogue__speaker-name">Hiro</span>')
    expect(html).toContain('class="dialogue__speaker-name">AI</span>')
    expect(html).toContain('src="/assets/dialogue/hiro.webp"')
    expect(html).toContain('src="/assets/dialogue/ai.webp"')
    expect(html).toContain("別スレッドの内容を記事化したいです。")
    expect(html).toContain("導入の会話として再構成しましょう。")
  })

  it("Dialogueの未定義話者をビルド時に報告する", async () => {
    await expect(
      renderMdxToHtml(
        '<Dialogue><Say by="unknown">誰でしょう</Say></Dialogue>',
      ),
    ).rejects.toThrow(/unknown.*hiro.*ai/i)
  })

  it("Dialogueのbyは静的な文字列として必須にする", async () => {
    await expect(
      renderMdxToHtml('<Dialogue><Say>話者なし</Say></Dialogue>'),
    ).rejects.toThrow(/Say.*by.*required/i)

    await expect(
      renderMdxToHtml(
        '<Dialogue><Say by={"hiro"}>動的指定</Say></Dialogue>',
      ),
    ).rejects.toThrow(/Say.*by.*static string literal/i)
  })

  it("Dialogueの表情moodに対応するアバターを描画する", async () => {
    const html = await renderMdxToHtml(`<Dialogue>
  <Say by="hiro" mood="troubled">困りました。</Say>
  <Say by="ai" mood="angry">それは困ります。</Say>
  <Say by="hiro" mood="crying">悲しいです。</Say>
</Dialogue>`)

    expect(html).toContain('src="/assets/dialogue/hiro-troubled.webp"')
    expect(html).toContain('src="/assets/dialogue/ai-angry.webp"')
    expect(html).toContain('src="/assets/dialogue/hiro-crying.webp"')
    expect(html).toContain('data-dialogue-mood="troubled"')
    expect(html).toContain('data-dialogue-mood="angry"')
    expect(html).toContain('data-dialogue-mood="crying"')
  })

  it("Dialogueの未定義moodをビルド時に報告する", async () => {
    await expect(
      renderMdxToHtml(
        '<Dialogue><Say by="hiro" mood="surprised">びっくり</Say></Dialogue>',
      ),
    ).rejects.toThrow(/unknown.*mood.*surprised.*normal.*troubled.*angry.*crying/i)
  })

  it("ローカル画像の寸法をビルド時にHTMLへ付与する", async () => {
    const publicDirectory = await mkdtemp(path.join(os.tmpdir(), "mdx-images-"))
    const imageDirectory = path.join(publicDirectory, "blog-assets")
    await mkdir(imageDirectory)
    await writeFile(
      path.join(imageDirectory, "pixel.png"),
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      ),
    )

    try {
      const html = await renderMdxToHtml(
        "![1ピクセル画像](/blog-assets/pixel.png)",
        { publicDirectory },
      )

      expect(html).toContain('width="1"')
      expect(html).toContain('height="1"')
    } finally {
      await rm(publicDirectory, { recursive: true, force: true })
    }
  })

  it("片方だけ指定されたローカル画像の寸法を補完する", async () => {
    const publicDirectory = await mkdtemp(path.join(os.tmpdir(), "mdx-images-"))
    const imageDirectory = path.join(publicDirectory, "blog-assets")
    await mkdir(imageDirectory)
    await writeFile(
      path.join(imageDirectory, "pixel.png"),
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      ),
    )

    try {
      const html = await renderMdxToHtml(
        '<img src="/blog-assets/pixel.png" alt="1ピクセル画像" width="1" />',
        { publicDirectory },
      )

      expect(html.match(/width="1"/g)).toHaveLength(1)
      expect(html).toContain('height="1"')
    } finally {
      await rm(publicDirectory, { recursive: true, force: true })
    }
  })

  it("LinkCardの内部slugを記事メタデータから解決する", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "link-card-internal-"))
    const postsDirectory = path.join(root, "posts")
    await mkdir(postsDirectory)
    await createLinkCardPost(postsDirectory, "related-post", {
      title: "関連する内部記事",
      description: "内部リンクカードの説明文です。",
      ogImage: "/blog-assets/related-post/featured.webp",
    })

    try {
      const html = await renderMdxToHtml(
        '<LinkCard slug="related-post" />',
        { postsDirectory },
      )

      expect(html).toContain('class="link-card link-card--internal"')
      expect(html).toContain('href="/blog/related-post"')
      expect(html).not.toContain('target="_blank"')
      expect(html).toContain("関連する内部記事")
      expect(html).toContain("内部リンクカードの説明文です。")
      expect(html).toContain(
        'src="/blog-assets/related-post/featured.webp"',
      )
      expect(html).toContain('class="link-card__image"')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("LinkCardの存在しない内部slugをビルド時に報告する", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "link-card-missing-"))
    const postsDirectory = path.join(root, "posts")
    await mkdir(postsDirectory)

    try {
      await expect(
        renderMdxToHtml('<LinkCard slug="missing-post" />', {
          postsDirectory,
        }),
      ).rejects.toThrow(/missing-post/)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("外部URLのOGPを取得しUser-Agent付きカードを描画する", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "link-card-external-"))
    const cachePath = path.join(root, "link-card-cache.json")
    const fetcher = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("user-agent")).toMatch(/tent space/i)
      expect(init?.redirect).toBe("follow")
      expect(init?.signal).toBeInstanceOf(AbortSignal)
      return new Response(
        `<!doctype html><html><head>
          <meta property="og:title" content="Cloudflare &amp; Workers">
          <meta content="&lt;script&gt;alert(1)&lt;/script&gt; 安全な説明" property="og:description">
          <meta property="og:image" content="/og/worker.png">
          <link rel="icon" href="/favicon.ico">
        </head></html>`,
        {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        },
      )
    })

    try {
      const html = await renderMdxToHtml(
        '<LinkCard url="https://example.com/reference" />',
        { cachePath, fetcher },
      )

      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(html).toContain('class="link-card link-card--external"')
      expect(html).toContain('href="https://example.com/reference"')
      expect(html).toContain('target="_blank"')
      expect(html).toContain('rel="noopener noreferrer"')
      expect(html).toContain("Cloudflare &amp; Workers")
      expect(html).toContain(
        "&lt;script&gt;alert(1)&lt;/script&gt; 安全な説明",
      )
      expect(html).not.toContain("<script>alert(1)</script>")
      expect(html).toContain('src="https://example.com/og/worker.png"')
      expect(html).toContain('src="https://example.com/favicon.ico"')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("外部OGP取得結果を保存し2回目はキャッシュから描画する", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "link-card-cache-"))
    const cachePath = path.join(root, "link-card-cache.json")
    const fetcher = vi.fn(async () =>
      new Response(
        '<meta property="og:title" content="Cached title"><meta property="og:description" content="Cached description">',
        { status: 200, headers: { "content-type": "text/html" } },
      ),
    )

    try {
      const source = '<LinkCard url="https://example.com/cached" />'
      await renderMdxToHtml(source, { cachePath, fetcher })
      const secondHtml = await renderMdxToHtml(source, { cachePath, fetcher })

      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(secondHtml).toContain("Cached title")
      expect(await readFile(cachePath, "utf8")).toContain(
        "https://example.com/cached",
      )
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("キャッシュ内の予約フィールドで外部リンク先を上書きさせない", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "link-card-cache-safe-"))
    const cachePath = path.join(root, "link-card-cache.json")
    await writeFile(
      cachePath,
      JSON.stringify({
        version: 1,
        entries: {
          "https://example.com/safe": {
            title: "Cached title",
            description: "Cached description",
            domain: "example.com",
            kind: "fallback",
            href: "javascript:alert(1)",
          },
        },
      }),
    )

    try {
      const html = await renderMdxToHtml(
        '<LinkCard url="https://example.com/safe" />',
        { cachePath },
      )

      expect(html).toContain('class="link-card link-card--external"')
      expect(html).toContain('href="https://example.com/safe"')
      expect(html).not.toContain("javascript:")
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("外部OGP取得失敗時は警告してプレーンリンクへフォールバックする", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "link-card-fallback-"))
    const warn = vi.fn()
    const fetcher = vi.fn(async () => {
      throw new Error("network unavailable")
    })

    try {
      const html = await renderMdxToHtml(
        '<LinkCard url="https://unavailable.example/reference" />',
        {
          cachePath: path.join(root, "link-card-cache.json"),
          fetcher,
          logger: { warn },
        },
      )

      expect(html).toBe(
        '<a class="link-card-fallback" href="https://unavailable.example/reference" target="_blank" rel="noopener noreferrer">https://unavailable.example/reference</a>',
      )
      expect(warn).toHaveBeenCalledWith(
        expect.stringMatching(/LinkCard.*unavailable\.example/i),
      )
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
