"use client"

import { useEffect, useLayoutEffect, useState, useCallback, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
// import Masonry from 'react-masonry-css' // Replaced with custom masonry
import { MonoBlogNav } from "@/components/home/MonoBlogNav"
import { MonoFooterStandalone } from "@/components/home/MonoFooterStandalone"
import { CategoryTabsClient } from "@/components/category-tabs-client"
import { EyeLoader } from "@/components/eye-loader"
import { SeoBanner } from "@/components/seo-banner"
import { N8nBanner } from "@/components/n8n-banner"
import GlassSurface from "@/components/GlassSurface"
import { BlogPagination } from "@/components/blog-pagination"
import {
  getPosts,
  getFeaturedImageUrl,
  getPostTerms,
  stripHtml,
  formatDate,
  type BlogPost,
} from "@/lib/blog-content"
import { distributePostIndices, type BlogCategory } from "@/lib/content/manifest-query"
import { fetchLikeCounts } from "@/lib/blog-likes"

// Get random card variant
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

// Get content display variant
function getContentVariant(index: number): 'title-only' | 'with-excerpt' | 'full' {
  const patterns: Array<'title-only' | 'with-excerpt' | 'full'> = [
    'with-excerpt', 'title-only', 'full', 'with-excerpt', 'title-only', 'full', 'with-excerpt', 'full', 'title-only'
  ]
  return patterns[index % patterns.length]
}

// Masonry Blog Card
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

            {/* Pattern 3: full - show description + quote */}
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

export function CategoryPageClient({
  initialCategory,
  initialCategories,
  initialPosts,
  initialPage,
  initialTotalPages,
  initialTotalPosts,
}: {
  initialCategory: BlogCategory
  initialCategories: BlogCategory[]
  initialPosts: BlogPost[]
  initialPage: number
  initialTotalPages: number
  initialTotalPosts: number
}) {
  const category = initialCategory
  const categories = initialCategories
  const slug = category.slug
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(initialPage < initialTotalPages)
  const [totalPosts, setTotalPosts] = useState(initialTotalPosts)
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

  // Fetch posts
  const fetchPosts = useCallback(async (page: number, isLoadMore: boolean = false) => {
    if (!category) return

    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const { posts: fetchedPosts, totalPages, total: totalCount } = await getPosts({
        categories: [category.id],
        page,
        perPage: 12,
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
  }, [category])

  // Fetch like counts
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
      if (width < 768) {
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
  // estimation drift self-corrects and cards never move. Ties break toward the
  // column with fewer items (no systematic left bias).
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])
  const assignRef = useRef<{ count: number; cols: number; firstId: number | null; columns: number[][] }>({
    count: 0,
    cols: 0,
    firstId: null,
    columns: [],
  })
  const [columnAssign, setColumnAssign] = useState<number[][]>([])

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
    if (cols === 1) {
      // single column: drop any multi-column assignment so columnPosts
      // falls back to the simple 1-column distribution
      assignRef.current = { count: 0, cols: 0, firstId: null, columns: [] }
      setColumnAssign((prev) => (prev.length > 0 ? [] : prev))
      return
    }
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

  // columns of post indices — render only what has been assigned
  const columnPosts = useMemo(() => {
    if (columnAssign.length > 0) return columnAssign
    return distributePostIndices(posts.length, currentColumns)
  }, [posts, columnAssign, currentColumns])

  return (
    <div className="min-h-screen bg-background">
      <MonoBlogNav ticker />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      </div>

      <main id="main-content" className="pt-[calc(var(--blog-nav-h,128px)+1.5rem)] relative z-10">
        <div className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
            <div className="text-center max-w-3xl mx-auto">
              {category && (
                <>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-base md:text-lg text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: category.description }} />
                  )}
                  <p className="text-base text-muted-foreground font-pixel">
                    {totalPosts} {totalPosts === 1 ? 'Article' : 'Articles'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <CategoryTabsClient
          categories={categories}
          currentSlug={slug}
        />

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
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-8 mx-auto max-w-md py-14 px-8 text-center" style={{ border: "1px solid #000", background: "#fff" }}>
              <p className="text-[11px] tracking-widest mb-3" style={{ opacity: 0.45 }}>
                no articles yet
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                このカテゴリの記事は準備中です。
              </p>
              <Link
                href="/blog"
                className="inline-block px-5 py-2 text-xs border border-black hover:bg-black hover:text-white transition-colors"
              >
                すべての記事を見る
              </Link>
            </div>
          ) : (
            <>
              {/* Category-specific Banner */}
              {category && (
                <div className="mb-6 md:mb-8">
                  {category.slug === 'seo' && <SeoBanner layout={isMobile ? "vertical" : "horizontal"} />}
                  {category.slug === 'n8n' && <N8nBanner layout={isMobile ? "vertical" : "horizontal"} />}
                </div>
              )}

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

              <BlogPagination
                basePath={`/blog/categories/${slug}`}
                currentPage={initialPage}
                totalPages={initialTotalPages}
              />

              {hasMore && (
                <div ref={loadMoreRef} className="mt-12 flex justify-center">
                  {loadingMore && (
                    <EyeLoader />
                  )}
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <EyeLoader variant="end" />
                  <p className="text-xs md:text-sm text-muted-foreground font-pixel">That's all for now!</p>
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
