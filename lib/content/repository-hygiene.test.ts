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
      "docs/migration/findings.md",
      "docs/migration/runbook.md",
    ]
    for (const file of requiredFiles) {
      expect(existsSync(path.join(process.cwd(), file)), `${file} must exist`).toBe(
        true,
      )
    }

    const instructions = await readFile(
      path.join(process.cwd(), "CLAUDE.md"),
      "utf8",
    )
    expect(instructions).not.toContain("content:migrate-all")
    expect(instructions).toContain("## Article workflow")
    expect(instructions).toContain("## Branch and PR rules")
    expect(instructions).toContain("## Writing style")
    expect(instructions).toContain("## Prohibited changes")
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
