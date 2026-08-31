// @vitest-environment happy-dom

import hljs from "highlight.js/lib/core"
import bash from "highlight.js/lib/languages/bash"
import json from "highlight.js/lib/languages/json"
import { describe, expect, it } from "vitest"
import { enhanceCodeBlocks } from "./code-block-enhancement"

hljs.registerLanguage("bash", bash)
hljs.registerLanguage("json", json)

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })
  return { promise, resolve }
}

describe("enhanceCodeBlocks", () => {
  it("非同期読込中に本文が差し替わっても現在のコードブロックを装飾する", async () => {
    const container = document.createElement("div")
    container.innerHTML = `
      <pre class="ts-code" data-lang="bash"><code class="language-bash">echo old</code></pre>
    `
    document.body.appendChild(container)

    const highlighter = createDeferred<typeof hljs>()
    const enhancement = enhanceCodeBlocks(container, () => highlighter.promise)

    container.innerHTML = `
      <pre class="ts-code" data-lang="bash"><code class="language-bash"># current\necho fresh</code></pre>
      <pre class="ts-code" data-lang="json"><code class="language-json">{"enabled": true}</code></pre>
    `
    highlighter.resolve(hljs)
    await enhancement

    const blocks = container.querySelectorAll<HTMLPreElement>("pre.ts-code")
    expect(blocks).toHaveLength(2)
    for (const block of blocks) {
      expect(block.classList.contains("enhanced")).toBe(true)
      expect(block.parentElement?.className).toBe("ts-code-wrapper")
      expect(block.querySelector("code")?.classList.contains("hljs")).toBe(true)
      expect(block.querySelectorAll("code span").length).toBeGreaterThan(0)
    }
    expect(blocks[0].textContent).toContain("echo fresh")
    expect(container.textContent).not.toContain("echo old")
  })
})
