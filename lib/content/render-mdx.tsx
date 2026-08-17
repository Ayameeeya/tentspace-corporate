import { readFile } from "node:fs/promises"
import path from "node:path"
import { evaluate } from "@mdx-js/mdx"
import probe from "probe-image-size"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import * as runtime from "react/jsx-runtime"
import remarkGfm from "remark-gfm"

function YouTube({ id, title = "YouTube video" }: { id: string; title?: string }) {
  if (!/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
    throw new Error("Invalid YouTube video id")
  }

  return (
    <div className="video-embed">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function XEmbed({ url }: { url: string }) {
  return (
    <blockquote className="twitter-tweet">
      <a href={url}>{url}</a>
    </blockquote>
  )
}

export interface RenderMdxOptions {
  publicDirectory?: string
}

async function addLocalImageDimensions(
  html: string,
  publicDirectory: string,
): Promise<string> {
  const imageTags = [...new Set(html.match(/<img\b[^>]*>/g) ?? [])]
  let rendered = html

  for (const imageTag of imageTags) {
    const hasWidth = /\swidth=/.test(imageTag)
    const hasHeight = /\sheight=/.test(imageTag)
    if (hasWidth && hasHeight) continue

    const source = imageTag.match(/\ssrc="([^"]+)"/)?.[1]
    if (!source?.startsWith("/") || source.startsWith("//")) continue

    const pathname = decodeURIComponent(
      new URL(source, "https://local.invalid").pathname,
    )
    const publicRoot = path.resolve(publicDirectory)
    const imagePath = path.resolve(publicRoot, pathname.replace(/^\/+/, ""))
    if (!imagePath.startsWith(`${publicRoot}${path.sep}`)) {
      throw new Error(`Local image path escapes public directory: ${source}`)
    }

    let image: Buffer
    try {
      image = await readFile(imagePath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`Missing local image: ${source}`, { cause: error })
      }
      throw error
    }

    const dimensions = probe.sync(image)
    if (!dimensions) {
      throw new Error(`Could not determine local image dimensions: ${source}`)
    }

    const attributes = [
      hasWidth ? "" : ` width="${dimensions.width}"`,
      hasHeight ? "" : ` height="${dimensions.height}"`,
      /\sloading=/.test(imageTag) ? "" : ' loading="lazy"',
      /\sdecoding=/.test(imageTag) ? "" : ' decoding="async"',
    ].join("")
    const sizedTag = imageTag.replace(/\s*\/?>(?=$)/, `${attributes}/>`)
    rendered = rendered.split(imageTag).join(sizedTag)
  }

  return rendered
}

export async function renderMdxToHtml(
  source: string,
  options: RenderMdxOptions = {},
): Promise<string> {
  const evaluated = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
  })

  let html = renderToStaticMarkup(
    React.createElement(evaluated.default, {
      components: { YouTube, XEmbed },
    }),
  )

  html = html.replace(
    /<pre><code class="language-([^"\s]+)">/g,
    '<pre class="ts-code" data-lang="$1" tabindex="0"><code class="language-$1">',
  )
  html = html.replace(
    /<pre(?![^>]*\btabindex=)([^>]*)>/g,
    '<pre$1 tabindex="0">',
  )

  return addLocalImageDimensions(
    html,
    options.publicDirectory ?? path.join(process.cwd(), "public"),
  )
}
