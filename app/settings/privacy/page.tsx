"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"
import { getUserSettings, updateUserSettings, type UserSettings } from "@/lib/dashboard"

export default function PrivacySettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
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
      const userSettings = await getUserSettings(currentUser.id)
      setSettings(userSettings)
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
        profile_visibility: settings.profile_visibility,
        show_email: settings.show_email,
        show_activity: settings.show_activity,
      })

      if (updated) {
        setMessage({ type: "success", text: "プライバシー設定を保存しました" })
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

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">プライバシー設定</h1>

      <div className="space-y-6">
        {message && (
          <div className={`rounded-lg p-3 text-sm ${
            message.type === "success" 
              ? "bg-green-500/10 text-green-500" 
              : "bg-red-500/10 text-red-500"
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Visibility */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">プロフィールの公開範囲</h2>
          <p className="text-sm text-muted-foreground mb-4">
            あなたのプロフィール情報を誰が閲覧できるかを設定します。
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility">公開範囲</Label>
              <Select
                value={settings?.profile_visibility || 'public'}
                onValueChange={(value: 'public' | 'followers' | 'private') => {
                  if (settings) {
                    setSettings({ ...settings, profile_visibility: value })
                  }
                }}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="公開範囲を選択" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      全員に公開
                    </div>
                  </SelectItem>
                  <SelectItem value="followers">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      フォロワーのみ
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      自分のみ
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {settings?.profile_visibility === 'public' && '誰でもあなたのプロフィールを閲覧できます'}
                {settings?.profile_visibility === 'followers' && 'フォロワーのみがあなたのプロフィールを閲覧できます'}
                {settings?.profile_visibility === 'private' && '自分だけがプロフィールを閲覧できます'}
              </p>
            </div>
          </div>
        </div>

        {/* Activity Visibility */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">アクティビティの公開</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-activity" className="text-base">アクティビティを公開</Label>
                <p className="text-sm text-muted-foreground">
                  いいね、コメント、お気に入りなどのアクティビティを他のユーザーに表示します
                </p>
              </div>
              <Switch
                id="show-activity"
                checked={settings?.show_activity || false}
                onCheckedChange={(checked) => {
                  if (settings) {
                    setSettings({ ...settings, show_activity: checked })
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-email" className="text-base">メールアドレスを公開</Label>
                <p className="text-sm text-muted-foreground">
                  プロフィールページでメールアドレスを表示します
                </p>
              </div>
              <Switch
                id="show-email"
                checked={settings?.show_email || false}
                onCheckedChange={(checked) => {
                  if (settings) {
                    setSettings({ ...settings, show_email: checked })
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">データとプライバシー</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">データのダウンロード</p>
                <p className="text-xs text-muted-foreground mt-1">あなたのすべてのデータをダウンロードします</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                準備中
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-500">アカウントの削除</p>
                <p className="text-xs text-red-500/80 mt-1">アカウントとすべてのデータを完全に削除します</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                onClick={() => router.push('/settings/account')}
              >
                アカウント設定へ
              </Button>
            </div>
          </div>
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
