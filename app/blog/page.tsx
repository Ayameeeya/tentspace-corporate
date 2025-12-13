"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"
import { BlogCarousel } from "@/components/blog-carousel"
import { getPosts, getCategories, getFeaturedImageUrl, stripHtml, formatDate, getReadingTime, type WPPost, type WPCategory } from "@/lib/wordpress"
import { fetchLikeCounts, fetchTotalLikes } from "@/lib/blog-likes"

// Blog Card Component
function BlogCard({ post, likes = 0 }: { post: WPPost; likes?: number }) {
  const imageUrl = getFeaturedImageUrl(post, 'medium')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []
  const author = post._embedded?.author?.[0]

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="flex gap-4 py-5 border-b border-gray-100 dark:border-border hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors -mx-4 px-4 rounded-lg">
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
                  <span className="text-sm text-gray-600 dark:text-gray-400">{author.name}</span>
                </div>
              )}
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <time className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(post.date)}
              </time>
            </div>

            {/* Title */}
            <h2
              className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
              {excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {cat.name}
                </span>
              ))}
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {readingTime}分で読める
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-6.75-4.35-6.75-9.75A4.25 4.25 0 0112 7.25a4.25 4.25 0 016.75 4c0 5.4-6.75 9.75-6.75 9.75z" />
                </svg>
                {likes}
              </span>
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-6.75-4.35-6.75-9.75A4.25 4.25 0 0112 7.25a4.25 4.25 0 016.75 4c0 5.4-6.75 9.75-6.75 9.75z" />
                </svg>
                {likes}
              </span>
            </div>
          </div>

          {/* Thumbnail */}
          {imageUrl && (
            <div className="relative w-24 h-24 md:w-32 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
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
function FeaturedCard({ post, likes = 0 }: { post: WPPost; likes?: number }) {
  const imageUrl = getFeaturedImageUrl(post, 'large')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []
  const author = post._embedded?.author?.[0]

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="bg-white dark:bg-background rounded-xl border border-gray-100 dark:border-border overflow-hidden hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300">
          {/* Image */}
          {imageUrl && (
            <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-700">
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
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2
              className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{author.name}</span>
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(post.date)}
                    </time>
                  </div>
                </div>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
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

// Blog Page Content Component (uses useSearchParams)
function BlogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [posts, setPosts] = useState<WPPost[]>([])
  const [categories, setCategories] = useState<WPCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [totalLikes, setTotalLikes] = useState<number | null>(null)

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
  }, [currentPage, searchQuery])

  // Fetch total likes once
  useEffect(() => {
    async function loadTotalLikes() {
      const total = await fetchTotalLikes()
      setTotalLikes(total)
    }
    loadTotalLikes()
  }, [])

  // Fetch like counts for current posts
  useEffect(() => {
    async function loadLikeCounts() {
      if (posts.length === 0) {
        setLikeCounts({})
        return
      }
      const slugs = posts.map((p) => p.slug)
      const counts = await fetchLikeCounts(slugs)
      setLikeCounts(counts)
    }
    loadLikeCounts()
  }, [posts])

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const featuredPosts = posts.slice(0, 2)
  const regularPosts = posts.slice(2)

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background">
      <BlogHeader />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-white dark:bg-background border-b border-gray-100 dark:border-border">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tech Blog</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              tent space Blog
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
              AI開発、テクノロジー、最新の取り組みについて発信しています
            </p>
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-6.75-4.35-6.75-9.75A4.25 4.25 0 0112 7.25a4.25 4.25 0 016.75 4c0 5.4-6.75 9.75-6.75 9.75z" />
                </svg>
                <span className="font-semibold">総いいね</span>
                <span className="text-gray-900 dark:text-white font-bold">{totalLikes ?? "–"}</span>
              </div>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="記事を検索..."
                  className="w-full px-4 py-3 pl-12 pr-24 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
            <div className="max-w-5xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-medium">&quot;{searchQuery}&quot;</span> の検索結果: {totalPosts}件
                </p>
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
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
        <div className="bg-white dark:bg-background border-b border-gray-100 dark:border-border sticky top-16 z-40">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto py-3 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => clearSearch()}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  !searchQuery
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                すべて
              </button>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/categories/${category.slug}`}
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {category.name}
                  <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
                </Link>
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
                  <div key={i} className="bg-white dark:bg-background rounded-xl border border-gray-100 dark:border-border overflow-hidden animate-pulse">
                    <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
              {/* List skeleton */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 py-5 border-b border-gray-100 dark:border-border animate-pulse">
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  </div>
                  <div className="w-24 h-24 md:w-32 md:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                再読み込み
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300">まだ記事がありません</p>
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {featuredPosts.length > 0 && currentPage === 1 && !searchQuery && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {featuredPosts.map((post) => (
                    <FeaturedCard key={post.id} post={post} likes={likeCounts[post.slug] || 0} />
                  ))}
                </div>
              )}

              {/* Regular Posts */}
              <div className="bg-white dark:bg-background rounded-xl border border-gray-100 dark:border-border px-4">
                {(currentPage === 1 && !searchQuery ? regularPosts : posts).map((post) => (
                  <BlogCard key={post.id} post={post} likes={likeCounts[post.slug] || 0} />
                ))}
              </div>

              {/* Recommended Posts - Show only on first page without search */}
              {currentPage === 1 && !searchQuery && posts.length >= 3 && (
                <aside className="mt-10" aria-label="おすすめ記事">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">こちらもおすすめ</h2>
                  </div>
                  
                  <BlogCarousel posts={posts} likeCounts={likeCounts} />
                </aside>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <footer className="bg-white dark:bg-background border-t border-gray-100 dark:border-border mt-16">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo_black_symbol.png"
                  alt="tent space"
                  width={32}
                  height={32}
                  className="opacity-60 dark:invert"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">© 2025 tent space Inc.</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  利用規約
                </Link>
                <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  プライバシー
                </Link>
                <Link href="/legal/tokushoho" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  特定商取引法
                </Link>
                <a 
                  href="mailto:back-office@tentspace.net" 
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
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

// Loading component for Suspense fallback
function BlogPageLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background">
      <BlogHeader />
      <main className="pt-20">
        <div className="bg-white dark:bg-background border-b border-gray-100 dark:border-border">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
            <div className="animate-pulse">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 py-5">
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// Main Blog Page Component with Suspense boundary
export default function BlogPage() {
  return (
    <Suspense fallback={<BlogPageLoading />}>
      <BlogPageContent />
    </Suspense>
  )
}
