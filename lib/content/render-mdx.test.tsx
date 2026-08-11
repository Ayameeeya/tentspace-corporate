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
})
