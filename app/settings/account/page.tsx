"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  getCurrentUser, 
  getProfile, 
  updateProfile, 
  uploadAvatar,
  deleteAvatar,
  signOut,
  type Profile 
} from "@/lib/auth"
import type { User } from "@supabase/supabase-js"

export default function AccountSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form state
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
      setDisplayName(currentUser.email?.split("@")[0] || "")
      setLoading(false)

      getProfile(currentUser.id)
        .then(userProfile => {
          if (userProfile) {
            setProfile(userProfile)
            setDisplayName(userProfile.display_name || currentUser.email?.split("@")[0] || "")
            setBio(userProfile.bio || "")
            setAvatarUrl(userProfile.avatar_url)
            setAvatarPreview(userProfile.avatar_url)
          }
        })
        .catch(error => console.error("Error loading profile:", error))
    } catch (error) {
      console.error("Error loading user data:", error)
      router.push("/blog")
      setLoading(false)
    }
  }

  const processAvatarFile = async (file: File) => {
    if (!user) return

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "画像ファイルを選択してください" })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "ファイルサイズは2MB以下にしてください" })
      return
    }

    setUploadingAvatar(true)
    setMessage(null)

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      if (avatarUrl) {
        await deleteAvatar(avatarUrl)
      }

      const newAvatarUrl = await uploadAvatar(user.id, file)
      
      if (newAvatarUrl) {
        const updatedProfile = await updateProfile(user.id, {
          avatar_url: newAvatarUrl,
        })
        
        if (updatedProfile) {
          setProfile(updatedProfile)
          setAvatarUrl(newAvatarUrl)
          setMessage({ type: "success", text: "アバターを更新しました" })
        }
      } else {
        throw new Error("アバターのアップロードに失敗しました")
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      setMessage({ type: "error", text: "アバターの更新に失敗しました" })
      setAvatarPreview(avatarUrl)
    }

    setUploadingAvatar(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processAvatarFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processAvatarFile(file)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user || !avatarUrl) return

    setUploadingAvatar(true)
    setMessage(null)

    try {
      await deleteAvatar(avatarUrl)

      const updatedProfile = await updateProfile(user.id, {
        avatar_url: null,
      })
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        setAvatarUrl(null)
        setAvatarPreview(null)
        setMessage({ type: "success", text: "アバターを削除しました" })
      }
    } catch (error) {
      console.error("Error removing avatar:", error)
      setMessage({ type: "error", text: "アバターの削除に失敗しました" })
    }

    setUploadingAvatar(false)
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
    window.location.href = "/blog"
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

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">アカウント</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {message && (
          <div className={`rounded-lg p-3 text-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-800" 
              : "bg-red-50 text-red-600"
          }`}>
            {message.text}
          </div>
        )}

        {/* Avatar Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">アバター画像</h2>
          <div 
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragging 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 bg-gray-50"
            } ${uploadingAvatar ? "opacity-50 pointer-events-none" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden relative">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt={displayName || ""}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium">
                  {isDragging ? "ここにドロップ" : "画像をドラッグ＆ドロップ"}
                </p>
                <p className="text-xs text-gray-500 mt-1">または</p>
              </div>

              <div className="flex gap-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">
                    {avatarUrl ? "画像を変更" : "画像を選択"}
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    削除
                  </Button>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            JPG、PNG、GIF形式の画像（最大2MB）
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">プロフィール情報</h2>
          
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saving}
            >
              {saving ? "保存中..." : "保存する"}
            </Button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">アカウント情報</h2>
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
      </form>
    </div>
  )
}

