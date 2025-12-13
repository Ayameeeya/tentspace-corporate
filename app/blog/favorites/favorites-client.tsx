"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabaseAuth } from "@/lib/supabase/client"
import { BlogHeader } from "@/components/blog-header"
import { Heart, Loader2 } from "lucide-react"
import { type WPPost, stripHtml, formatDate, getFeaturedImageUrl } from "@/lib/wordpress"

interface Favorite {
  id: string
  post_slug: string
  created_at: string
}

export default function FavoritesClient() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [posts, setPosts] = useState<WPPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadFavorites()
    } else if (!loading) {
      setLoadingPosts(false)
    }
  }, [user, loading])

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const loadFavorites = async () => {
    if (!user) return

    setLoadingPosts(true)
    try {
      // Get user's favorites
      const { data: favoritesData, error } = await supabaseAuth
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setFavorites(favoritesData || [])

      // Fetch post details from WordPress
      if (favoritesData && favoritesData.length > 0) {
        const slugs = favoritesData.map((f) => f.post_slug)
        await fetchPosts(slugs)
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const fetchPosts = async (slugs: string[]) => {
    try {
      const WP_API_URL = 'https://blog.tentspace.net/wp-json/wp/v2'
      
      // Decode slugs if they are already encoded
      const decodedSlugs = slugs.map(slug => {
        try {
          // If slug is already encoded, decode it
          return decodeURIComponent(slug)
        } catch {
          return slug
        }
      })
      
      // WordPress REST APIで各記事を個別に取得
      const postPromises = decodedSlugs.map(async (slug) => {
        const response = await fetch(
          `${WP_API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed`
        )
        if (!response.ok) return null
        const data = await response.json()
        return data[0] || null
      })
      
      const postsData = await Promise.all(postPromises)
      const validPosts = postsData.filter((post): post is WPPost => post !== null)
      setPosts(validPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setPosts([])
    }
  }

  const handleRemoveFavorite = async (postSlug: string) => {
    if (!user) return

    try {
      await supabaseAuth
        .from("favorites")
        .delete()
        .eq("post_slug", postSlug)
        .eq("user_id", user.id)

      // Optimistic update
      setFavorites((prev) => prev.filter((f) => f.post_slug !== postSlug))
      setPosts((prev) => prev.filter((p) => p.slug !== postSlug))
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <BlogHeader />
        <main className="pt-20">
          <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <BlogHeader />
        <main className="pt-20">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                お気に入り機能を使ってみませんか？
              </h1>
              <p className="text-gray-600 mb-6">
                ログインすると、お気に入りの記事を保存して後で簡単にアクセスできます。
              </p>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-auth-modal"))
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ログインする
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <BlogHeader />
      <main className="pt-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              お気に入り記事
            </h1>
            <p className="text-gray-600">
              {favorites.length > 0
                ? `${favorites.length}件の記事をお気に入りに登録しています`
                : "まだお気に入りに登録された記事がありません"}
            </p>
          </div>

          {/* Loading */}
          {loadingPosts && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}

          {/* Empty State */}
          {!loadingPosts && favorites.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                お気に入りの記事がありません
              </h2>
              <p className="text-gray-600 mb-6">
                気になる記事を見つけたら、ハートアイコンをクリックしてお気に入りに追加しましょう。
              </p>
              <Link
                href="/blog"
                className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ブログ一覧へ
              </Link>
            </div>
          )}

          {/* Posts List */}
          {!loadingPosts && posts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => {
                const imageUrl = getFeaturedImageUrl(post)
                const plainTitle = stripHtml(post.title.rendered)
                const plainExcerpt = stripHtml(post.excerpt.rendered)

                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {/* Featured Image */}
                    {imageUrl && (
                      <Link href={`/blog/${post.slug}`}>
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={plainTitle}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </Link>
                    )}

                    <div className="p-5">
                      {/* Title */}
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {plainTitle}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {plainExcerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <time className="text-xs text-gray-500">
                          {formatDate(post.date)}
                        </time>
                        <button
                          onClick={() => handleRemoveFavorite(post.slug)}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                          <span>削除</span>
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

