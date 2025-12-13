"use client"

import { useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase/client"
import { Heart } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BlogFavoriteProps {
  postSlug: string
}

interface Favorite {
  id: string
  post_slug: string
  user_id: string
  created_at: string
}

export function BlogFavorite({ postSlug }: BlogFavoriteProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (!loading) {
      loadFavorites()
    }
  }, [postSlug, user, loading])

  useEffect(() => {
    if (loading) return

    // Subscribe to realtime updates
    const channel = supabaseAuth
      .channel(`favorites:${postSlug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "favorites",
          filter: `post_slug=eq.${postSlug}`,
        },
        () => {
          loadFavorites()
        }
      )
      .subscribe()

    return () => {
      supabaseAuth.removeChannel(channel)
    }
  }, [postSlug, loading])

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const loadFavorites = async () => {
    try {
      // Get total count
      const { count } = await supabaseAuth
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("post_slug", postSlug)

      setFavoriteCount(count || 0)

      // Check if current user favorited
      if (user) {
        const { data } = await supabaseAuth
          .from("favorites")
          .select("id")
          .eq("post_slug", postSlug)
          .eq("user_id", user.id)
          .maybeSingle()

        setIsFavorited(!!data)
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    try {
      if (isFavorited) {
        // Remove favorite
        await supabaseAuth
          .from("favorites")
          .delete()
          .eq("post_slug", postSlug)
          .eq("user_id", user.id)
      } else {
        // Add favorite
        await supabaseAuth.from("favorites").insert({
          post_slug: postSlug,
          user_id: user.id,
        })
      }

      // Optimistic update
      setIsFavorited(!isFavorited)
      setFavoriteCount((prev) => (isFavorited ? prev - 1 : prev + 1))
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-400">
        <Heart className="w-4 h-4" />
        <span className="text-sm font-medium">お気に入りに登録しませんか？</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleToggleFavorite}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
          isFavorited
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : user
            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        aria-label={isFavorited ? "お気に入りから削除" : "お気に入りに追加"}
      >
        <Heart
          className={`w-4 h-4 transition-all ${isFavorited ? "fill-current" : ""}`}
        />
        <span className="text-sm font-medium">
          {user
            ? isFavorited
              ? `お気に入り登録済み (${favoriteCount})`
              : "お気に入りに登録する"
            : "お気に入りに登録しませんか？"}
        </span>
      </button>

      {/* Auth Dialog for non-logged-in users */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>お気に入り機能を試しませんか？</AlertDialogTitle>
            <AlertDialogDescription>
              お気に入り機能を使うには、ログインが必要です。
              ログインすると、お気に入りの記事を保存して後で簡単にアクセスできます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowAuthDialog(false)
                // Trigger auth modal
                window.dispatchEvent(new CustomEvent("open-auth-modal"))
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              ログインする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

