import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import {
  createPostTemplate,
  createSocialTemplate,
} from "../lib/content/new-post"
import { postFrontmatterSchema } from "../lib/content/post-schema"

function readArguments(args: string[]) {
  const values = new Map<string, string>()
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!key?.startsWith("--") || !value) {
      throw new Error(
        "Usage: npm run new-post -- --slug post-slug --title \"Title\" --description \"Description\" --hook howto [--cta inquiry] --target-kw \"keyword\" --utm-campaign campaign [--categories テクノロジー] [--tags MDX,SEO]",
      )
    }
    values.set(key.slice(2), value)
  }

  const slug = values.get("slug")
  const title = values.get("title")
  const description = values.get("description")
  const hook = values.get("hook")
  const targetKw = values.get("target-kw")
  const utmCampaign = values.get("utm-campaign")
  if (!slug || !title || !description || !hook || !targetKw || !utmCampaign) {
    throw new Error(
      "--slug, --title, --description, --hook, --target-kw and --utm-campaign are required",
    )
  }

  return {
    slug,
    title,
    description,
    date: values.get("date") ?? new Date().toISOString().slice(0, 10),
    categories: (values.get("categories") ?? "")
      .split(",")
      .map((category) => category.trim())
      .filter(Boolean),
    tags: (values.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    experiment: {
      hook,
      cta: values.get("cta") ?? "inquiry",
      targetKw,
      utmCampaign,
    },
  }
}

async function main() {
  const input = readArguments(process.argv.slice(2))
  const directory = path.join(process.cwd(), "content", "posts", input.slug)
  const outputPath = path.join(directory, "index.mdx")
  const socialPath = path.join(directory, "social.md")
  await mkdir(directory, { recursive: false })
  const experiment = Object.keys(input.experiment).length
    ? postFrontmatterSchema.shape.experiment.parse(input.experiment)
    : undefined
  await Promise.all([
    writeFile(outputPath, createPostTemplate({ ...input, experiment }), {
      flag: "wx",
    }),
    writeFile(
      socialPath,
      createSocialTemplate({
        title: input.title,
        slug: input.slug,
        utmCampaign: input.experiment.utmCampaign,
      }),
      { flag: "wx" },
    ),
  ])
  console.log(`Created draft: ${outputPath}`)
  console.log(`Created social copy: ${socialPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
