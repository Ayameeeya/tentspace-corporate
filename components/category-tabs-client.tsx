"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import type { WPCategory } from "@/lib/wordpress"

export function CategoryTabsClient({
  categories,
  currentSlug
}: {
  categories: WPCategory[]
  currentSlug: string
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
          {/* Fade Gradients & Scroll Buttons */}
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
            <Link
              href="/blog"
              className="flex-shrink-0 px-4 py-2 text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap rounded-full"
            >
              All
            </Link>
            {categories.filter(c => c.count > 0).map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/categories/${cat.slug}`}
                className={`flex-shrink-0 px-4 py-2 text-xs md:text-sm font-medium transition-all whitespace-nowrap rounded-full ${cat.slug === currentSlug
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
