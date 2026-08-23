import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import * as repository from "./repository"
import { loadPostMarkdownBySlug } from "./markdown"

const { loadPostBySlug, readPostFiles, validateContentRepository } = repository

const temporaryDirectories: string[] = []

async function createPost(
  postsDirectory: string,
  slug: string,
  body = "## 本文\n\nMDXで管理します。",
  extraFrontmatter = "",
) {
  const directory = path.join(postsDirectory, slug)
  await mkdir(directory, { recursive: true })
  await writeFile(
    path.join(directory, "index.mdx"),
    `---
title: "${slug}の記事"
description: "リポジトリから読み込む記事のテストです。"
date: 2026-08-11
slug: ${slug}
tags: [MDX]
${extraFrontmatter}---

${body}
`,
  )
}

async function createRepository() {
  const root = await mkdtemp(path.join(os.tmpdir(), "tentspace-content-"))
  temporaryDirectories.push(root)
  const postsDirectory = path.join(root, "posts")
  await mkdir(postsDirectory)
  return postsDirectory
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe("content repository", () => {
  it("content/posts配下のindex.mdxだけを安定した順序で読む", async () => {
    const postsDirectory = await createRepository()
    await createPost(postsDirectory, "second-post")
    await createPost(postsDirectory, "first-post")
    await writeFile(path.join(postsDirectory, "README.md"), "ignored")

    const files = await readPostFiles(postsDirectory)

    expect(files.map((file) => path.basename(path.dirname(file.sourcePath)))).toEqual([
      "first-post",
      "second-post",
    ])
  })

  it("slugから本文とHTMLを読み込む", async () => {
    const postsDirectory = await createRepository()
    await createPost(postsDirectory, "mdx-post", "## 導入\n\n**本文**です。")

    const post = await loadPostBySlug("mdx-post", postsDirectory)

    expect(post?.metadata.slug).toBe("mdx-post")
    expect(post?.contentHtml).toContain("<h2>導入</h2>")
    expect(post?.contentHtml).toContain("<strong>本文</strong>")
    await expect(loadPostBySlug("missing", postsDirectory)).resolves.toBeNull()
  })

  it("公開記事のMDXソースをMarkdown配信用に読み込む", async () => {
    const postsDirectory = await createRepository()
    await createPost(postsDirectory, "markdown-post", "## Markdown本文")
    await createPost(
      postsDirectory,
      "draft-post",
      "## 下書き",
      "draft: true\n",
    )

    await expect(
      loadPostMarkdownBySlug("markdown-post", postsDirectory),
    ).resolves.toContain("## Markdown本文")
    await expect(
      loadPostMarkdownBySlug("draft-post", postsDirectory),
    ).resolves.toBeNull()
    await expect(
      loadPostMarkdownBySlug("../invalid", postsDirectory),
    ).resolves.toBeNull()
  })

  it("全記事を検証し、MDXコンパイルエラーを報告する", async () => {
    const postsDirectory = await createRepository()
    await createPost(postsDirectory, "valid-post")
    await createPost(postsDirectory, "broken-post", "<YouTube")

    await expect(validateContentRepository(postsDirectory)).rejects.toThrow(
      /broken-post\/index\.mdx/,
    )
  })

  it("編集した1記事だけをfrontmatterとMDXまで検証する", async () => {
    const postsDirectory = await createRepository()
    await createPost(postsDirectory, "valid-draft", "## 下書き", "draft: true\n")
    await createPost(postsDirectory, "broken-draft", "<YouTube", "draft: true\n")
    await createPost(
      postsDirectory,
      "invalid-neighbor",
      "## 未編集中の記事",
      "slug: INVALID_NEIGHBOR\n",
    )
    const validatePostFile = (
      repository as typeof repository & {
        validatePostFile?: (
          sourcePath: string,
          postsDirectory?: string,
        ) => Promise<void>
      }
    ).validatePostFile

    expect(typeof validatePostFile).toBe("function")
    if (!validatePostFile) return

    await expect(
      validatePostFile(
        path.join(postsDirectory, "valid-draft", "index.mdx"),
        postsDirectory,
      ),
    ).resolves.toBeUndefined()
    await expect(
      validatePostFile(
        path.join(postsDirectory, "broken-draft", "index.mdx"),
        postsDirectory,
      ),
    ).rejects.toThrow(/broken-draft\/index\.mdx/)
  })

  it("存在しないローカル画像を報告する", async () => {
    const postsDirectory = await createRepository()
    const publicDirectory = path.join(path.dirname(postsDirectory), "public")
    await mkdir(publicDirectory)
    await createPost(
      postsDirectory,
      "broken-image",
      "![存在しない画像](/blog-assets/missing.webp)",
    )

    await expect(
      validateContentRepository(postsDirectory, { publicDirectory }),
    ).rejects.toThrow(/missing.*image|image.*missing/i)
  })

  it("外部画像URLを記事本文に直接指定した場合は報告する", async () => {
    const postsDirectory = await createRepository()
    const publicDirectory = path.join(path.dirname(postsDirectory), "public")
    await mkdir(publicDirectory)
    await createPost(
      postsDirectory,
      "remote-image",
      "![外部画像](https://example.com/image.webp)",
    )

    await expect(
      validateContentRepository(postsDirectory, { publicDirectory }),
    ).rejects.toThrow(/external.*image|image.*external/i)
  })

  it("相対画像パスを記事本文に直接指定した場合は報告する", async () => {
    const postsDirectory = await createRepository()
    const publicDirectory = path.join(path.dirname(postsDirectory), "public")
    await mkdir(publicDirectory)
    await createPost(
      postsDirectory,
      "relative-image",
      "![相対画像](images/example.webp)",
    )

    await expect(
      validateContentRepository(postsDirectory, { publicDirectory }),
    ).rejects.toThrow(/root-relative|relative.*image|image.*relative/i)
  })

  it("許可済みコンポーネントの埋め込みURLは外部画像として扱わない", async () => {
    const postsDirectory = await createRepository()
    const publicDirectory = path.join(path.dirname(postsDirectory), "public")
    await mkdir(publicDirectory)
    await createPost(
      postsDirectory,
      "video-embed",
      '<YouTube id="dQw4w9WgXcQ" title="動画サンプル" />',
    )

    await expect(
      validateContentRepository(postsDirectory, { publicDirectory }),
    ).resolves.toHaveLength(1)
  })

  it("存在しない記事への内部リンクを報告する", async () => {
    const postsDirectory = await createRepository()
    const publicDirectory = path.join(path.dirname(postsDirectory), "public")
    await mkdir(publicDirectory)
    await createPost(
      postsDirectory,
      "broken-link",
      "[存在しない記事](/blog/missing-post)",
    )

    await expect(
      validateContentRepository(postsDirectory, { publicDirectory }),
    ).rejects.toThrow(/missing.*post|post.*missing/i)
  })

  it("LinkCardの存在しない内部slugを記事ファイル付きで報告する", async () => {
    const postsDirectory = await createRepository()
    const publicDirectory = path.join(path.dirname(postsDirectory), "public")
    await mkdir(publicDirectory)
    await createPost(
      postsDirectory,
      "broken-link-card",
      '<LinkCard slug="missing-card-post" />',
    )

    await expect(
      validateContentRepository(postsDirectory, { publicDirectory }),
    ).rejects.toThrow(
      /broken-link-card\/index\.mdx[\s\S]*missing-card-post/,
    )
  })

  it("外部LinkCard内のOGP画像は通常の外部画像禁止に含めない", async () => {
    const postsDirectory = await createRepository()
    const root = path.dirname(postsDirectory)
    const publicDirectory = path.join(root, "public")
    await mkdir(publicDirectory)
    await createPost(
      postsDirectory,
      "external-link-card",
      '<LinkCard url="https://example.com/reference" />',
    )
    const fetcher = vi.fn(async () =>
      new Response(
        '<meta property="og:title" content="Reference"><meta property="og:image" content="https://cdn.example.com/og.png">',
        { status: 200, headers: { "content-type": "text/html" } },
      ),
    )

    const manifest = await validateContentRepository(postsDirectory, {
      publicDirectory,
      cachePath: path.join(root, "link-card-cache.json"),
      fetcher,
    })

    expect(manifest).toHaveLength(1)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
