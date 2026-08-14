import { writeFile } from "node:fs/promises"
import path from "node:path"
import {
  loadPostBySlug,
  validatePostFile,
  validateContentRepository,
} from "../lib/content/repository"

async function main() {
  const args = process.argv.slice(2)
  if (args.length > 0) {
    if (args.length !== 2 || args[0] !== "--file" || !args[1]) {
      throw new Error(
        "Usage: npm run validate-content -- --file content/posts/<slug>/index.mdx",
      )
    }
    const sourcePath = path.resolve(process.cwd(), args[1])
    await validatePostFile(sourcePath)
    console.log(`Validated ${sourcePath}`)
    return
  }

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
