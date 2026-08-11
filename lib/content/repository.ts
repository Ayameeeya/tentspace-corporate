import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { createContentManifest, parsePostSource } from "./post-schema"
import { renderMdxToHtml } from "./render-mdx"

export const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts")

export interface PostFile {
  source: string
  sourcePath: string
}

export async function readPostFiles(
  postsDirectory = POSTS_DIRECTORY,
): Promise<PostFile[]> {
  const entries = await readdir(postsDirectory, { withFileTypes: true })
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))

  const files = await Promise.all(
    directories.map(async (directory): Promise<PostFile | null> => {
      const sourcePath = path.join(postsDirectory, directory.name, "index.mdx")
      try {
        return { source: await readFile(sourcePath, "utf8"), sourcePath }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
        throw error
      }
    }),
  )

  return files.filter((file): file is PostFile => file !== null)
}

export async function getContentManifest(postsDirectory = POSTS_DIRECTORY) {
  return createContentManifest(await readPostFiles(postsDirectory))
}

export async function loadPostBySlug(
  slug: string,
  postsDirectory = POSTS_DIRECTORY,
) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null

  const sourcePath = path.join(postsDirectory, slug, "index.mdx")
  let source: string
  try {
    source = await readFile(sourcePath, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }

  const parsed = parsePostSource(source, sourcePath)
  if (parsed.metadata.draft) return null

  return {
    ...parsed,
    contentHtml: await renderMdxToHtml(parsed.body),
  }
}

export async function validateContentRepository(
  postsDirectory = POSTS_DIRECTORY,
) {
  const files = await readPostFiles(postsDirectory)

  for (const file of files) {
    try {
      const parsed = parsePostSource(file.source, file.sourcePath)
      await renderMdxToHtml(parsed.body)
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      throw new Error(`${file.sourcePath}: ${reason}`, { cause: error })
    }
  }

  return createContentManifest(files)
}
