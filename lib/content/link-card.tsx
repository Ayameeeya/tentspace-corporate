import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import React from "react"
import { parsePostSource } from "./post-schema"

const LINK_CARD_USER_AGENT =
  "tent space LinkCard Builder/1.0 (+https://www.tentspace.net)"
const LINK_CARD_TIMEOUT_MS = 5_000

export interface LinkCardLogger {
  info?: (message: string) => void
  warn: (message: string) => void
}

export interface LinkCardResolverOptions {
  postsDirectory: string
  cachePath: string
  fetcher: typeof fetch
  logger: LinkCardLogger
}

export interface LinkCardProps {
  slug?: string
  url?: string
  title?: string
}

interface LinkCardMetadata {
  kind: "internal" | "external"
  href: string
  title: string
  description: string
  domain: string
  image?: string
  favicon?: string
}

interface LinkCardFallback {
  kind: "fallback"
  href: string
}

export type ResolvedLinkCard = LinkCardMetadata | LinkCardFallback

interface LinkCardCacheFile {
  version: 1
  entries: Record<string, Omit<LinkCardMetadata, "kind" | "href">>
}

const emptyCache = (): LinkCardCacheFile => ({ version: 1, entries: {} })
const cacheWriteQueues = new Map<string, Promise<void>>()

function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: "\u00a0",
    quot: '"',
  }

  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi,
    (entity, name: string) => {
      if (name.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(name.slice(2), 16))
      }
      if (name.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(name.slice(1), 10))
      }
      return namedEntities[name.toLowerCase()] ?? entity
    },
  )
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  const expression =
    /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g
  for (const match of tag.matchAll(expression)) {
    attributes[match[1].toLowerCase()] = decodeHtmlEntities(
      match[2] ?? match[3] ?? match[4] ?? "",
    )
  }
  return attributes
}

function getMetaContent(html: string, names: string[]): string | undefined {
  const expectedNames = new Set(names.map((name) => name.toLowerCase()))
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = parseAttributes(tag)
    const name = (attributes.property ?? attributes.name)?.toLowerCase()
    if (name && expectedNames.has(name) && attributes.content?.trim()) {
      return attributes.content.trim()
    }
  }
  return undefined
}

function getDocumentTitle(html: string): string | undefined {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  return title ? decodeHtmlEntities(title.replace(/<[^>]+>/g, "").trim()) : undefined
}

function getFaviconHref(html: string): string | undefined {
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attributes = parseAttributes(tag)
    const rel = attributes.rel?.toLowerCase().split(/\s+/) ?? []
    if (rel.includes("icon") && attributes.href) return attributes.href
  }
  return undefined
}

function toAbsoluteHttpUrl(value: string | undefined, baseUrl: URL) {
  if (!value) return undefined
  try {
    const resolved = new URL(value, baseUrl)
    return resolved.protocol === "http:" || resolved.protocol === "https:"
      ? resolved.toString()
      : undefined
  } catch {
    return undefined
  }
}

async function readCache(cachePath: string): Promise<LinkCardCacheFile> {
  try {
    const parsed = JSON.parse(await readFile(cachePath, "utf8")) as Partial<LinkCardCacheFile>
    if (parsed.version !== 1 || !parsed.entries || typeof parsed.entries !== "object") {
      throw new Error("unsupported cache format")
    }
    return parsed as LinkCardCacheFile
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyCache()
    throw new Error(`Could not read LinkCard cache at ${cachePath}`, {
      cause: error,
    })
  }
}

async function persistCacheEntry(
  cachePath: string,
  url: string,
  entry: Omit<LinkCardMetadata, "kind" | "href">,
) {
  const previous = cacheWriteQueues.get(cachePath) ?? Promise.resolve()
  const current = previous.then(async () => {
    const cache = await readCache(cachePath)
    cache.entries[url] = entry
    cache.entries = Object.fromEntries(
      Object.entries(cache.entries).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    )
    await mkdir(path.dirname(cachePath), { recursive: true })
    const temporaryPath = `${cachePath}.${process.pid}.tmp`
    await writeFile(temporaryPath, `${JSON.stringify(cache, null, 2)}\n`)
    await rename(temporaryPath, cachePath)
  })
  cacheWriteQueues.set(cachePath, current)

  try {
    await current
  } finally {
    if (cacheWriteQueues.get(cachePath) === current) {
      cacheWriteQueues.delete(cachePath)
    }
  }
}

function validateProps({ slug, url, title }: LinkCardProps) {
  if ((slug && url) || (!slug && !url)) {
    throw new Error('LinkCard requires exactly one of "slug" or "url"')
  }
  if (slug && title) {
    throw new Error('LinkCard "title" can only be used with "url"')
  }
  if (title !== undefined && !title.trim()) {
    throw new Error('LinkCard "title" must not be empty')
  }
}

export function getLinkCardKey(props: LinkCardProps): string {
  validateProps(props)
  return props.slug
    ? `slug:${props.slug}`
    : `url:${props.url}:title:${props.title ?? ""}`
}

