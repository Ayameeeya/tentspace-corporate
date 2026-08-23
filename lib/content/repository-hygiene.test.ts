import { existsSync } from "node:fs"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"

const excludedDirectories = new Set([
  ".git",
  ".next",
  ".playwright-cli",
  "node_modules",
  "output",
])
const textExtensions = new Set([
  ".csv",
  ".d.ts",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".ts",
  ".tsx",
])
const retiredCmsMarkers = [
  "word" + "press",
  "wp" + "-json",
  "wp" + "-content",
  "blog" + ".tentspace.net",
  "word" + "press" + "_user_id",
]
// 技術スタックに載せているCMSのロゴ表記は提供サービスであり、移行元の識別子ではない
const allowedFiles = new Set(["components/home/stack-logos.tsx"])

async function findRetiredCmsReferences(directory: string): Promise<string[]> {
  const matches: string[] = []

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excludedDirectories.has(entry.name)) continue

    const absolutePath = path.join(directory, entry.name)
    const relativePath = path.relative(process.cwd(), absolutePath)
    const normalizedPath = relativePath.toLowerCase()
    if (retiredCmsMarkers.some((marker) => normalizedPath.includes(marker))) {
      matches.push(relativePath)
    }

    if (entry.isDirectory()) {
      matches.push(...(await findRetiredCmsReferences(absolutePath)))
      continue
    }

    if (!textExtensions.has(path.extname(entry.name))) continue
    if (allowedFiles.has(relativePath)) continue
    const source = (await readFile(absolutePath, "utf8")).toLowerCase()
    if (retiredCmsMarkers.some((marker) => source.includes(marker))) {
      matches.push(relativePath)
    }
  }

  return [...new Set(matches)].sort()
}

describe("repository hygiene", () => {
  it("retired CMS identifiers are absent from repository files and paths", async () => {
    expect(await findRetiredCmsReferences(process.cwd())).toEqual([])
  })

  it("記事運用と移行手順のドキュメントが揃っている", async () => {
    const requiredFiles = [
      "CLAUDE.md",
      "app/content-manifest.json/route.ts",
      "app/llms.txt/route.ts",
      "app/blog/[slug]/index.md/route.ts",
      "content/link-card-cache.json",
      "docs/writing-guide.md",
      "docs/migration/findings.md",
      "docs/migration/runbook.md",
    ]
    for (const file of requiredFiles) {
      expect(existsSync(path.join(process.cwd(), file)), `${file} must exist`).toBe(
        true,
      )
    }

    const claudeInstructions = await readFile(
      path.join(process.cwd(), "CLAUDE.md"),
      "utf8",
    )
    const sharedInstructions = await readFile(
      path.join(process.cwd(), "AGENTS.md"),
      "utf8",
    )
    expect(claudeInstructions).toBe("@AGENTS.md\n")
    expect(sharedInstructions).not.toContain("content:migrate-all")
    expect(sharedInstructions).toContain("## コンテンツ規約")
    expect(sharedInstructions).toContain("## ブランチ・PR 規約")
    expect(sharedInstructions).toContain("## 禁止事項")

    const writingGuide = await readFile(
      path.join(process.cwd(), "docs/writing-guide.md"),
      "utf8",
    )
    expect(writingGuide).toContain('<LinkCard slug="')
    expect(writingGuide).toContain('<LinkCard url="https://')
    expect(writingGuide).toContain('<Dialogue>')
    expect(writingGuide).toContain('<Say by="hiro">')
    expect(writingGuide).toContain("記事冒頭の導入フック専用")
    expect(writingGuide).toContain("3〜6 往復")
    expect(writingGuide).toContain("実在した会話の再構成のみ")
    expect(writingGuide).toContain('mood="troubled"')
    expect(writingGuide).toContain('mood="angry"')
    expect(writingGuide).toContain('mood="crying"')
    expect(writingGuide).toContain("コンポーネントを追加したら")

    const dialogueAssetGuide = await readFile(
      path.join(process.cwd(), "public/assets/dialogue/README.md"),
      "utf8",
    )
    expect(dialogueAssetGuide).toContain("差し替え")
  })

  it("公開URLは一つのSITE_URL定義を使う", async () => {
    expect(existsSync(path.join(process.cwd(), "lib/site.ts"))).toBe(true)

    const files = [
      "app/blog/[slug]/page.tsx",
      "app/blog/layout.tsx",
      "app/feed/route.ts",
      "app/robots.ts",
      "app/sitemap.ts",
    ]
    for (const file of files) {
      const source = await readFile(path.join(process.cwd(), file), "utf8")
      expect(source, file).not.toMatch(/const SITE_URL\s*=/)
      expect(source, file).toContain("@/lib/site")
    }
  })
})
