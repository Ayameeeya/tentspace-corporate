"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { type WPPost, getFeaturedImageUrl, stripHtml, formatDate } from "@/lib/wordpress"

interface BlogCarouselProps {
  posts: WPPost[]
  likeCounts: Record<string, number>
}

export function BlogCarousel({ posts, likeCounts }: BlogCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollPosition()
    container.addEventListener("scroll", checkScrollPosition)
    window.addEventListener("resize", checkScrollPosition)

    return () => {
      container.removeEventListener("scroll", checkScrollPosition)
      window.removeEventListener("resize", checkScrollPosition)
    }
  }, [posts])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const targetScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    })
  }

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current
    if (!container) return

    setIsDragging(true)
    setStartX(e.pageX - container.offsetLeft)
    setScrollLeft(container.scrollLeft)
    container.style.cursor = "grabbing"
    container.style.userSelect = "none"
  }

  const handleMouseLeave = () => {
    if (!isDragging) return
    setIsDragging(false)
    const container = scrollContainerRef.current
    if (container) {
      container.style.cursor = "grab"
      container.style.userSelect = "auto"
    }
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    const container = scrollContainerRef.current
    if (container) {
      container.style.cursor = "grab"
      container.style.userSelect = "auto"
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const container = scrollContainerRef.current
    if (!container) return

    const x = e.pageX - container.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    container.scrollLeft = scrollLeft - walk
  }

  // Limit to 10 posts
  const displayPosts = posts.slice(0, 10)

  return (
    <div className="relative">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-background rounded-full shadow-lg border border-gray-200 dark:border-border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="前へ"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide cursor-grab"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {displayPosts.map((post) => {
          const imageUrl = getFeaturedImageUrl(post, "medium")
          const postCategories = post._embedded?.["wp:term"]?.[0] || []
          const likeCount = likeCounts[post.slug] || 0
          return (
            <Link
              key={`recommend-${post.id}`}
              href={`/blog/${post.slug}`}
              className="flex-shrink-0 w-64 group"
              draggable={false}
            >
              <div className="bg-white dark:bg-background rounded-xl border border-gray-200 dark:border-border overflow-hidden hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                {imageUrl && (
                  <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={imageUrl}
                      alt={stripHtml(post.title.rendered)}
                      fill
                      className="object-cover"
                      draggable={false}
                    />
                  </div>
                )}
                <div className="p-3">
                  {postCategories[0] && (
                    <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded mb-1.5">
                      {postCategories[0].name}
                    </span>
                  )}
                  <h3
                    className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
                    <span>{formatDate(post.date)}</span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 21s-6.75-4.35-6.75-9.75A4.25 4.25 0 0112 7.25a4.25 4.25 0 016.75 4c0 5.4-6.75 9.75-6.75 9.75z"
                        />
                      </svg>
                      {likeCount}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-background rounded-full shadow-lg border border-gray-200 dark:border-border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="次へ"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