async function resolveInternalCard(
  slug: string,
  postsDirectory: string,
): Promise<LinkCardMetadata> {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid LinkCard slug: ${slug}`)
  }

  const sourcePath = path.join(postsDirectory, slug, "index.mdx")
  let source: string
  try {
    source = await readFile(sourcePath, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`LinkCard references missing post slug: ${slug}`, {
        cause: error,
      })
    }
    throw error
  }

  const { metadata } = parsePostSource(source, sourcePath)
  if (metadata.draft) {
    throw new Error(`LinkCard references draft post slug: ${slug}`)
  }

  return {
    kind: "internal",
    href: `/blog/${slug}`,
    title: metadata.title,
    description: metadata.description,
    domain: "www.tentspace.net",
    favicon: "/favicon.ico",
    ...(metadata.ogImage ? { image: metadata.ogImage } : {}),
  }
}

async function fetchExternalCard(
  url: URL,
  options: LinkCardResolverOptions,
): Promise<LinkCardMetadata> {
  options.logger.info?.(`[LinkCard] Fetching OGP: ${url.toString()}`)
  const response = await options.fetcher(url, {
    headers: { "User-Agent": LINK_CARD_USER_AGENT },
    redirect: "follow",
    signal: AbortSignal.timeout(LINK_CARD_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? ""
  if (!contentType.includes("text/html")) {
    throw new Error(`Expected HTML but received ${contentType || "unknown content type"}`)
  }

  const html = await response.text()
  const finalUrl = new URL(response.url || url.toString())
  const title = getMetaContent(html, ["og:title", "twitter:title"]) ?? getDocumentTitle(html)
  if (!title) throw new Error("No OGP or document title found")

  return {
    kind: "external",
    href: url.toString(),
    title,
    description:
      getMetaContent(html, ["og:description", "twitter:description", "description"]) ?? "",
    domain: finalUrl.hostname,
    image: toAbsoluteHttpUrl(
      getMetaContent(html, ["og:image", "twitter:image"]),
      finalUrl,
    ),
    favicon:
      toAbsoluteHttpUrl(getFaviconHref(html), finalUrl) ??
      new URL("/favicon.ico", finalUrl).toString(),
  }
}

async function resolveExternalCard(
  rawUrl: string,
  options: LinkCardResolverOptions,
  displayTitle?: string,
): Promise<ResolvedLinkCard> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch (error) {
    throw new Error(`Invalid LinkCard URL: ${rawUrl}`, { cause: error })
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`LinkCard URL must use http or https: ${rawUrl}`)
  }

  const normalizedUrl = url.toString()
  const cached = (await readCache(options.cachePath)).entries[normalizedUrl]
  if (cached && typeof cached.title === "string") {
    return {
      kind: "external",
      href: normalizedUrl,
      title: displayTitle ?? cached.title,
      description:
        typeof cached.description === "string" ? cached.description : "",
      domain:
        typeof cached.domain === "string" && cached.domain
          ? cached.domain
          : url.hostname,
      image:
        typeof cached.image === "string"
          ? toAbsoluteHttpUrl(cached.image, url)
          : undefined,
      favicon:
        typeof cached.favicon === "string"
          ? toAbsoluteHttpUrl(cached.favicon, url)
          : undefined,
    }
  }

  try {
    const card = await fetchExternalCard(url, options)
    const { kind: _kind, href: _href, ...cacheEntry } = card
    await persistCacheEntry(options.cachePath, normalizedUrl, cacheEntry)
    return displayTitle ? { ...card, title: displayTitle } : card
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    const fallbackType = displayTitle ? "a titled card" : "a text link"
    options.logger.warn(
      `[LinkCard] Could not fetch OGP for ${normalizedUrl}; using ${fallbackType} (${reason})`,
    )
    return displayTitle
      ? {
          kind: "external",
          href: normalizedUrl,
          title: displayTitle,
          description: "",
          domain: url.hostname,
        }
      : { kind: "fallback", href: normalizedUrl }
  }
}

export async function resolveLinkCard(
  props: LinkCardProps,
  options: LinkCardResolverOptions,
): Promise<ResolvedLinkCard> {
  validateProps(props)
  return props.slug
    ? resolveInternalCard(props.slug, options.postsDirectory)
    : resolveExternalCard(props.url as string, options, props.title)
}

export function createLinkCardComponent(cards: Map<string, ResolvedLinkCard>) {
  return function LinkCard(props: LinkCardProps) {
    const key = getLinkCardKey(props)
    const card = cards.get(key)
    if (!card) throw new Error(`LinkCard was not resolved: ${key}`)

    if (card.kind === "fallback") {
      return (
        <a
          className="link-card-fallback"
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {card.href}
        </a>
      )
    }

    const externalProps =
      card.kind === "external"
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {}

    return (
      <a
        className={`link-card link-card--${card.kind}`}
        href={card.href}
        {...externalProps}
      >
        <span className="link-card__body">
          <span className="link-card__title">{card.title}</span>
          {card.description ? (
            <span className="link-card__description">{card.description}</span>
          ) : null}
          <span className="link-card__site">
            {card.favicon ? (
              <img
                className="link-card__favicon"
                src={card.favicon}
                alt=""
                aria-hidden="true"
                data-link-card-image=""
              />
            ) : null}
            <span>{card.domain}</span>
          </span>
        </span>
        {card.image ? (
          <span className="link-card__thumbnail" aria-hidden="true">
            <img
              className="link-card__image"
              src={card.image}
              alt=""
              loading="lazy"
              decoding="async"
              data-link-card-image=""
            />
          </span>
        ) : null}
      </a>
    )
  }
}
