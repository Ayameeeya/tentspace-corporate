"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getCurrentUser } from "@/lib/auth"
import { getUserSettings, updateUserSettings, getNotifications, markAllNotificationsAsRead, type UserSettings, type Notification } from "@/lib/dashboard"

export default function NotificationsSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const currentUser = await getCurrentUser()
      
      if (!currentUser || !currentUser.email_confirmed_at) {
        router.push("/blog")
        return
      }

      setUserId(currentUser.id)
      
      const [userSettings, userNotifications] = await Promise.all([
        getUserSettings(currentUser.id),
        getNotifications(currentUser.id, 20)
      ])
      
      setSettings(userSettings)
      setNotifications(userNotifications)
    } catch (error) {
      console.error("Error loading settings:", error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!userId || !settings) return

    setSaving(true)
    setMessage(null)

    try {
      const updated = await updateUserSettings(userId, {
        email_notifications: settings.email_notifications,
        email_new_follower: settings.email_new_follower,
        email_new_comment: settings.email_new_comment,
        email_new_like: settings.email_new_like,
        email_newsletter: settings.email_newsletter,
        push_notifications: settings.push_notifications,
      })

      if (updated) {
        setMessage({ type: "success", text: "通知設定を保存しました" })
        setSettings(updated)
      } else {
        setMessage({ type: "error", text: "設定の保存に失敗しました" })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage({ type: "error", text: "設定の保存に失敗しました" })
    }

    setSaving(false)
  }

  const handleSendTestEmail = async () => {
    setSendingTest(true)
    setMessage(null)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message })
      } else {
        setMessage({ type: "error", text: data.message || "テストメールの送信に失敗しました" })
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      setMessage({ type: "error", text: "テストメールの送信に失敗しました" })
    }

    setSendingTest(false)
  }

  const handleMarkAllRead = async () => {
    if (!userId) return
    const success = await markAllNotificationsAsRead(userId)
    if (success) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setMessage({ type: "success", text: "すべての通知を既読にしました" })
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
      <div className="max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">通知設定</h1>

      <div className="space-y-6">
        {message && (
          <div className={`rounded-lg p-3 text-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-800" 
              : "bg-red-50 text-red-600"
          }`}>
            {message.text}
          </div>
        )}

        {/* Email Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">メール通知</h2>
          <p className="text-sm text-gray-600 mb-6">
            重要な通知をメールで受け取るかどうかを設定します。
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base">メール通知を有効にする</Label>
                <p className="text-sm text-gray-500">
                  すべてのメール通知のマスタースイッチです
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings?.email_notifications || false}
                onCheckedChange={(checked) => {
                  if (settings) {
                    setSettings({ ...settings, email_notifications: checked })
                  }
                }}
              />
            </div>

            {settings?.email_notifications && (
              <>
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-new-follower" className="text-base">新しいフォロワー</Label>
                      <p className="text-sm text-gray-500">
                        誰かがあなたをフォローしたときに通知
                      </p>
                    </div>
                    <Switch
                      id="email-new-follower"
                      checked={settings?.email_new_follower || false}
                      onCheckedChange={(checked) => {
                        if (settings) {
                          setSettings({ ...settings, email_new_follower: checked })
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-new-comment" className="text-base">新しいコメント</Label>
                      <p className="text-sm text-gray-500">
                        あなたの記事にコメントがついたときに通知
                      </p>
                    </div>
                    <Switch
                      id="email-new-comment"
                      checked={settings?.email_new_comment || false}
                      onCheckedChange={(checked) => {
                        if (settings) {
                          setSettings({ ...settings, email_new_comment: checked })
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-new-like" className="text-base">新しいいいね</Label>
                      <p className="text-sm text-gray-500">
                        あなたの記事にいいねがついたときに通知
                      </p>
                    </div>
                    <Switch
                      id="email-new-like"
                      checked={settings?.email_new_like || false}
                      onCheckedChange={(checked) => {
                        if (settings) {
                          setSettings({ ...settings, email_new_like: checked })
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-newsletter" className="text-base">ニュースレター</Label>
                      <p className="text-sm text-gray-500">
                        Tentspaceからのお知らせやアップデート情報
                      </p>
                    </div>
                    <Switch
                      id="email-newsletter"
                      checked={settings?.email_newsletter || false}
                      onCheckedChange={(checked) => {
                        if (settings) {
                          setSettings({ ...settings, email_newsletter: checked })
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-900">テストメールを送信</p>
                      <p className="text-xs text-blue-600 mt-1">メール通知が正しく設定されているか確認します</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendTestEmail}
                      disabled={sendingTest}
                      className="border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      {sendingTest ? "送信中..." : "テスト送信"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">プッシュ通知</h2>
          <p className="text-sm text-gray-600 mb-6">
            ブラウザのプッシュ通知を受け取るかどうかを設定します。
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-base">プッシュ通知を有効にする</Label>
              <p className="text-sm text-gray-500">
                ブラウザで通知を受け取ります（準備中）
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings?.push_notifications || false}
              onCheckedChange={(checked) => {
                if (settings) {
                  setSettings({ ...settings, push_notifications: checked })
                }
              }}
              disabled
            />
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">最近の通知</h2>
            {notifications.length > 0 && notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-blue-600 hover:underline"
              >
                すべて既読にする
              </button>
            )}
          </div>
          
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg transition-colors ${
                    notification.is_read ? 'hover:bg-gray-50' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      notification.is_read ? 'bg-gray-300' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.is_read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm text-gray-500">通知はありません</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? "保存中..." : "設定を保存"}
          </Button>
        </div>
      </div>
    </div>
  )
}
