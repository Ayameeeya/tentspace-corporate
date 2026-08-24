import { readFile } from "node:fs/promises"
import path from "node:path"
import { evaluate } from "@mdx-js/mdx"
import probe from "probe-image-size"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import * as runtime from "react/jsx-runtime"
import remarkGfm from "remark-gfm"
import {
  DIALOGUE_MOODS,
  DIALOGUE_SPEAKER_IDS,
  Dialogue,
  Say,
  isDialogueMood,
  isDialogueSpeakerId,
} from "./dialogue"
import {
  createLinkCardComponent,
  getLinkCardKey,
  resolveLinkCard,
  type LinkCardLogger,
  type LinkCardProps,
  type ResolvedLinkCard,
} from "./link-card"

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

function MdxLink({
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = typeof href === "string" && /^https?:\/\//i.test(href)
  return (
    <a
      href={href}
      {...props}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    />
  )
}

export interface RenderMdxOptions {
  publicDirectory?: string
  postsDirectory?: string
  cachePath?: string
  fetcher?: typeof fetch
  logger?: LinkCardLogger
}

interface MdxNode {
  type?: string
  name?: string
  attributes?: Array<{
    type?: string
    name?: string
    value?: string | { type?: string; value?: string } | null
  }>
  children?: MdxNode[]
}

function getStaticLinkCardProps(node: MdxNode): LinkCardProps {
  const props: LinkCardProps = {}
  for (const attribute of node.attributes ?? []) {
    if (
      attribute.name !== "slug" &&
      attribute.name !== "url" &&
      attribute.name !== "title"
    ) {
      continue
    }
    if (typeof attribute.value !== "string") {
      throw new Error(
        `LinkCard ${attribute.name} must be a static string literal`,
      )
    }
    props[attribute.name] = attribute.value
  }
  return props
}

function findLinkCardProps(tree: MdxNode): LinkCardProps[] {
  const cards: LinkCardProps[] = []
  const visit = (node: MdxNode) => {
    if (
      (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
      node.name === "LinkCard"
    ) {
      cards.push(getStaticLinkCardProps(node))
    }
    for (const child of node.children ?? []) visit(child)
  }
  visit(tree)
  return cards
}

function validateDialogueSpeakers(tree: MdxNode) {
  const visit = (node: MdxNode) => {
    if (
      (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
      node.name === "Say"
    ) {
      const by = (node.attributes ?? []).find(
        (attribute) => attribute.name === "by",
      )
      if (!by) throw new Error("Say by is required")
      if (typeof by.value !== "string") {
        throw new Error("Say by must be a static string literal")
      }
      if (!isDialogueSpeakerId(by.value)) {
        throw new Error(
          `Unknown Dialogue speaker "${by.value}". Available speakers: ${DIALOGUE_SPEAKER_IDS.join(", ")}`,
        )
      }
      const mood = (node.attributes ?? []).find(
        (attribute) => attribute.name === "mood",
      )
      if (mood && typeof mood.value !== "string") {
        throw new Error("Say mood must be a static string literal")
      }
      if (typeof mood?.value === "string" && !isDialogueMood(mood.value)) {
        throw new Error(
          `Unknown Dialogue mood "${mood.value}". Available moods: ${DIALOGUE_MOODS.join(", ")}`,
        )
      }
    }
    for (const child of node.children ?? []) visit(child)
  }
  visit(tree)
}

async function addLocalImageDimensions(
  html: string,
  publicDirectory: string,
): Promise<string> {
  const imageTags = [...new Set(html.match(/<img\b[^>]*>/g) ?? [])]
  let rendered = html

  for (const imageTag of imageTags) {
    if (/\sdata-link-card-image(?:=|\s|\/?>)/.test(imageTag)) continue
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
  const cards = new Map<string, ResolvedLinkCard>()
  const resolverOptions = {
    postsDirectory:
      options.postsDirectory ?? path.join(process.cwd(), "content", "posts"),
    cachePath:
      options.cachePath ?? path.join(process.cwd(), "content", "link-card-cache.json"),
    fetcher: options.fetcher ?? fetch,
    logger: options.logger ?? console,
  }
  const resolveLinkCards = () => async (tree: MdxNode) => {
    validateDialogueSpeakers(tree)
    for (const props of findLinkCardProps(tree)) {
      const key = getLinkCardKey(props)
      if (!cards.has(key)) {
        cards.set(key, await resolveLinkCard(props, resolverOptions))
      }
    }
  }
  const evaluated = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, resolveLinkCards],
  })

  let html = renderToStaticMarkup(
    React.createElement(evaluated.default, {
      components: {
        a: MdxLink,
        YouTube,
        XEmbed,
        Dialogue,
        Say,
        LinkCard: createLinkCardComponent(cards),
      },
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
