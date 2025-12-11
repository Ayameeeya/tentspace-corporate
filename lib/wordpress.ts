// WordPress REST API utility functions

const WP_API_URL = 'https://blog.tentspace.net/wp-json/wp/v2'

// Types for WordPress data
export interface WPPost {
  id: number
  date: string
  date_gmt: string
  modified: string
  slug: string
  status: string
  type: string
  link: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
    protected: boolean
  }
  excerpt: {
    rendered: string
    protected: boolean
  }
  author: number
  featured_media: number
  categories: number[]
  tags: number[]
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[]
    'wp:term'?: WPTerm[][]
    author?: WPAuthor[]
  }
}

export interface WPMedia {
  id: number
  source_url: string
  alt_text: string
  media_details?: {
    width: number
    height: number
    sizes?: {
      thumbnail?: { source_url: string }
      medium?: { source_url: string }
      large?: { source_url: string }
      full?: { source_url: string }
    }
  }
}

export interface WPTerm {
  id: number
  name: string
  slug: string
  taxonomy: string
}

export interface WPAuthor {
  id: number
  name: string
  description?: string
  avatar_urls?: {
    24: string
    48: string
    96: string
  }
}

export interface WPCategory {
  id: number
  count: number
  description: string
  name: string
  slug: string
  parent: number
}

// Fetch all posts with optional pagination
export async function getPosts(params?: {
  page?: number
  perPage?: number
  categories?: number[]
  tags?: number[]
  search?: string
}): Promise<{ posts: WPPost[]; totalPages: number; total: number }> {
  const searchParams = new URLSearchParams()
  searchParams.set('_embed', 'true')
  searchParams.set('per_page', String(params?.perPage || 12))
  searchParams.set('page', String(params?.page || 1))
  
  if (params?.categories?.length) {
    searchParams.set('categories', params.categories.join(','))
  }
  if (params?.tags?.length) {
    searchParams.set('tags', params.tags.join(','))
  }
  if (params?.search) {
    searchParams.set('search', params.search)
  }

  const response = await fetch(`${WP_API_URL}/posts?${searchParams.toString()}`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`)
  }

  const posts: WPPost[] = await response.json()
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10)
  const total = parseInt(response.headers.get('X-WP-Total') || '0', 10)

  return { posts, totalPages, total }
}

// Fetch a single post by slug
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const searchParams = new URLSearchParams()
  searchParams.set('_embed', 'true')
  searchParams.set('slug', slug)

  const response = await fetch(`${WP_API_URL}/posts?${searchParams.toString()}`, {
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.statusText}`)
  }

  const posts: WPPost[] = await response.json()
  return posts.length > 0 ? posts[0] : null
}

// Fetch all categories
export async function getCategories(): Promise<WPCategory[]> {
  const response = await fetch(`${WP_API_URL}/categories?per_page=100`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`)
  }

  return response.json()
}

// Helper function to extract featured image URL
export function getFeaturedImageUrl(post: WPPost, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0]
  if (!media) return null
  
  const sizes = media.media_details?.sizes
  if (sizes?.[size]) {
    return sizes[size]!.source_url
  }
  
  return media.source_url || null
}

// Helper function to strip HTML tags from excerpt
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Helper function to get reading time estimate
export function getReadingTime(content: string): number {
  const text = stripHtml(content)
  const wordsPerMinute = 400 // Japanese reading speed
  const words = text.length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

