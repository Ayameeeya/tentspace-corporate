"use client"

import { useEffect, useState, useCallback, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { gsap } from "gsap"
import { BlogHeader } from "@/components/blog-header"
import { BlogCarousel } from "@/components/blog-carousel"
import { BlogFooter } from "@/components/blog-footer"
import { getPosts, getCategories, getFeaturedImageUrl, stripHtml, formatDate, getReadingTime, type WPPost, type WPCategory } from "@/lib/wordpress"
import { fetchLikeCounts, fetchTotalLikes } from "@/lib/blog-likes"

// Category Filter Component with scroll detection
function CategoryFilter({
  categories,
  searchQuery,
  clearSearch
}: {
  categories: WPCategory[]
  searchQuery: string
  clearSearch: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(true)

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftFade(scrollLeft > 10)
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    const newPosition = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
    scrollRef.current.scrollTo({ left: newPosition, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    checkScroll()
    scrollElement.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      scrollElement.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  return (
    <div className="bg-white dark:bg-background border-b border-slate-200 dark:border-border">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative group">
          {/* Fade Gradients & Scroll Buttons */}
          {showLeftFade && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-r from-white dark:from-background to-transparent pointer-events-none z-10" />
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white dark:bg-background rounded-full shadow-lg border border-gray-200 dark:border-border items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}
          {showRightFade && (
            <>
              <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-l from-white dark:from-background to-transparent pointer-events-none z-10" />
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white dark:bg-background rounded-full shadow-lg border border-gray-200 dark:border-border items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex items-center gap-3 overflow-x-auto py-5 scrollbar-hide scroll-smooth px-6 md:px-12 lg:px-16"
          >
            <button
              onClick={() => clearSearch()}
              className={`flex-shrink-0 px-5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${!searchQuery
                ? 'bg-foreground text-background'
                : 'text-slate-600 dark:text-gray-400 hover:text-foreground'
                }`}
            >
              All Topics
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-gray-700 flex-shrink-0" />
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/categories/${category.slug}`}
                className="flex-shrink-0 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-gray-400 hover:text-foreground transition-colors whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Featured Hero Card - Large
function FeaturedHeroCard({ post, likes = 0 }: { post: WPPost; likes?: number }) {
  const imageUrl = getFeaturedImageUrl(post, 'large')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative overflow-hidden">
          {/* Image */}
          {imageUrl && (
            <div className="relative aspect-[21/9] bg-slate-100 dark:bg-gray-800 overflow-hidden mb-8">
              <Image
                src={imageUrl}
                alt={post.title.rendered}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Category Badge on Image */}
              {categories[0] && (
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-background text-foreground text-xs font-bold uppercase tracking-wider">
                    {categories[0].name}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="max-w-3xl">
            {/* Meta */}
            <div className="flex items-center gap-3 mb-4 text-sm text-slate-500 dark:text-gray-400">
              <time>{formatDate(post.date)}</time>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>

            {/* Title */}
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-lg text-slate-600 dark:text-gray-300 line-clamp-2 mb-6 leading-relaxed">
              {excerpt}
            </p>

            {/* Meta Footer */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-gray-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{likes}</span>
              </div>
            </div>

            {/* Read More */}
            <div className="inline-flex items-center gap-2 text-base font-semibold text-foreground group-hover:gap-4 transition-all">
              <span>Continue Reading</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Regular Blog Card - Grid Item
function BlogCard({ post, likes = 0 }: { post: WPPost; likes?: number }) {
  const imageUrl = getFeaturedImageUrl(post, 'large')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="h-full flex flex-col">
          {/* Image */}
          {imageUrl && (
            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-gray-800 overflow-hidden mb-5">
              <Image
                src={imageUrl}
                alt={post.title.rendered}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Category & Date */}
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              {categories[0] && <span>{categories[0].name}</span>}
            </div>

            {/* Title */}
            <h3
              className="text-xl md:text-2xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-slate-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed flex-1">
              {excerpt}
            </p>

            {/* Meta Footer */}
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400 pt-4 border-t border-slate-200 dark:border-gray-800">
              <time>{formatDate(post.date)}</time>
              <span>•</span>
              <span>{readingTime} min</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{likes}</span>
              </div>
            </div>
          </div>
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
        <div className="bg-white dark:bg-background rounded-xl border border-slate-200 dark:border-border overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
          {/* Image */}
          {imageUrl && (
            <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
              <Image
                src={imageUrl}
                alt={post.title.rendered}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Featured badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full shadow-lg">
                  注目
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            {/* Categories */}
            <div className="flex items-center gap-2 mb-3">
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2
              className="text-lg md:text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-slate-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
              {excerpt}
            </p>

            {/* Author & Meta */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-gray-800">
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
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{author.name}</span>
                    <time className="text-xs text-slate-500 dark:text-gray-400">
                      {formatDate(post.date)}
                    </time>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {readingTime}分
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-6.75-4.35-6.75-9.75A4.25 4.25 0 0112 7.25a4.25 4.25 0 016.75 4c0 5.4-6.75 9.75-6.75 9.75z" />
                  </svg>
                  {likes}
                </span>
              </div>
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
  const heroRef = useRef<HTMLDivElement>(null)

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

  // Hero animation
  useEffect(() => {
    if (heroRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".blog-subtitle", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        })

        gsap.from(".blog-title span", {
          y: 100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power4.out",
          delay: 0.2,
        })

        gsap.from(".blog-description", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          delay: 0.6,
          ease: "power3.out",
        })

        gsap.from(".blog-stats", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          delay: 0.8,
          ease: "power3.out",
        })

        gsap.from(".blog-search", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          delay: 1,
          ease: "power3.out",
        })
      }, heroRef)

      return () => ctx.revert()
    }
  }, [])

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
    <div className="min-h-screen bg-white dark:bg-background">
      <BlogHeader />

      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-background dark:via-gray-900 dark:to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/3 blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="pt-16 md:pt-20 relative z-10">
        {/* Hero Section - Editorial Style */}
        <div ref={heroRef} className="border-b border-slate-200 dark:border-border">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
            {/* Top Bar */}
            <div className="mb-12 md:mb-16">
              {/* Title */}
              <div className="blog-title">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-none">
                  {"Insights".split("").map((char, i) => (
                    <span key={i} className="inline-block">
                      {char}
                    </span>
                  ))}
                </h1>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="blog-search flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center">
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full px-5 py-3.5 pr-12 text-sm text-foreground bg-background border-2 border-foreground focus:outline-none focus:ring-4 focus:ring-foreground/20 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
                  />
                  {searchInput ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground transition-colors"
                      aria-label="Clear search"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <svg
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </form>

              <div className="blog-subtitle">
                <span className="text-sm text-slate-500 dark:text-gray-400">
                  {totalPosts} {totalPosts === 1 ? 'Article' : 'Articles'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  <span className="font-medium text-foreground">{totalPosts}</span> results for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={clearSearch}
                  className="text-sm text-slate-600 dark:text-gray-400 hover:text-foreground font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter - Clean Design */}
        <CategoryFilter
          categories={categories}
          searchQuery={searchQuery}
          clearSearch={clearSearch}
        />

        {/* Posts */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20">
          {loading ? (
            <div className="space-y-16">
              {/* Featured skeleton */}
              <div className="animate-pulse">
                <div className="aspect-[21/9] bg-slate-200 dark:bg-gray-700 mb-8" />
                <div className="space-y-4 max-w-3xl">
                  <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-12 bg-slate-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-full" />
                </div>
              </div>
              {/* Grid skeleton */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-slate-200 dark:bg-gray-700 mb-5" />
                    <div className="space-y-3">
                      <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/4" />
                      <div className="h-8 bg-slate-200 dark:bg-gray-700 rounded w-full" />
                      <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-gray-300 mb-6 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Reload Page
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-gray-300 text-lg">No articles found</p>
            </div>
          ) : (
            <>
              {/* Featured Hero Post */}
              {posts.length > 0 && currentPage === 1 && !searchQuery && (
                <div className="mb-16 md:mb-24">
                  <FeaturedHeroCard post={posts[0]} likes={likeCounts[posts[0].slug] || 0} />
                </div>
              )}

              {/* Regular Posts Grid */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
                {(currentPage === 1 && !searchQuery ? posts.slice(1) : posts).map((post) => (
                  <BlogCard key={post.id} post={post} likes={likeCounts[post.slug] || 0} />
                ))}
              </div>

              {/* Recommended Posts - Show only on first page without search */}
              {currentPage === 1 && !searchQuery && posts.length >= 3 && (
                <aside className="mt-20 md:mt-32 pt-12 border-t-2 border-foreground" aria-label="おすすめ記事">
                  <div className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      More Insights
                    </h2>
                  </div>

                  <BlogCarousel posts={posts} likeCounts={likeCounts} />
                </aside>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-20 md:mt-32 pt-12 border-t-2 border-foreground flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="group inline-flex items-center gap-3 text-base font-bold text-foreground hover:gap-2 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  <div className="hidden md:flex items-center gap-2">
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
                          className={`w-12 h-12 text-sm font-bold transition-all ${currentPage === pageNum
                            ? 'bg-foreground text-background'
                            : 'text-slate-400 dark:text-gray-600 hover:text-foreground'
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
                    className="group inline-flex items-center gap-3 text-base font-bold text-foreground hover:gap-4 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-24 md:mt-32">
          <BlogFooter />
        </div>
      </main>
    </div>
  )
}

// Loading component for Suspense fallback
function BlogPageLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <BlogHeader />

      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-background dark:via-gray-900 dark:to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/3 blur-3xl" />
      </div>

      <main className="pt-20 relative z-10">
        <div className="border-b border-slate-200 dark:border-border">
          <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-16">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-slate-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-10 w-64 bg-slate-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-6 w-96 bg-slate-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
          <div className="divide-y divide-slate-200 dark:divide-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-8 md:py-10 animate-pulse">
                <div className="aspect-[16/9] bg-slate-200 dark:bg-gray-700 mb-6" />
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-7 bg-slate-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-full" />
                </div>
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
