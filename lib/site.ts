const DEFAULT_SITE_URL = "https://www.tentspace.net"

function normalizeSiteUrl(value: string): string {
  const url = new URL(value)
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("SITE_URL must use http or https")
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an origin without a path, query, or hash")
  }
  return url.origin
}

export const SITE_URL = normalizeSiteUrl(
  process.env.SITE_URL ?? DEFAULT_SITE_URL,
)
