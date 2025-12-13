// WordPress REST API utility functions

const WP_API_URL = 'https://blog.tentspace.net/wp-json/wp/v2'
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD // format: "username:application_password"

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

// Fetch a single category by slug
export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const response = await fetch(`${WP_API_URL}/categories?slug=${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch category: ${response.statusText}`)
  }

  const categories: WPCategory[] = await response.json()
  return categories.length > 0 ? categories[0] : null
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

// ===== WordPress User Management (Requires Application Password) =====

export interface WPUser {
  id: number
  username: string
  name: string
  email: string
  roles: string[]
  avatar_urls?: {
    24: string
    48: string
    96: string
  }
}

/**
 * WordPressに新しいユーザーを作成する
 * Note: Application Password認証が必要
 */
export async function createWordPressUser(params: {
  email: string
  username: string
  displayName?: string
  password?: string
}): Promise<{ userId: number | null; error?: string }> {
  if (!WP_APP_PASSWORD) {
    return { userId: null, error: 'WordPress Application Password is not configured' }
  }

  try {
    // ランダムなパスワードを生成（ユーザーはSupabase認証を使うため）
    const password = params.password || generateSecurePassword()
    
    const response = await fetch(`${WP_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(WP_APP_PASSWORD).toString('base64')}`,
      },
      body: JSON.stringify({
        username: params.username,
        email: params.email,
        name: params.displayName || params.username,
        password: password,
        roles: ['author'], // ブログ投稿可能な権限
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('WordPress user creation failed:', errorData)
      
      // ユーザー名またはメールが既に存在する場合
      if (response.status === 400) {
        return { 
          userId: null, 
          error: errorData.message || 'Username or email already exists' 
        }
      }
      
      return { 
        userId: null, 
        error: `Failed to create WordPress user: ${response.statusText}` 
      }
    }

    const user: WPUser = await response.json()
    return { userId: user.id }
  } catch (error) {
    console.error('Error creating WordPress user:', error)
    return { 
      userId: null, 
      error: error instanceof Error ? error.message : 'Failed to create WordPress user' 
    }
  }
}

/**
 * WordPressユーザーをメールで検索する
 */
export async function getWordPressUserByEmail(email: string): Promise<WPUser | null> {
  if (!WP_APP_PASSWORD) {
    console.warn('WordPress Application Password is not configured')
    return null
  }

  try {
    const response = await fetch(`${WP_API_URL}/users?search=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(WP_APP_PASSWORD).toString('base64')}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const users: WPUser[] = await response.json()
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
  } catch (error) {
    console.error('Error fetching WordPress user:', error)
    return null
  }
}

/**
 * WordPressユーザーを更新する
 */
export async function updateWordPressUser(
  userId: number,
  params: { name?: string; email?: string }
): Promise<WPUser | null> {
  if (!WP_APP_PASSWORD) {
    return null
  }

  try {
    const response = await fetch(`${WP_API_URL}/users/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(WP_APP_PASSWORD).toString('base64')}`,
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating WordPress user:', error)
    return null
  }
}

/**
 * WordPressユーザーを削除する
 */
export async function deleteWordPressUser(
  userId: number,
  reassignTo?: number
): Promise<boolean> {
  if (!WP_APP_PASSWORD) {
    return false
  }

  try {
    const params = new URLSearchParams({ 
      force: 'true',
      reassign: String(reassignTo || 1) // デフォルトで管理者に再割り当て
    })
    
    const response = await fetch(`${WP_API_URL}/users/${userId}?${params}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${Buffer.from(WP_APP_PASSWORD).toString('base64')}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Error deleting WordPress user:', error)
    return false
  }
}

/**
 * セキュアなランダムパスワードを生成
 */
function generateSecurePassword(length: number = 24): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length]
  }
  return password
}

