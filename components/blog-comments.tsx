"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { supabaseAuth } from "@/lib/supabase/client"
import { getCurrentUser, getProfile, type Profile } from "@/lib/auth"
import { getClientId } from "@/lib/blog-likes"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
import type { User, RealtimeChannel } from "@supabase/supabase-js"

interface Comment {
  id: string
  post_slug: string
  user_id: string | null
  anonymous_id: string | null
  display_name: string
  avatar_url: string | null
  content: string
  created_at: string
  updated_at: string
}

interface BlogCommentsProps {
  postSlug: string
}

export function BlogComments({ postSlug }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)

  // Load user and comments
  useEffect(() => {
    const initializeComments = async () => {
      setLoading(true)
      try {
        // Load user and comments in parallel
        await Promise.all([loadUser(), loadComments()])
      } catch (error) {
        console.error("Error initializing comments:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeComments()

    // Subscribe to realtime updates
    const channel = supabaseAuth
      .channel(`comments:${postSlug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_slug=eq.${postSlug}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setComments((prev) => [payload.new as Comment, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as Comment) : c))
            )
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabaseAuth.removeChannel(channel)
    }
  }, [postSlug])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser && currentUser.email_confirmed_at) {
        setUser(currentUser)
        const userProfile = await getProfile(currentUser.id)
        setProfile(userProfile)
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const loadComments = async () => {
    try {
      const { data, error } = await supabaseAuth
        .from("comments")
        .select("*")
        .eq("post_slug", postSlug)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error loading comments:", error)
        throw error
      }
      setComments(data || [])
    } catch (error) {
      console.error("Error loading comments:", error)
      throw error // Re-throw to be caught by initializeComments
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const clientId = getClientId()
      
      // ログイン済みの場合と匿名の場合で分岐
      const commentData = user
        ? {
            post_slug: postSlug,
            user_id: user.id,
            display_name: profile?.display_name || user.email?.split("@")[0] || "匿名ユーザー",
            avatar_url: profile?.avatar_url,
            content: newComment.trim(),
          }
        : {
            post_slug: postSlug,
            user_id: null,
            anonymous_id: clientId,
            display_name: "匿名ユーザー",
            avatar_url: null,
            content: newComment.trim(),
          }

      const { data, error } = await supabaseAuth.from("comments").insert(commentData).select()

      if (error) {
        console.error("Supabase error posting comment:", error)
        throw error
      }
      setNewComment("")
    } catch (error) {
      console.error("❌ Error posting comment:", error)
      alert(`コメントの投稿に失敗しました: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, commentId: string) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleEdit(commentId)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const { error } = await supabaseAuth
        .from("comments")
        .update({ content: editContent.trim() })
        .eq("id", commentId)

      if (error) throw error
      setEditingId(null)
      setEditContent("")
    } catch (error) {
      console.error("Error updating comment:", error)
      alert("コメントの編集に失敗しました")
    }
  }

  const handleDelete = (commentId: string) => {
    setCommentToDelete(commentId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!commentToDelete) return

    try {
      const { error } = await supabaseAuth
        .from("comments")
        .delete()
        .eq("id", commentToDelete)

      if (error) throw error
      
      setDeleteDialogOpen(false)
      setCommentToDelete(null)
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("コメントの削除に失敗しました")
    }
  }

  // Check if user can edit/delete a comment
  const canModifyComment = (comment: Comment) => {
    // ログインユーザーのみ編集・削除可能（セキュリティのため）
    if (user?.id && comment.user_id === user.id) return true
    return false
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <aside className="mt-8 bg-white rounded-xl border border-gray-100 p-6" aria-label="コメント">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900">コメント</h3>
        <span className="text-sm text-gray-500 ml-auto">
          {comments.length}件
        </span>
      </div>

      {/* Comment Form - Always shown */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium overflow-hidden flex-shrink-0">
            {user && profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || ""}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <span>
                {user ? (profile?.display_name || user.email || "?").charAt(0).toUpperCase() : "?"}
              </span>
            )}
          </div>
          <div className="flex-1">
            <Textarea
              placeholder={user ? "コメントを入力..." : "匿名でコメントを入力..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="text-gray-900 border-gray-200 placeholder:text-gray-400 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                {!user && (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    ログインして名前を表示
                  </button>
                )}
                <span className="text-xs text-gray-400">
                  Ctrl + Enter で送信
                </span>
              </div>
              <Button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="bg-blue-600 hover:bg-blue-700 ml-auto"
              >
                {submitting ? "送信中..." : "コメントする"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">まだコメントはありません</p>
          <p className="text-xs mt-1">最初のコメントを投稿しましょう</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-medium overflow-hidden flex-shrink-0">
                {comment.avatar_url ? (
                  <Image
                    src={comment.avatar_url}
                    alt={comment.display_name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  comment.display_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">
                    {comment.display_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.created_at)}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-gray-400">(編集済み)</span>
                  )}
                </div>
                
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, comment.id)}
                      rows={2}
                      className="text-gray-900 border-gray-200 text-sm"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">Ctrl + Enter で保存</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(comment.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          保存
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null)
                            setEditContent("")
                          }}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                )}

                {/* Edit/Delete buttons for own comments */}
                {canModifyComment(comment) && editingId !== comment.id && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingId(comment.id)
                        setEditContent(comment.content)
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={loadUser}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">コメントを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              この操作は取り消すことができません。コメントは完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  )
}

