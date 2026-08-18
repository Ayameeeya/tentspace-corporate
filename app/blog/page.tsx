"use client"

import { useEffect, useLayoutEffect, useState, useCallback, Suspense, useRef, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
// import Masonry from 'react-masonry-css' // Replaced with custom masonry
import { gsap } from "gsap"
import { MonoBlogNav } from "@/components/home/MonoBlogNav"
import { MonoFooterStandalone } from "@/components/home/MonoFooterStandalone"
import { EyeLoader } from "@/components/eye-loader"
import { SeoBanner } from "@/components/seo-banner"
import { N8nBanner } from "@/components/n8n-banner"
import GlassSurface from "@/components/GlassSurface"
import { getPosts, getCategories, getFeaturedImageUrl, getPostTerms, stripHtml, formatDate, type BlogPost } from "@/lib/blog-content"
import type { BlogCategory } from "@/lib/content/manifest-query"
import { fetchLikeCounts } from "@/lib/blog-likes"

// Category Filter Component
function CategoryFilter({
  categories,
  searchQuery,
  clearSearch
}: {
  categories: BlogCategory[]
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
    <div className="bg-background border-b border-border">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative group">
          {showLeftFade && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-background rounded-full shadow-lg border border-border items-center justify-center hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}
          {showRightFade && (
            <>
              <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-background rounded-full shadow-lg border border-border items-center justify-center hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide scroll-smooth px-6 md:px-12 lg:px-16"
          >
            <button
              onClick={() => clearSearch()}
              className={`flex-shrink-0 px-4 py-1.5 text-xs md:text-sm transition-all whitespace-nowrap border ${!searchQuery
                ? 'bg-black text-white border-black'
                : 'bg-transparent text-muted-foreground border-transparent hover:border-black hover:text-foreground'
                }`}
            >
              all
            </button>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/categories/${category.slug}`}
                className="flex-shrink-0 px-4 py-1.5 text-xs md:text-sm text-muted-foreground border border-transparent hover:border-black hover:text-foreground transition-colors whitespace-nowrap"
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

// Get random card variant for visual variety
function getCardVariant(index: number, isMobile: boolean = false): 'tall' | 'wide' | 'square' {
  // Mobile: only wide and square
  if (isMobile) {
    const mobilePatterns = ['wide', 'square', 'square', 'wide', 'square', 'wide']
    return mobilePatterns[index % mobilePatterns.length] as 'tall' | 'wide' | 'square'
  }
  // Desktop: tall, wide, and square
  const patterns = ['tall', 'wide', 'square', 'tall', 'square', 'wide', 'square', 'tall', 'wide']
  return patterns[index % patterns.length] as 'tall' | 'wide' | 'square'
}

// Get random fallback image - no duplicates within 10 posts, consistent for each post
function getFallbackImage(postId: number, index: number): string {
  const images = [
    '/blog-placeholders/annie-spratt-oCqCLEPOf40.jpg',
    '/blog-placeholders/krystal-ng-1PlVbeOCd78.jpg',
    '/blog-placeholders/bharath-kumar-biXeua5P7ZU.jpg',
    '/blog-placeholders/olli-kilpi-K7EEEPFFjh0.jpg',
    '/blog-placeholders/resource-database-KhPkJtxuYg0.jpg',
    '/blog-placeholders/alex-sherstnev-MnJy18t6Doo.jpg',
    '/blog-placeholders/katie-doherty-6RRtOg4AI28.jpg',
    '/blog-placeholders/russ-lee-vJmW9KI9-ig.jpg',
    '/blog-placeholders/krystal-ng-PrQqQVPzmlw.jpg',
    '/blog-placeholders/maxim-tolchinskiy-MJB86VteX64.jpg'
  ]

  // Calculate block and position within block
  const blockIndex = Math.floor(index / 10)
  const positionInBlock = index % 10

  // Create pseudo-random offset for each block using blockIndex
  // Using prime number (7) to ensure good distribution
  const blockOffset = (blockIndex * 7) % 10

  // Use postId to ensure same post always gets same image
  const postOffset = Math.abs(postId * 2654435761) % 10

  // Combine offsets to get final image index
  const imageIndex = (positionInBlock + blockOffset + postOffset) % 10

  return images[imageIndex]
}

// Get content display variant (title only, title + excerpt, or full)
function getContentVariant(index: number): 'title-only' | 'with-excerpt' | 'full' {
  const patterns: Array<'title-only' | 'with-excerpt' | 'full'> = [
    'with-excerpt', 'title-only', 'full', 'with-excerpt', 'title-only', 'full', 'with-excerpt', 'full', 'title-only'
  ]
  return patterns[index % patterns.length]
}

// Masonry Blog Card with varying heights
function MasonryBlogCard({ post, likes = 0, index = 0, isMobile = false }: { post: BlogPost; likes?: number; index?: number; isMobile?: boolean }) {
  const imageUrl = getFeaturedImageUrl(post)
  const excerpt = stripHtml(post.description)
  const readingTime = post.readingTime
  const categories = getPostTerms(post)

  const variant = getCardVariant(index, isMobile)
  const contentVariant = getContentVariant(index)

  // Wide uses actual thumbnail, Tall/Square use dummy images (random based on post ID and index)
  const finalImageUrl = variant === 'wide' && imageUrl ? imageUrl : getFallbackImage(post.id, index)
  const finalVariant = variant

  // Define aspect ratios for different variants
  const aspectRatios = {
    tall: 'aspect-[3/4]',
    wide: 'aspect-[16/9]',
    square: 'aspect-[4/5]'
  }

  return (
    <article className="group animate-fadeIn break-inside-avoid mb-6 md:mb-8">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
          {/* Image Area with Notch */}
          <div className={`relative ${aspectRatios[finalVariant]} bg-card`}>
            <div className="absolute inset-0" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), 75% calc(100% - 24px), 70% 100%, 0 100%)'
            }}>
              <Image
                src={finalImageUrl}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Category Badges - ホバー時に画像左下に表示 */}
            {categories.length > 0 && (
              <div className="absolute bottom-8 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-wrap gap-1.5 z-10">
                {categories.map((category) => (
                  <GlassSurface
                    key={category.id}
                    width="auto"
                    height={24}
                    borderRadius={12}
                    blur={6}
                    className="px-2 py-0.5"
                  >
                    <span className="text-[8px] md:text-[10px] font-bold text-white whitespace-nowrap" style={{ mixBlendMode: 'difference' }}>
                      {category.name}
                    </span>
                  </GlassSurface>
                ))}
              </div>
            )}
          </div>

          {/* Text Area */}
          <div className="p-5 md:p-6 bg-card relative -mt-2">
            {/* Meta - always show */}
            <div
              className="flex items-baseline justify-between gap-2 pb-2.5 mb-3 text-[11px] tracking-wide text-muted-foreground"
              style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.55)" }}
            >
              <time>{formatDate(post.date)}</time>
              <span>{readingTime} min read</span>
            </div>

            {/* Title - always show */}
            <h3
              className="font-bold text-foreground group-hover:text-[#0f00b0] leading-tight text-lg md:text-xl line-clamp-2 mb-3 transition-colors duration-300"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />

            {/* Pattern 2: with-excerpt - show description */}
            {contentVariant === 'with-excerpt' && (
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {excerpt}
              </p>
            )}

            {/* Pattern 3: full - show description + category tags */}
            {contentVariant === 'full' && (
              <>
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                  {excerpt}
                </p>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {categories.slice(0, 3).map((category) => (
                      <span
                        key={category.id}
                        className="px-2 py-0.5 text-[10px] text-muted-foreground"
                        style={{ border: "1px solid rgba(0, 0, 0, 0.55)" }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}

// Blog Page Content Component with Infinite Scroll & Masonry
function BlogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const heroRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalPosts, setTotalPosts] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hero animation
  useEffect(() => {
    if (heroRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".blog-hero-content", {
          y: 30,
          opacity: 0,
          duration: 0.8,
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
    setPosts([])
    setCurrentPage(1)
    setHasMore(true)
    updateURL(searchInput)
  }

  // Clear search
  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    setPosts([])
    setCurrentPage(1)
    setHasMore(true)
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
  const fetchPosts = useCallback(async (page: number, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const { posts: fetchedPosts, totalPages, total: totalCount } = await getPosts({
        page,
        perPage: 12,
        search: searchQuery || undefined,
      })

      if (isLoadMore) {
        setPosts(prev => [...prev, ...fetchedPosts])
      } else {
        setPosts(fetchedPosts)
      }

      setHasMore(page < totalPages)
      setTotalPosts(totalCount)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch posts:', err)
      setError('記事の取得に失敗しました')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [searchQuery])

  // Initial fetch
  useEffect(() => {
    setPosts([])
    setCurrentPage(1)
    setHasMore(true)
    fetchPosts(1, false)
  }, [searchQuery, fetchPosts])

  // Fetch like counts for current posts
  useEffect(() => {
    async function loadLikeCounts() {
      if (posts.length === 0) return
      try {
        const slugs = posts.map((p) => p.slug)
        const counts = await fetchLikeCounts(slugs)
        setLikeCounts(prev => ({ ...prev, ...counts }))
      } catch (err) {
        // Silently fail - likes are optional feature
        console.warn("Could not load like counts")
      }
    }
    loadLikeCounts()
  }, [posts])

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = currentPage + 1
          setCurrentPage(nextPage)
          fetchPosts(nextPage, true)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasMore, loadingMore, loading, currentPage, fetchPosts])

  // Detect current column count based on window width
  const [currentColumns, setCurrentColumns] = useState(3)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width <= 700) {
        setCurrentColumns(1)
      } else if (width <= 1100) {
        setCurrentColumns(2)
      } else {
        setCurrentColumns(3)
      }
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // ---- masonry assignment ----
  // Append-only: new batches are placed onto the *measured* shortest column, so
  // estimation drift from earlier batches self-corrects and cards never move.
  // Ties break toward the column with fewer items (no systematic left bias).
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])
  const assignRef = useRef<{ count: number; cols: number; firstId: number | null; columns: number[][] }>({
    count: 0,
    cols: 0,
    firstId: null,
    columns: [],
  })
  const [columnAssign, setColumnAssign] = useState<number[][]>([])

  // estimated card height in units of column width: image aspect + text block
  const estimateHeight = useCallback((index: number, isMobileLayout: boolean) => {
    const variant = getCardVariant(index, isMobileLayout)
    const aspect = { tall: 4 / 3, wide: 9 / 16, square: 5 / 4 }[variant]
    const content = getContentVariant(index)
    const text = { "title-only": 0.42, "with-excerpt": 0.6, full: 0.82 }[content]
    return aspect + text
  }, [])

  const pickShortest = (colHeights: number[], columns: number[][], tolerance: number) => {
    let target = 0
    for (let c = 1; c < colHeights.length; c++) {
      const diff = colHeights[c] - colHeights[target]
      if (diff < -tolerance || (Math.abs(diff) <= tolerance && columns[c].length < columns[target].length)) {
        target = c
      }
    }
    return target
  }

  useLayoutEffect(() => {
    const cols = currentColumns
    if (cols === 1) return
    const meta = assignRef.current
    const isMobileLayout = cols <= 2
    const reset =
      cols !== meta.cols || posts.length < meta.count || (posts.length > 0 && meta.firstId !== posts[0].id)
    const colWidth = columnRefs.current[0]?.offsetWidth || 400

    let columns: number[][]
    let colHeights: number[]
    let start: number
    if (reset || meta.count === 0) {
      columns = Array.from({ length: cols }, () => [])
      colHeights = new Array(cols).fill(0)
      start = 0
    } else {
      columns = meta.columns.map((c) => [...c])
      // rendered reality replaces the estimates accumulated so far
      colHeights = columns.map((_, i) => columnRefs.current[i]?.offsetHeight ?? 0)
      start = meta.count
    }
    if (start >= posts.length && !reset) return

    for (let i = start; i < posts.length; i++) {
      const h = estimateHeight(i, isMobileLayout) * colWidth
      const target = pickShortest(colHeights, columns, 1)
      columns[target].push(i)
      colHeights[target] += h
    }
    assignRef.current = { count: posts.length, cols, firstId: posts[0]?.id ?? null, columns }
    setColumnAssign(columns)
  }, [posts, currentColumns, estimateHeight])

  // columns of post indices — render only what has been assigned; newly loaded
  // posts appear one layout-pass later, after their column has been decided
  // against the *measured* heights of the already-rendered cards
  const columnPosts = useMemo(() => {
    if (currentColumns === 1) return [posts.map((_, i) => i)]
    if (columnAssign.length > 0) return columnAssign
    return Array.from({ length: currentColumns }, () => [] as number[])
  }, [posts, columnAssign, currentColumns])

  return (
    <div className="min-h-screen bg-[#e5e5e5]">
      <MonoBlogNav />

      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      </div>

      {/* Main Content */}
      <main id="main-content" className="pt-[104px] md:pt-[120px] relative z-10">
        {/* Hero Section */}
        <div ref={heroRef} className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
            <div className="blog-hero-content text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Insights & Ideas
              </h1>
              <p className="text-base md:text-lg text-muted-foreground font-pixel mb-8">
                Exploring the intersection of AI, design, and technology. Deep dives into innovation that shapes the future.
              </p>

              {/* Terminal Search */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                <div className="rounded-lg overflow-hidden border border-border/50 shadow-2xl backdrop-blur-sm bg-card/80">
                  {/* Terminal Toolbar */}
                  <div className="flex items-center justify-between h-8 px-3 bg-gradient-to-b from-muted/80 to-muted/60 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-sm" />
                    </div>
                  </div>

                  {/* Terminal Body */}
                  <div className="bg-background/95 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 text-sm md:text-base font-mono">
                      <span className="text-[#1eff8e] font-semibold">guest</span>
                      <span className="text-muted-foreground">@</span>
                      <span className="text-[#4878c0] font-semibold">blog</span>
                      <span className="text-muted-foreground">:</span>
                      <span className="text-[#4878c0]">~</span>
                      <span className="text-primary">$</span>
                      <div className="flex-1 relative">
                        <label htmlFor="blog-search" className="sr-only">
                          記事を検索
                        </label>
                        <input
                          id="blog-search"
                          name="query"
                          type="text"
                          autoComplete="off"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="search articles..."
                          className="w-full bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground/50 font-mono caret-primary"
                        />
                        {!searchInput && (
                          <span className="absolute left-0 top-0 inline-block w-2 h-5 bg-primary animate-pulse ml-0.5" style={{
                            animation: 'terminal-cursor 1.2s step-end infinite'
                          }} />
                        )}
                      </div>
                      {searchInput && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="bg-foreground/5">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-3">
              <div className="flex items-center justify-between">
                <p className="text- md:text-lg text-foreground font-pixel text-muted-foreground">
                  <span className="font-semibold">{totalPosts}</span> results for &quot;{searchQuery}&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          searchQuery={searchQuery}
          clearSearch={clearSearch}
        />

        {/* Masonry Posts Grid */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
          <h2 className="sr-only">記事一覧</h2>
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <EyeLoader />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-muted-foreground mb-6 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-foreground text-background text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Reload
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-16 mx-auto max-w-md py-14 px-8 text-center" style={{ border: "1px solid #000", background: "#fff" }}>
              <p className="text-[11px] tracking-widest mb-3" style={{ opacity: 0.45 }}>
                no articles found
              </p>
              <p className="text-sm text-muted-foreground">
                該当する記事が見つかりませんでした。
                <br />
                条件を変えてお試しください。
              </p>
            </div>
          ) : (
            <>
              {/* Banner Row - SEO (1 col) + n8n (2 cols) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
                {/* SEO Banner - 1 column on desktop, full width on mobile */}
                <div className="md:col-span-1">
                  <SeoBanner layout="vertical" />
                </div>

                {/* n8n Banner - 2 columns on desktop, full width on mobile */}
                <div className="md:col-span-2">
                  <N8nBanner layout={isMobile ? "vertical" : "horizontal"} />
                </div>
              </div>

              {/* Custom Masonry Grid */}
              <div className="flex gap-6 md:gap-8 items-start">
                {columnPosts.map((columnItems, colIndex) => (
                  <div
                    key={colIndex}
                    ref={(el) => {
                      columnRefs.current[colIndex] = el
                    }}
                    className="flex-1 space-y-6 md:space-y-8"
                  >
                    {/* Posts in this column (indices into posts) */}
                    {columnItems.map((postIndex) => {
                      const post = posts[postIndex]
                      if (!post) return null
                      const isMobileLayout = currentColumns <= 2
                      return (
                        <MasonryBlogCard
                          key={post.id}
                          post={post}
                          likes={likeCounts[post.slug] || 0}
                          index={postIndex}
                          isMobile={isMobileLayout}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Load More Trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="mt-12 flex justify-center">
                  {loadingMore && (
                    <EyeLoader />
                  )}
                </div>
              )}

              {/* End Message */}
              {!hasMore && posts.length > 0 && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <EyeLoader variant="end" />
                  <p className="text-xs md:text-sm text-muted-foreground font-pixel">That's a wrap!</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - 読み込み完了後に表示（記事ゼロの場合も含む） */}
        {!loading && (!hasMore || posts.length === 0) && (
          <div className="mt-12 md:mt-16">
            <MonoFooterStandalone />
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

// Loading component for Suspense fallback
function BlogPageLoading() {
  return (
    <div className="min-h-screen bg-[#e5e5e5]">
      <MonoBlogNav />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      </div>

      <main id="main-content" className="pt-[120px] relative z-10">
        <div className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
            <div className="text-center max-w-3xl mx-auto animate-pulse">
              <div className="h-12 bg-muted rounded w-3/4 mx-auto mb-4" />
              <div className="h-6 bg-muted rounded w-full mb-8" />
              <div className="h-12 bg-muted rounded-full max-w-xl mx-auto" />
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-card rounded-xl border border-border">
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
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
