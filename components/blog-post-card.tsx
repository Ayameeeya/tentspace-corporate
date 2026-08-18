"use client"

import Link from "next/link"
import Image from "next/image"
import GlassSurface from "@/components/GlassSurface"
import {
  getFeaturedImageUrl,
  getPostTerms,
  stripHtml,
  formatDate,
  type BlogPost,
} from "@/lib/blog-content"

/**
 * ブログ一覧（MasonryBlogCard）と同じ意匠の記事カード。
 * ガイドLPなど一覧以外のページから使う共通版（16:9・実サムネイル固定）。
 */
export function BlogPostCard({ post }: { post: BlogPost }) {
  const imageUrl = getFeaturedImageUrl(post)
  const excerpt = stripHtml(post.description)
  const readingTime = post.readingTime
  const categories = getPostTerms(post)

  return (
    <article className="group break-inside-avoid">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="h-full bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
          {/* Image Area with Notch */}
          <div className="relative aspect-[16/9] bg-card">
            <div
              className="absolute inset-0"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 24px), 75% calc(100% - 24px), 70% 100%, 0 100%)",
              }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={stripHtml(post.title)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-100 dark:bg-gray-800" />
              )}
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
                    <span
                      className="text-[8px] md:text-[10px] font-bold text-white whitespace-nowrap"
                      style={{ mixBlendMode: "difference" }}
                    >
                      {category.name}
                    </span>
                  </GlassSurface>
                ))}
              </div>
            )}
          </div>

          {/* Text Area */}
          <div className="p-5 md:p-6 bg-card relative -mt-2">
            <div
              className="flex items-baseline justify-between gap-2 pb-2.5 mb-3 text-[11px] tracking-wide text-muted-foreground"
              style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.55)" }}
            >
              <time>{formatDate(post.date)}</time>
              <span>{readingTime} min read</span>
            </div>

            <h3
              className="font-bold text-foreground group-hover:text-[#0f00b0] leading-tight text-lg md:text-xl line-clamp-2 mb-3 transition-colors duration-300"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />

            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{excerpt}</p>
          </div>
        </div>
      </Link>
    </article>
  )
}
