import { readFile } from "node:fs/promises"
import path from "node:path"
import { parsePostSource } from "./post-schema"

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts")

export async function loadPostMarkdownBySlug(
  slug: string,
  postsDirectory = POSTS_DIRECTORY,
): Promise<string | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null

  const sourcePath = path.join(postsDirectory, slug, "index.mdx")
  let source: string
  try {
    source = await readFile(sourcePath, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }

  return parsePostSource(source, sourcePath).metadata.draft ? null : source
}
