import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { renderMdxToHtml } from "./render-mdx"

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
    expect(html).toContain("const source")
  })

  it("埋め込みコンポーネントを安全なHTMLへ変換する", async () => {
    const html = await renderMdxToHtml(
      '<YouTube id="dQw4w9WgXcQ" title="動画サンプル" />',
    )

    expect(html).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ")
    expect(html).toContain('title="動画サンプル"')
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
})
