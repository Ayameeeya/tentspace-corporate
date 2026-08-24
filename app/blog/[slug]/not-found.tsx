"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TentBlogNav } from "@/components/home/TentBlogNav"
import { TentFooterStandalone } from "@/components/home/TentFooterStandalone"
import { MainBtn } from "@/components/home/MainBtn"
import { ScrambleText } from "@/components/home/ScrambleText"
import { formatDate, getPosts, stripHtml, type BlogPost } from "@/lib/blog-content"

export default function NotFound() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState("")
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    getPosts({ perPage: 3 })
      .then(({ posts }) => setRecentPosts(posts))
      .catch(() => {
        // 取得できなくても 404 ページ自体は成立する
      })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  return (
    <div className="tent-page min-h-screen" style={{ background: "#ffffff" }}>
      <TentBlogNav />

      <main
        id="main-content"
        className="px-4 pb-20"
        style={{ paddingTop: "calc(var(--blog-nav-h, 128px) + 4rem)" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Error Message */}
          <p className="mb-3 text-[11px] tracking-widest" style={{ opacity: 0.45 }}>
            404
          </p>
          <ScrambleText as="h1" className="heading-xl" mode="load" intensity={5}>
            article not found
          </ScrambleText>
          <p className="jp-heading mt-6 mb-10 text-sm leading-[1.9]" style={{ opacity: 0.64 }}>
            お探しの記事は削除されたか、URLが変更された可能性があります。
            <br />
            検索するか、記事一覧からお探しください。
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-10 flex max-w-xl gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="キーワードで記事を探す"
              aria-label="記事を検索"
              className="flex-1 border border-black bg-white px-4 py-2.5 text-sm placeholder:text-black/40 focus:outline-none focus:border-[#0f00b0]"
            />
            <button
              type="submit"
              className="cursor-crosshair border border-black bg-white px-5 py-2.5 text-sm transition-colors hover:bg-black hover:text-white"
            >
              検索
            </button>
          </form>

          <MainBtn label="back to blog" href="/blog" variant="inside" />

          {/* Recent Posts */}
          {recentPosts.length > 0 && (
            <aside className="mt-16" aria-label="最新の記事">
              <div className="mb-2 flex items-baseline gap-3">
                <h2 className="text-sm font-bold">最新の記事</h2>
                <span className="text-[11px] tracking-widest" style={{ opacity: 0.45 }}>
                  latest
                </span>
              </div>
              <ul>
                {recentPosts.map((post) => (
                  <li key={post.id} style={{ borderBottom: "1px solid var(--m-ink, #000)" }}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4"
                    >
                      <time className="text-xs tabular-nums" style={{ opacity: 0.45 }}>
                        {formatDate(post.date)}
                      </time>
                      <span className="jp-heading flex-1 min-w-0 text-sm transition-colors group-hover:text-[#0f00b0]">
                        {stripHtml(post.title)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </main>

      <div className="mt-16">
        <TentFooterStandalone />
      </div>
    </div>
  )
}
