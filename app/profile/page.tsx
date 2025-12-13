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
import {
  getRecentActivities,
  getNotifications,
  getUnreadNotificationCount,
  getDashboardStats,
  markAllNotificationsAsRead,
  formatActivityMessage,
  type Activity,
  type Notification,
  type DashboardStats
} from "@/lib/dashboard"
import type { User } from "@supabase/supabase-js"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState<DashboardStats>({
    favoritesCount: 0,
    followersCount: 0,
    followingCount: 0,
    likesReceived: 0,
    commentsReceived: 0
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

      const [userProfile, userActivities, userNotifications, notificationCount, userStats] = await Promise.all([
        getProfile(currentUser.id),
        getRecentActivities(currentUser.id, 10),
        getNotifications(currentUser.id, 5),
        getUnreadNotificationCount(currentUser.id),
        getDashboardStats(currentUser.id)
      ])

      if (userProfile) setProfile(userProfile)
      setActivities(userActivities)
      setNotifications(userNotifications)
      setUnreadCount(notificationCount)
      setStats(userStats)
    } catch (error) {
      console.error("Error loading user data:", error)
      router.push("/blog")
    }
    setLoading(false)
  }

  const handleMarkAllRead = async () => {
    if (!user) return
    const success = await markAllNotificationsAsRead(user.id)
    if (success) {
      setUnreadCount(0)
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return date.toLocaleDateString('ja-JP')
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
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'like' ? 'bg-red-100 text-red-600' :
                        activity.type === 'comment' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'favorite' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {activity.type === 'like' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        )}
                        {activity.type === 'comment' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        )}
                        {activity.type === 'favorite' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        )}
                        {activity.type === 'follow' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{formatActivityMessage(activity)}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500">アクティビティはまだありません</p>
                  <p className="text-sm text-gray-400 mt-1">記事にいいねをしたり、お気に入りに追加すると表示されます</p>
                </div>
              )}
            </div>

            {/* Followers' Posts */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">フォロー中のユーザーの新着記事</h2>
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-500">新着記事はありません</p>
                <p className="text-sm text-gray-400 mt-1">他のユーザーをフォローすると、新着記事が表示されます</p>
                <Link href="/blog" className="inline-block mt-4 text-sm text-blue-600 hover:underline">
                  ブログを見る →
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">通知</h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <>
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                        {unreadCount}件
                      </span>
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        すべて既読
                      </button>
                    </>
                  )}
                </div>
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.link || '#'}
                      className={`block p-3 rounded-lg transition-colors ${
                        notification.is_read ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      <p className={`text-sm ${notification.is_read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                    </Link>
                  ))}
                  <Link href="/settings/notifications" className="block text-center text-sm text-blue-600 hover:underline pt-2">
                    すべての通知を見る
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm text-gray-500">通知はありません</p>
                </div>
              )}
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
                    {stats.favoritesCount}件
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">フォロワー</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.followersCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="text-sm text-gray-700">フォロー中</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.followingCount}</span>
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
                <Link href="/settings/security" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  セキュリティ設定
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
