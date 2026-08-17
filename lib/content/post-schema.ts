import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"

export const postFrontmatterSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(160),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must use lowercase ASCII and hyphens"),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  ogImage: z.string().optional(),
  experiment: z
    .object({
      hook: z.enum(["question", "number", "contrarian", "story", "howto"]),
      cta: z.enum([
        "inquiry",
        "app-download",
        "camp-reservation",
        "note-paid",
      ]),
      targetKw: z.string().min(1),
      utmCampaign: z.string().min(1),
    })
    .optional(),
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>

export interface ContentManifestEntry {
  id: number
  slug: string
  title: string
  description: string
  date: string
  updated: string
  categories: string[]
  tags: string[]
  draft: false
  readingTime: number
  wordCount: number
  ogImage?: string
  experiment?: {
    hook: "question" | "number" | "contrarian" | "story" | "howto"
    cta: "inquiry" | "app-download" | "camp-reservation" | "note-paid"
    targetKw: string
    utmCampaign: string
  }
}

export interface ParsedPostSource {
  metadata: PostFrontmatter
  body: string
  sourcePath: string
}

function stableId(slug: string): number {
  let hash = 2166136261
  for (const character of slug) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function countReadableCharacters(body: string): number {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`\[\]()|:-]/g, " ")
    .replace(/\s+/g, "")
    .length
}

export function parsePostSource(source: string, sourcePath: string): ParsedPostSource {
  const parsed = matter(source)
  const metadata = postFrontmatterSchema.parse(parsed.data)
  const directorySlug = path.basename(path.dirname(sourcePath))

  if (directorySlug !== metadata.slug) {
    throw new Error(
      `Post directory "${directorySlug}" must match frontmatter slug "${metadata.slug}"`,
    )
  }

  return {
    metadata,
    body: parsed.content.trim(),
    sourcePath,
  }
}

export function createContentManifest(
  files: Array<{ source: string; sourcePath: string }>,
): ContentManifestEntry[] {
  return files
    .map(({ source, sourcePath }) => parsePostSource(source, sourcePath))
    .filter(({ metadata }) => !metadata.draft)
    .map(({ metadata, body }) => {
      const wordCount = countReadableCharacters(body)
      return {
        id: stableId(metadata.slug),
        slug: metadata.slug,
        title: metadata.title,
        description: metadata.description,
        date: metadata.date.toISOString(),
        updated: (metadata.updated ?? metadata.date).toISOString(),
        categories:
          metadata.categories.length > 0 ? metadata.categories : metadata.tags,
        tags: metadata.tags,
        draft: false as const,
        readingTime: Math.max(1, Math.ceil(wordCount / 400)),
        wordCount,
        ...(metadata.ogImage ? { ogImage: metadata.ogImage } : {}),
        ...(metadata.experiment ? { experiment: metadata.experiment } : {}),
      }
    })
    .sort((left, right) => right.date.localeCompare(left.date))
}
