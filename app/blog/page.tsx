"use client"

import { useEffect, useState, useCallback, Suspense, useRef, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
// import Masonry from 'react-masonry-css' // Replaced with custom masonry
import { gsap } from "gsap"
import { BlogHeader } from "@/components/blog-header"
import { Footer } from "@/components/footer"
import { EyeLoader } from "@/components/eye-loader"
import { SeoBanner } from "@/components/seo-banner"
import { N8nBanner } from "@/components/n8n-banner"
import { getPosts, getCategories, getFeaturedImageUrl, stripHtml, formatDate, getReadingTime, type WPPost, type WPCategory } from "@/lib/wordpress"
import { fetchLikeCounts } from "@/lib/blog-likes"

// Category Filter Component
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
              className={`flex-shrink-0 px-4 py-2 text-xs md:text-sm font-medium transition-all whitespace-nowrap rounded-full ${!searchQuery
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              All
            </button>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/categories/${category.slug}`}
                className="flex-shrink-0 px-4 py-2 text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap rounded-full"
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
function getCardVariant(index: number): 'tall' | 'wide' | 'square' {
  const patterns = ['tall', 'wide', 'square', 'tall', 'square', 'wide', 'square', 'tall', 'wide']
  return patterns[index % patterns.length] as 'tall' | 'wide' | 'square'
}

// Get estimated height for each variant (in relative units)
function getVariantHeight(variant: 'tall' | 'wide' | 'square'): number {
  return {
    tall: 4,      // aspect-[3/4] = taller
    wide: 2.25,   // aspect-[16/9] = shorter
    square: 3     // aspect-square = medium
  }[variant]
}

// Reorder posts to balance column heights using "shortest column first" algorithm
function balanceMasonryPosts<T>(
  posts: T[],
  columns: number,
  getHeight: (post: T, index: number) => number
): T[] {
  if (columns <= 1) return posts

  // Track height of each column
  const colHeights = new Array(columns).fill(0)
  // Track which posts go to which column
  const colPosts: T[][] = Array.from({ length: columns }, () => [])

  posts.forEach((post, index) => {
    const height = getHeight(post, index)
    // Find the shortest column
    const shortestCol = colHeights.indexOf(Math.min(...colHeights))
    // Add post to that column
    colPosts[shortestCol].push(post)
    // Update column height
    colHeights[shortestCol] += height
  })

  // Flatten posts back into single array, interleaving columns for masonry
  const result: T[] = []
  let maxLength = Math.max(...colPosts.map(col => col.length))
  for (let i = 0; i < maxLength; i++) {
    for (let col = 0; col < columns; col++) {
      if (colPosts[col][i]) {
        result.push(colPosts[col][i])
      }
    }
  }

  return result
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
function MasonryBlogCard({ post, likes = 0, index = 0 }: { post: WPPost; likes?: number; index?: number }) {
  const imageUrl = getFeaturedImageUrl(post, 'large')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []

  const variant = getCardVariant(index)
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

  // Extract a quote from the excerpt for "full" variant
  const getQuote = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
    return sentences[0]?.trim() || text.substring(0, 100)
  }

  return (
    <article className="group animate-fadeIn break-inside-avoid mb-6 md:mb-8">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          {/* Image Area */}
          <div className={`relative ${aspectRatios[finalVariant]} overflow-hidden bg-muted`}>
            <Image
              src={finalImageUrl}
              alt={post.title.rendered}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Category Badges - ホバー時に画像左下に表示 */}
            {categories.length > 0 && (
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <span key={category.id} className="inline-flex items-center px-2 py-1 text-[8px] md:text-[10px] font-bold text-accent bg-background/90 backdrop-blur-sm rounded-full shadow-lg border border-border/50">
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Text Area */}
          <div className="p-5 md:p-6 bg-card">
            {/* Meta - always show */}
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
              <time>{formatDate(post.date)}</time>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>

            {/* Title - always show */}
            <h3
              className="font-bold text-foreground group-hover:text-accent leading-tight text-lg md:text-xl line-clamp-2 mb-3 transition-colors duration-300"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Pattern 2: with-excerpt - show description */}
            {contentVariant === 'with-excerpt' && (
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {excerpt}
              </p>
            )}

            {/* Pattern 3: full - show description + quote */}
            {contentVariant === 'full' && (
              <>
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                  {excerpt}
                </p>
                <blockquote className="border-l-2 border-border pl-3 py-1">
                  <p className="text-muted-foreground/70 text-xs italic line-clamp-2">
                    &quot;{getQuote(excerpt)}...&quot;
                  </p>
                </blockquote>
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

  const [posts, setPosts] = useState<WPPost[]>([])
  const [categories, setCategories] = useState<WPCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalPosts, setTotalPosts] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})

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

  // Distribute posts into columns using "shortest column first" algorithm
  const columnPosts = useMemo(() => {
    if (currentColumns === 1) {
      return [posts]
    }

    const colHeights = new Array(currentColumns).fill(0)
    const columns: WPPost[][] = Array.from({ length: currentColumns }, () => [])

    posts.forEach((post, index) => {
      const variant = getCardVariant(index)
      const height = getVariantHeight(variant)

      // Find the shortest column
      const shortestCol = colHeights.indexOf(Math.min(...colHeights))

      // Add post to that column
      columns[shortestCol].push(post)

      // Update column height
      colHeights[shortestCol] += height
    })

    return columns
  }, [posts, currentColumns])

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />

      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      </div>

      {/* Main Content */}
      <main className="pt-[104px] md:pt-[120px] relative z-10">
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

              {/* Search */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search Articles"
                    className="w-full px-6 py-4 pr-12 text-base text-foreground bg-background border-2 border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                  />
                  {searchInput ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Clear search"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <svg
                      className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="bg-primary/5 border-b border-primary/20">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">
                  <span className="font-semibold text-primary">{totalPosts}</span> results for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={clearSearch}
                  className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Clear
                </button>
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
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v11a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-lg">No articles found</p>
            </div>
          ) : (
            <>
              {/* Banner Row - SEO (1 col) + n8n (2 cols) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
                {/* SEO Banner - 1 column */}
                <div className="md:col-span-1">
                  <SeoBanner />
                </div>

                {/* n8n Banner - 2 columns */}
                <div className="md:col-span-2">
                  <N8nBanner />
                </div>
              </div>

              {/* Custom Masonry Grid */}
              <div className="flex gap-6 md:gap-8 items-start">
                {columnPosts.map((columnItems, colIndex) => (
                  <div key={colIndex} className="flex-1 space-y-6 md:space-y-8">
                    {/* Posts in this column */}
                    {columnItems.map((post) => {
                      const globalIndex = posts.indexOf(post)
                      return (
                        <MasonryBlogCard
                          key={post.id}
                          post={post}
                          likes={likeCounts[post.slug] || 0}
                          index={globalIndex}
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

        {/* Footer - 最後の記事が表示された後のみ表示 */}
        {!hasMore && posts.length > 0 && (
          <div className="mt-12 md:mt-16">
            <Footer />
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
    <div className="min-h-screen bg-background">
      <BlogHeader />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      </div>

      <main className="pt-[120px] relative z-10">
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
