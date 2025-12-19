"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getPosts, type WPPost } from "@/lib/wordpress"

export function BlogTicker() {
  const [posts, setPosts] = useState<WPPost[]>([])

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
    <div className="fixed top-0 left-0 right-0 z-50 bg-background text-foreground overflow-hidden border-b border-border">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {duplicatedPosts.map((post, index) => {
            const author = post._embedded?.author?.[0]
            const authorName = author?.name || "tent space"
            const avatarUrl = author?.avatar_urls?.["48"] || author?.avatar_urls?.["96"] || ""

            return (
              <Link
                key={`${post.id}-${index}`}
                href={`/blog/${post.slug}`}
                className="ticker-item inline-flex items-center gap-3 px-6 hover:text-primary transition-colors"
              >
                {/* 著者名 */}
                <span className="text-sm font-medium text-muted-foreground">
                  {authorName}
                </span>

                {/* アイコン */}
                {avatarUrl ? (
                  <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-border">
                    <Image
                      src={avatarUrl}
                      alt={authorName}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-4 h-4 md:w-6 md:h-6 bg-muted rounded-full flex items-center justify-center text-[8px] md:text-xs font-bold text-muted-foreground border border-border">
                    {authorName[0]}
                  </div>
                )}

                {/* タイトル */}
                <span
                  className="text-xs md:text-sm font-light"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />

                {/* 区切り */}
                <span className="px-4"></span>
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
