"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DEFAULT_BLOG_AUTHOR, getPosts, type BlogPost } from "@/lib/blog-content"

export function BlogTicker({ fixed = true }: { fixed?: boolean }) {
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    async function loadPosts() {
      try {
        const { posts: latestPosts } = await getPosts({ perPage: 10 }) // 最新10件
        setPosts(latestPosts)
      } catch (error) {
        console.error("Failed to load ticker posts:", error)
      }
    }
    loadPosts()
  }, [])

  if (posts.length === 0) return null

  // 記事を2回繰り返してシームレスなループを作る
  const duplicatedPosts = [...posts, ...posts]

  return (
    <div
      className={`${fixed ? "fixed top-0 left-0 right-0 z-50" : "relative"} bg-background text-foreground overflow-hidden border-b border-border`}
    >
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {duplicatedPosts.map((post, index) => {
            const authorName = DEFAULT_BLOG_AUTHOR.name

            return (
              <Link
                key={`${post.id}-${index}`}
                href={`/blog/${post.slug}`}
                className="ticker-item inline-flex items-center gap-3 px-5 hover:text-[#0f00b0] transition-colors"
              >
                {/* インデックス */}
                <span className="text-[10px] tracking-widest" style={{ opacity: 0.4 }}>
                  {String((index % posts.length) + 1).padStart(2, "0")}
                </span>

                {/* タイトル */}
                <span
                  className="text-xs md:text-sm"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />

                {/* 著者 */}
                <span className="text-[10px] tracking-wide" style={{ opacity: 0.45 }}>
                  {authorName}
                </span>

                {/* 区切り */}
                <span className="px-3 text-xs" style={{ opacity: 0.3 }} aria-hidden="true">
                  ·
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
          height: 40px;
          display: flex;
          align-items: center;
        }

        .ticker-content {
          display: flex;
          white-space: nowrap;
          animation: ticker 150s linear infinite;
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* ホバー時に一時停止 */
        .ticker-wrapper:hover .ticker-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
