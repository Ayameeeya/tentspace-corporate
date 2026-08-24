"use client"

import { useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase/client"
import { Bookmark } from "lucide-react"
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
      // 保存件数は表示しない（いいねと役割を分けるため）。自分が保存済みかだけ見る
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
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="tent-action-btn" style={{ opacity: 0.4 }} aria-hidden="true">
        <Bookmark className="w-4 h-4" />
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleToggleFavorite}
        className="tent-action-btn"
        data-active={isFavorited}
        title={isFavorited ? "保存済み" : "保存"}
        aria-label={isFavorited ? "お気に入りから削除" : "お気に入りに追加"}
      >
        <Bookmark className={`w-4 h-4 transition-all ${isFavorited ? "fill-current" : ""}`} aria-hidden="true" />
      </button>

      {/* Auth Dialog for non-logged-in users */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        {/* ポータルで .tent-page の外に出るため、tent の色は直値で指定する */}
        <AlertDialogContent className="gap-6 rounded-none border border-black bg-white p-7 shadow-none">
          <AlertDialogHeader className="gap-3">
            <span className="text-[11px] tracking-widest text-black/45">save</span>
            <AlertDialogTitle className="jp-heading text-lg leading-normal text-black">
              保存にはログインが必要です
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-[1.9] text-black/60">
              ログインすると、気になる記事を保存して、あとから読み返せます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="cursor-crosshair rounded-none border border-black bg-white text-black shadow-none hover:bg-black hover:text-white">
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowAuthDialog(false)
                // Trigger auth modal
                window.dispatchEvent(new CustomEvent("open-auth-modal"))
              }}
              className="cursor-crosshair rounded-none border border-black bg-black font-semibold text-white shadow-none hover:bg-[#0f00b0] hover:border-[#0f00b0]"
            >
              ログインする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

