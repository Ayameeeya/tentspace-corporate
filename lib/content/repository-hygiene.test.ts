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
})
