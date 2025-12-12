"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BlogHeader } from "@/components/blog-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  getCurrentUser, 
  getProfile, 
  updateProfile, 
  signOut,
  onAuthStateChange,
  type Profile 
} from "@/lib/auth"
import type { User } from "@supabase/supabase-js"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form state
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    // Initial load
    loadUserData()

    // Listen to auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/blog")
      } else if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
        loadUserData()
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const currentUser = await getCurrentUser()
      
      // Redirect if not logged in or email not confirmed
      if (!currentUser || !currentUser.email_confirmed_at) {
        router.push("/blog")
        return
      }

      setUser(currentUser)

      const userProfile = await getProfile(currentUser.id)
      if (userProfile) {
        setProfile(userProfile)
        setDisplayName(userProfile.display_name || "")
        setBio(userProfile.bio || "")
      } else {
        // Set defaults if profile not found yet
        setDisplayName(currentUser.email?.split("@")[0] || "")
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      router.push("/blog")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const updatedProfile = await updateProfile(user.id, {
        display_name: displayName,
        bio: bio,
      })
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        setMessage({ type: "success", text: "プロフィールを更新しました" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "更新に失敗しました" })
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/blog")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <BlogHeader />
        <main className="pt-24 pb-12 max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <BlogHeader />

      <main className="pt-24 pb-12 max-w-2xl mx-auto px-4">
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
            <li className="text-gray-900">プロフィール</li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || ""}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {profile?.display_name || user.email?.split("@")[0]}
                </h1>
                <p className="text-white/80 text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-6">
            {message && (
              <div className={`rounded-lg p-3 text-sm ${
                message.type === "success" 
                  ? "bg-green-50 text-green-800" 
                  : "bg-red-50 text-red-600"
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="bg-gray-50 text-gray-600 border-gray-200"
              />
              <p className="text-xs text-gray-500">メールアドレスは変更できません</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700">表示名</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="ニックネーム"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-gray-900 border-gray-200 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700">自己紹介</Label>
              <Textarea
                id="bio"
                placeholder="自己紹介を入力してください"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="text-gray-900 border-gray-200 placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                ログアウト
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? "保存中..." : "保存する"}
              </Button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">アカウント情報</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">アカウント作成日</dt>
              <dd className="text-gray-900">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString("ja-JP")
                  : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">最終更新日</dt>
              <dd className="text-gray-900">
                {profile?.updated_at 
                  ? new Date(profile.updated_at).toLocaleDateString("ja-JP")
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  )
}

