"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"
import { getPosts, getCategories, getFeaturedImageUrl, stripHtml, formatDate, getReadingTime, type WPPost, type WPCategory } from "@/lib/wordpress"

// Blog Card Component
function BlogCard({ post }: { post: WPPost }) {
  const imageUrl = getFeaturedImageUrl(post, 'medium')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []
  const author = post._embedded?.author?.[0]

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="flex gap-4 py-5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-lg">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author & Date */}
            <div className="flex items-center gap-2 mb-2">
              {author && (
                <div className="flex items-center gap-2">
                  {author.avatar_urls?.['48'] ? (
                    <Image
                      src={author.avatar_urls['48']}
                      alt={author.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-gray-600">{author.name}</span>
                </div>
              )}
              <span className="text-gray-300">·</span>
              <time className="text-sm text-gray-500">
                {formatDate(post.date)}
              </time>
            </div>

            {/* Title */}
            <h2
              className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {cat.name}
                </span>
              ))}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {readingTime}分で読める
              </span>
            </div>
          </div>

          {/* Thumbnail */}
          {imageUrl && (
            <div className="relative w-24 h-24 md:w-32 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={imageUrl}
                alt={post.title.rendered}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

// Featured Card for top posts
function FeaturedCard({ post }: { post: WPPost }) {
  const imageUrl = getFeaturedImageUrl(post, 'large')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []
  const author = post._embedded?.author?.[0]

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          {/* Image */}
          {imageUrl && (
            <div className="relative aspect-[16/9] bg-gray-100">
              <Image
                src={imageUrl}
                alt={post.title.rendered}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="p-5">
            {/* Categories */}
            <div className="flex items-center gap-2 mb-3">
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2
              className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {excerpt}
            </p>

            {/* Author & Meta */}
            <div className="flex items-center justify-between">
              {author && (
                <div className="flex items-center gap-2">
                  {author.avatar_urls?.['48'] ? (
                    <Image
                      src={author.avatar_urls['48']}
                      alt={author.name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{author.name}</span>
                    <time className="text-xs text-gray-500">
                      {formatDate(post.date)}
                    </time>
                  </div>
                </div>
              )}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {readingTime}分
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Main Blog Page Component
export default function BlogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [posts, setPosts] = useState<WPPost[]>([])
  const [categories, setCategories] = useState<WPCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Initialize from URL params
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
      setSearchInput(search)
    }
  }, [searchParams])

  // Update URL when search changes
  const updateURL = useCallback((search: string) => {
    const params = new URLSearchParams()
    if (search) {
      params.set('search', search)
    }
    const newURL = search ? `/blog?${params.toString()}` : '/blog'
    router.push(newURL, { scroll: false })
  }, [router])

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    setSelectedCategory(null)
    setCurrentPage(1)
    updateURL(searchInput)
  }

  // Clear search
  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    setCurrentPage(1)
    updateURL('')
  }

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories()
        setCategories(cats.filter(c => c.count > 0))
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchCategories()
  }, [])

  // Fetch posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        const { posts: fetchedPosts, totalPages: total, total: totalCount } = await getPosts({
          page: currentPage,
          perPage: 12,
          categories: selectedCategory ? [selectedCategory] : undefined,
          search: searchQuery || undefined,
        })
        setPosts(fetchedPosts)
        setTotalPages(total)
        setTotalPosts(totalCount)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch posts:', err)
        setError('記事の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [currentPage, selectedCategory, searchQuery])

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

  const featuredPosts = posts.slice(0, 2)
  const regularPosts = posts.slice(2)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <BlogHeader />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Tech Blog</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              tent space Blog
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              AI開発、テクノロジー、最新の取り組みについて発信しています
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="記事を検索..."
                  className="w-full px-4 py-3 pl-12 pr-24 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <svg 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="検索をクリア"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    検索
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="bg-blue-50 border-b border-blue-100">
            <div className="max-w-5xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">&quot;{searchQuery}&quot;</span> の検索結果: {totalPosts}件
                </p>
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  クリア
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto py-3 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                すべて
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                  <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {loading ? (
            <div className="space-y-6">
              {/* Featured skeleton */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-[16/9] bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-1/4" />
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
              {/* List skeleton */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 py-5 border-b border-gray-100 animate-pulse">
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                  <div className="w-24 h-24 md:w-32 md:h-24 bg-gray-200 rounded-lg flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                再読み込み
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-gray-600">まだ記事がありません</p>
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {featuredPosts.length > 0 && currentPage === 1 && !selectedCategory && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {featuredPosts.map((post) => (
                    <FeaturedCard key={post.id} post={post} />
                  ))}
                </div>
              )}

              {/* Regular Posts */}
              <div className="bg-white rounded-xl border border-gray-100 px-4">
                {(currentPage === 1 && !selectedCategory ? regularPosts : posts).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    前へ
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    次へ
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo_black_symbol.png"
                  alt="tent space"
                  width={32}
                  height={32}
                  className="opacity-60"
                />
                <span className="text-sm text-gray-500">© 2025 tent space Inc.</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <Link href="/about" className="hover:text-gray-900 transition-colors">
                  About
                </Link>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">
                  利用規約
                </Link>
                <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                  プライバシー
                </Link>
                <a 
                  href="mailto:back-office@tentspace.net" 
                  className="hover:text-gray-900 transition-colors"
                >
                  お問い合わせ
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
