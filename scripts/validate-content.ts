import { writeFile } from "node:fs/promises"
import path from "node:path"
import {
  loadPostBySlug,
  validateContentRepository,
} from "../lib/content/repository"

async function main() {
  const manifest = await validateContentRepository()
  const manifestPath = path.join(process.cwd(), "content-manifest.json")
  const renderedEntries = await Promise.all(
    manifest.map(async (post) => {
      const source = await loadPostBySlug(post.slug)
      if (!source) throw new Error(`Published post could not be loaded: ${post.slug}`)
      return [post.slug, source.contentHtml] as const
    }),
  )
  const renderedPath = path.join(process.cwd(), "content-rendered.json")

  await Promise.all([
    writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`),
    writeFile(
      renderedPath,
      `${JSON.stringify(Object.fromEntries(renderedEntries), null, 2)}\n`,
    ),
  ])
  console.log(`Validated ${manifest.length} published posts`)
  console.log(`Updated ${manifestPath}`)
  console.log(`Updated ${renderedPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
