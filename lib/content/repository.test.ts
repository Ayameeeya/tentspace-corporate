import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  loadPostBySlug,
  readPostFiles,
  validateContentRepository,
} from "./repository"

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

  it("全記事を検証し、MDXコンパイルエラーを報告する", async () => {
    const postsDirectory = await createRepository()
    await createPost(postsDirectory, "valid-post")
    await createPost(postsDirectory, "broken-post", "<YouTube")

    await expect(validateContentRepository(postsDirectory)).rejects.toThrow(
      /broken-post\/index\.mdx/,
    )
  })
})
