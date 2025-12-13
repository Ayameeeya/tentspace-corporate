"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"
import { 
  getCurrentUser, 
  getProfile,
  type Profile 
} from "@/lib/auth"
import type { User } from "@supabase/supabase-js"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

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

      const userProfile = await getProfile(currentUser.id)
      if (userProfile) {
        setProfile(userProfile)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      router.push("/blog")
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <BlogHeader />
        <main className="pt-24 pb-12">
          <div className="animate-pulse space-y-4 max-w-6xl mx-auto px-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
    <div className="min-h-screen bg-[#fafafa]">
      <BlogHeader />

      <main className="pt-24 pb-12 max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="パンくずリスト">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-900 transition-colors">
                ホーム
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href="/blog" className="hover:text-gray-900 transition-colors">
                ブログ
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-900">ダッシュボード</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <Link href="/settings/account">
            <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              アカウント設定
            </button>
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">最近のアクティビティ</h2>
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">アクティビティはまだありません</p>
                <p className="text-sm text-gray-400 mt-1">記事を投稿したり、いいねをすると表示されます</p>
              </div>
            </div>

            {/* Followers' Posts */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">フォロワーの新着記事</h2>
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-500">新着記事はありません</p>
                <p className="text-sm text-gray-400 mt-1">フォローしているユーザーの記事が表示されます</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">通知</h2>
                <span className="text-xs text-gray-500">0件</span>
              </div>
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm text-gray-500">通知はありません</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">統計</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">お気に入り</span>
                  </div>
                  <Link href="/blog/favorites" className="text-sm font-medium text-blue-600 hover:underline">
                    0件
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">フォロワー</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="text-sm text-gray-700">フォロー中</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">クイックリンク</h2>
              <div className="space-y-2">
                <Link href="/blog" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  ブログ記事を見る
                </Link>
                <Link href="/blog/favorites" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  お気に入り
                </Link>
                <Link href="/settings/account" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  アカウント設定
                </Link>
                <Link href="/settings/privacy" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  プライバシー設定
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
