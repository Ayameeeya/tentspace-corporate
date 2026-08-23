import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { createContentManifest, parsePostSource } from "./post-schema"
import { renderMdxToHtml, type RenderMdxOptions } from "./render-mdx"

export const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts")

export interface PostFile {
  source: string
  sourcePath: string
}

export type ContentValidationOptions = RenderMdxOptions

const NON_ARTICLE_BLOG_ROUTES = new Set(["favorites", "n8n", "seo"])

function extractHtmlAttributeValues(
  html: string,
  attribute: "href" | "src",
) {
  const expression = new RegExp(`\\b${attribute}=["']([^"']+)["']`, "g")
  return [...html.matchAll(expression)].map((match) => match[1])
}

function extractHtmlImageSources(html: string) {
  return (html.match(/<img\b[^>]*>/g) ?? []).flatMap((imageTag) => {
    if (/\sdata-link-card-image(?:=|\s|\/?>)/.test(imageTag)) return []
    return extractHtmlAttributeValues(imageTag, "src")
  })
}

function getBlogPostSlug(reference: string): string | null {
  if (!reference.startsWith("/") || reference.startsWith("//")) return null
  const pathname = new URL(reference, "https://local.invalid").pathname
  const match = pathname.match(/^\/blog\/([a-z0-9-]+)\/?$/)
  if (!match || NON_ARTICLE_BLOG_ROUTES.has(match[1])) return null
  return match[1]
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
  options: RenderMdxOptions = {},
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
    contentHtml: await renderMdxToHtml(parsed.body, {
      ...options,
      postsDirectory,
    }),
  }
}

async function validateParsedPost(
  parsed: ReturnType<typeof parsePostSource>,
  postSlugs: Set<string>,
  postsDirectory: string,
  options: ContentValidationOptions,
) {
  try {
    const contentHtml = await renderMdxToHtml(parsed.body, {
      ...options,
      publicDirectory:
        options.publicDirectory ?? path.join(process.cwd(), "public"),
      postsDirectory,
    })

    for (const source of extractHtmlImageSources(contentHtml)) {
      if (/^(?:https?:)?\/\//.test(source)) {
        throw new Error(`External article image is not allowed: ${source}`)
      }
      if (!source.startsWith("/")) {
        throw new Error(
          `Article image must use a root-relative local path: ${source}`,
        )
      }
    }

    for (const reference of extractHtmlAttributeValues(contentHtml, "href")) {
      const slug = getBlogPostSlug(reference)
      if (slug && !postSlugs.has(slug)) {
        throw new Error(`Missing blog post for internal link: ${reference}`)
      }
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`${parsed.sourcePath}: ${reason}`, { cause: error })
  }
}

export async function validatePostFile(
  sourcePath: string,
  postsDirectory = POSTS_DIRECTORY,
  options: ContentValidationOptions = {},
) {
  const absoluteSourcePath = path.resolve(sourcePath)
  const absolutePostsDirectory = path.resolve(postsDirectory)
  const relativePath = path.relative(absolutePostsDirectory, absoluteSourcePath)
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`Article must be inside ${absolutePostsDirectory}`)
  }

  const source = await readFile(absoluteSourcePath, "utf8")
  let parsed: ReturnType<typeof parsePostSource>
  try {
    parsed = parsePostSource(source, absoluteSourcePath)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`${absoluteSourcePath}: ${reason}`, { cause: error })
  }

  const files = await readPostFiles(absolutePostsDirectory)
  const postSlugs = new Set(
    files.map((file) => path.basename(path.dirname(file.sourcePath))),
  )
  await validateParsedPost(
    parsed,
    postSlugs,
    absolutePostsDirectory,
    options,
  )
}

export async function validateContentRepository(
  postsDirectory = POSTS_DIRECTORY,
  options: ContentValidationOptions = {},
) {
  const files = await readPostFiles(postsDirectory)
  const parsedPosts = files.map((file) => parsePostSource(file.source, file.sourcePath))
  const postSlugs = new Set(parsedPosts.map((post) => post.metadata.slug))
  for (const parsed of parsedPosts) {
    await validateParsedPost(parsed, postSlugs, postsDirectory, options)
  }

  return createContentManifest(files)
}
