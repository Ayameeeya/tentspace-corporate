"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { TentBlogNav } from "@/components/home/TentBlogNav"
import {
  getCurrentUser,
  getProfile,
  type Profile
} from "@/lib/auth"
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard"
import type { User } from "@supabase/supabase-js"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    favoritesCount: 0,
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const currentUser = await getCurrentUser()

      if (!currentUser || !currentUser.email_confirmed_at) {
        router.push("/blog")
        return
      }

      setUser(currentUser)

      const [userProfile, userStats] = await Promise.all([
        getProfile(currentUser.id),
        getDashboardStats(currentUser.id)
      ])

      if (userProfile) setProfile(userProfile)
      setStats(userStats)
    } catch (error) {
      console.error("Error loading user data:", error)
      router.push("/blog")
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TentBlogNav />
        <main id="main-content" className="pt-[calc(var(--blog-nav-h,128px)+1.5rem)] pb-12">
          <div className="animate-pulse space-y-4 max-w-6xl mx-auto px-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = profile?.display_name || user.email?.split("@")[0] || ""
  const avatarUrl = profile?.avatar_url

  return (
    <div className="min-h-screen bg-background">
      <TentBlogNav />

      <main id="main-content" className="pt-[calc(var(--blog-nav-h,128px)+1.5rem)] pb-12 max-w-3xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="パンくずリスト">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                ホーム
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href="/blog" className="hover:text-foreground transition-colors">
                ブログ
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-foreground">マイページ</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{displayName}</h1>
              <p className="text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Link href="/settings/account">
            <button className="px-4 py-2 text-sm text-foreground border border-border rounded-md hover:bg-muted transition-colors">
              アカウント設定
            </button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Favorites */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm text-foreground/80">お気に入りの記事</span>
              </div>
              <Link href="/blog/favorites" className="text-sm font-medium text-blue-500 hover:underline">
                {stats.favoritesCount}件
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">クイックリンク</h2>
            <div className="space-y-2">
              <Link href="/blog" className="block px-3 py-2 text-sm text-foreground/80 hover:bg-muted rounded-md transition-colors">
                ブログ記事を見る
              </Link>
              <Link href="/blog/favorites" className="block px-3 py-2 text-sm text-foreground/80 hover:bg-muted rounded-md transition-colors">
                お気に入り
              </Link>
              <Link href="/settings/account" className="block px-3 py-2 text-sm text-foreground/80 hover:bg-muted rounded-md transition-colors">
                アカウント設定
              </Link>
              <Link href="/settings/security" className="block px-3 py-2 text-sm text-foreground/80 hover:bg-muted rounded-md transition-colors">
                セキュリティ設定
              </Link>
              <Link href="/settings/privacy" className="block px-3 py-2 text-sm text-foreground/80 hover:bg-muted rounded-md transition-colors">
                プライバシー設定
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
