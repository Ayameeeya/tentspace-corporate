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

interface Reaction {
  id: string
  comment_id: string
  user_id: string | null
  anonymous_id: string | null
  emoji: string
  created_at: string
}

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
  parent_id: string | null
  replies?: Comment[]
  reactions?: Reaction[]
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [showTextEmojiPicker, setShowTextEmojiPicker] = useState<string | null>(null)
  const COMMENTS_PER_PAGE = 10
  const COMMON_EMOJIS = ["👍", "❤️", "😄", "🎉", "🤔", "👏"]
  const TEXT_EMOJIS = ["😊", "😂", "🥰", "😎", "🤔", "👍", "❤️", "🎉", "🔥", "✨", "💯", "👏"]

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      if (showEmojiPicker && !target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(null)
      }
      
      if (showTextEmojiPicker && !target.closest('.text-emoji-picker-container')) {
        setShowTextEmojiPicker(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker, showTextEmojiPicker])

  // Load user and comments
  useEffect(() => {
    const initializeComments = async () => {
      setLoading(true)
      setPage(0) // Reset page
      try {
        // Load user and comments in parallel
        await Promise.all([loadUser(), loadComments(0, true)])
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
        async (payload) => {
          // Reload currently visible pages
          const currentPage = page
          const offset = 0
          const limit = (currentPage + 1) * COMMENTS_PER_PAGE
          const endIndex = limit // Fetch +1 to check for more
          
          try {
            // Fetch all top-level comments we need (+1 to check if more exist)
            const { data: topLevelComments, error: topError } = await supabaseAuth
              .from("comments")
              .select("*")
              .eq("post_slug", postSlug)
              .is("parent_id", null)
              .order("created_at", { ascending: false })
              .range(offset, endIndex)

            if (topError) throw topError

            if (!topLevelComments || topLevelComments.length === 0) {
              setComments([])
              setHasMore(false)
              return
            }

            // Check if there are more
            const hasMoreAfterReload = topLevelComments.length > limit
            setHasMore(hasMoreAfterReload)
            const commentsToShow = topLevelComments.slice(0, limit)
            const topLevelIds = commentsToShow.map(c => c.id)

            // Fetch all replies
            const { data: replies } = await supabaseAuth
              .from("comments")
              .select("*")
              .eq("post_slug", postSlug)
              .in("parent_id", topLevelIds)

            let allReplies = replies || []
            if (replies && replies.length > 0) {
              const fetchNestedReplies = async (parentIds: string[]): Promise<Comment[]> => {
                const { data: nested } = await supabaseAuth
                  .from("comments")
                  .select("*")
                  .eq("post_slug", postSlug)
                  .in("parent_id", parentIds)
                
                if (nested && nested.length > 0) {
                  const nestedIds = nested.map(c => c.id)
                  const deeperReplies = await fetchNestedReplies(nestedIds)
                  return [...nested, ...deeperReplies]
                }
                return []
              }
              
              const nestedReplies = await fetchNestedReplies(replies.map(r => r.id))
              allReplies = [...replies, ...nestedReplies]
            }

            const tree = buildCommentTree([...commentsToShow, ...allReplies])
            const filteredTree = tree.filter(c => topLevelIds.includes(c.id))
            setComments(filteredTree)
            
            // Reload reactions for visible comments and their replies
            const getAllCommentIds = (comments: Comment[]): string[] => {
              return comments.flatMap(c => {
                const ids = [c.id]
                if (c.replies && c.replies.length > 0) {
                  ids.push(...getAllCommentIds(c.replies))
                }
                return ids
              })
            }
            
            setReactions({})
            const allIds = getAllCommentIds(filteredTree)
            await loadReactions(allIds)
          } catch (error) {
            console.error("Error reloading comments:", error)
          }
        }
      )
      .subscribe()

    // Subscribe to reactions changes
    const reactionsChannel = supabaseAuth
      .channel(`reactions:${postSlug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comment_reactions",
        },
        async (payload) => {
          // Just reload the specific comment's reactions
          const reaction = payload.new as any
          const oldReaction = payload.old as any
          const commentId = reaction?.comment_id || oldReaction?.comment_id
          
          if (commentId) {
            await loadReactions([commentId])
          }
        }
      )
      .subscribe()

    return () => {
      supabaseAuth.removeChannel(channel)
      supabaseAuth.removeChannel(reactionsChannel)
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

  const loadReactions = async (commentIds: string[]) => {
    if (commentIds.length === 0) return

    try {
      const { data, error } = await supabaseAuth
        .from("comment_reactions")
        .select("*")
        .in("comment_id", commentIds)

      if (error) throw error

      const reactionsMap: Record<string, Reaction[]> = {}
      data?.forEach((reaction) => {
        if (!reactionsMap[reaction.comment_id]) {
          reactionsMap[reaction.comment_id] = []
        }
        reactionsMap[reaction.comment_id].push(reaction as Reaction)
      })

      // Merge with existing reactions (keep reactions for other comments)
      setReactions(prev => ({
        ...prev,
        ...reactionsMap
      }))
    } catch (error) {
      console.error("Error loading reactions:", error)
    }
  }

  // Build comment tree structure
  const buildCommentTree = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>()
    const rootComments: Comment[] = []

    // First pass: create map and initialize replies array
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Second pass: build tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies!.push(commentWithReplies)
        } else {
          // Parent not found, treat as root comment
          rootComments.push(commentWithReplies)
        }
      } else {
        rootComments.push(commentWithReplies)
      }
    })

    // Sort root comments by created_at (newest first)
    rootComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    // Sort replies for each comment (oldest first for better readability)
    const sortReplies = (comment: Comment) => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        comment.replies.forEach(sortReplies)
      }
    }
    rootComments.forEach(sortReplies)

    return rootComments
  }

  const loadComments = async (pageNum: number = 0, resetComments: boolean = false) => {
    try {
      const offset = pageNum * COMMENTS_PER_PAGE
      
      // Fetch top-level comments with pagination (fetch +1 to check if there are more)
      const { data: topLevelComments, error: topError } = await supabaseAuth
        .from("comments")
        .select("*")
        .eq("post_slug", postSlug)
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + COMMENTS_PER_PAGE) // Fetch +1

      if (topError) {
        console.error("Supabase error loading comments:", topError)
        throw topError
      }

      if (!topLevelComments || topLevelComments.length === 0) {
        if (pageNum === 0) {
          setComments([])
          setReactions({})
        }
        // Only update hasMore on page 0 or when explicitly requested
        if (pageNum === 0 || resetComments) {
          setHasMore(false)
        }
        return
      }

      // Check if there are more comments (we fetched +1)
      const hasMoreComments = topLevelComments.length > COMMENTS_PER_PAGE
      const commentsToShow = hasMoreComments ? topLevelComments.slice(0, COMMENTS_PER_PAGE) : topLevelComments
      
      // Update hasMore state
      setHasMore(hasMoreComments)

      // Get IDs of top-level comments for this page
      const topLevelIds = commentsToShow.map(c => c.id)

      // Fetch replies only for these top-level comments
      const { data: replies, error: repliesError } = await supabaseAuth
        .from("comments")
        .select("*")
        .eq("post_slug", postSlug)
        .in("parent_id", topLevelIds)

      if (repliesError) {
        console.error("Supabase error loading replies:", repliesError)
        throw repliesError
      }

      // Recursively fetch nested replies
      let allReplies = replies || []
      if (replies && replies.length > 0) {
        const fetchNestedReplies = async (parentIds: string[]): Promise<Comment[]> => {
          const { data: nested } = await supabaseAuth
            .from("comments")
            .select("*")
            .eq("post_slug", postSlug)
            .in("parent_id", parentIds)
          
          if (nested && nested.length > 0) {
            const nestedIds = nested.map(c => c.id)
            const deeperReplies = await fetchNestedReplies(nestedIds)
            return [...nested, ...deeperReplies]
          }
          return []
        }
        
        const nestedReplies = await fetchNestedReplies(replies.map(r => r.id))
        allReplies = [...replies, ...nestedReplies]
      }
      
      // Build tree structure
      const allCommentsForTree = [...commentsToShow, ...allReplies]
      const tree = buildCommentTree(allCommentsForTree)
      
      // Filter tree to only include the top-level comments we fetched
      const filteredTree = tree.filter(c => topLevelIds.includes(c.id))
      
      if (pageNum === 0 || resetComments) {
        setComments(filteredTree)
        if (resetComments) {
          // Reset reactions when explicitly resetting
          setReactions({})
        }
      } else {
        // Append new comments to existing ones
        setComments(prev => [...prev, ...filteredTree])
      }

      // Load reactions for these comments and their replies
      const getAllCommentIds = (comments: Comment[]): string[] => {
        return comments.flatMap(c => {
          const ids = [c.id]
          if (c.replies && c.replies.length > 0) {
            ids.push(...getAllCommentIds(c.replies))
          }
          return ids
        })
      }
      
      const allIds = getAllCommentIds(filteredTree)
      await loadReactions(allIds)
    } catch (error) {
      console.error("Error loading comments:", error)
      throw error
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, parentId: string) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleReplySubmit(parentId)
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

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      const clientId = getClientId()
      
      // ログイン済みの場合と匿名の場合で分岐
      const commentData = user
        ? {
            post_slug: postSlug,
            parent_id: parentId,
            user_id: user.id,
            display_name: profile?.display_name || user.email?.split("@")[0] || "匿名ユーザー",
            avatar_url: profile?.avatar_url,
            content: replyContent.trim(),
          }
        : {
            post_slug: postSlug,
            parent_id: parentId,
            user_id: null,
            anonymous_id: clientId,
            display_name: "匿名ユーザー",
            avatar_url: null,
            content: replyContent.trim(),
          }

      const { data, error } = await supabaseAuth.from("comments").insert(commentData).select()

      if (error) {
        console.error("Supabase error posting reply:", error)
        throw error
      }
      
      setReplyContent("")
      setReplyingTo(null)
    } catch (error) {
      console.error("❌ Error posting reply:", error)
      alert(`返信の投稿に失敗しました: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
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

  const toggleReaction = async (commentId: string, emoji: string) => {
    const clientId = getClientId()
    const commentReactions = reactions[commentId] || []
    
    // Check if user already reacted with this emoji
    const existingReaction = commentReactions.find(r =>
      user ? r.user_id === user.id && r.emoji === emoji : r.anonymous_id === clientId && r.emoji === emoji
    )

    try {
      if (existingReaction) {
        // Remove reaction
        const { error } = await supabaseAuth
          .from("comment_reactions")
          .delete()
          .eq("id", existingReaction.id)

        if (error) throw error
      } else {
        // Add reaction
        const reactionData = user
          ? { comment_id: commentId, user_id: user.id, emoji }
          : { comment_id: commentId, anonymous_id: clientId, emoji }

        const { error } = await supabaseAuth
          .from("comment_reactions")
          .insert(reactionData)

        if (error) throw error
      }
      
      setShowEmojiPicker(null)
    } catch (error) {
      console.error("Error toggling reaction:", error)
    }
  }

  const getReactionCounts = (commentId: string) => {
    const commentReactions = reactions[commentId] || []
    const counts: Record<string, { count: number; hasReacted: boolean }> = {}
    const clientId = getClientId()

    commentReactions.forEach(reaction => {
      if (!counts[reaction.emoji]) {
        counts[reaction.emoji] = { count: 0, hasReacted: false }
      }
      counts[reaction.emoji].count++

      if (user && reaction.user_id === user.id) {
        counts[reaction.emoji].hasReacted = true
      } else if (!user && reaction.anonymous_id === clientId) {
        counts[reaction.emoji].hasReacted = true
      }
    })

    return counts
  }

  const insertEmoji = (emoji: string, target: 'new' | 'reply' | string) => {
    if (target === 'new') {
      setNewComment(prev => prev + emoji)
    } else if (target === 'reply') {
      setReplyContent(prev => prev + emoji)
    } else {
      // Edit mode
      setEditContent(prev => prev + emoji)
    }
    setShowTextEmojiPicker(null)
  }

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return "たった今"
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分前`
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else if (diffDays < 7) {
      return `${diffDays}日前`
    } else {
      return past.toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      })
    }
  }

  // Count total comments including nested replies
  const countTotalComments = (comments: Comment[]): number => {
    let count = comments.length
    comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        count += countTotalComments(comment.replies)
      }
    })
    return count
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      await loadComments(nextPage)
      setPage(nextPage)
    } catch (error) {
      console.error("Error loading more comments:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Recursive comment rendering function for threaded comments
  const renderComment = (comment: Comment, depth: number = 0) => {
    const isEditing = editingId === comment.id
    const isReplying = replyingTo === comment.id
    const maxDepth = 5 // Maximum nesting level

    return (
      <div key={comment.id} className={`group ${depth > 0 ? "ml-6 mt-1.5" : ""}`}>
        <div className="flex gap-2.5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden flex-shrink-0">
            {comment.avatar_url ? (
              <Image
                src={comment.avatar_url}
                alt={comment.display_name}
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <span>{comment.display_name.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-medium text-gray-900 text-sm">
                {comment.display_name}
              </span>
              <span className="text-xs text-gray-400">
                {getRelativeTime(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-gray-400">(編集済み)</span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-1.5">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, comment.id)}
                  rows={2}
                  className="text-gray-900 border-gray-200 text-sm"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Emoji picker for edit */}
                    <div className="relative text-emoji-picker-container">
                      <button
                        type="button"
                        onClick={() => setShowTextEmojiPicker(showTextEmojiPicker === comment.id ? null : comment.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="絵文字を追加"
                      >
                        <span className="text-base">😊</span>
                      </button>
                      
                      {showTextEmojiPicker === comment.id && (
                        <div className="absolute left-0 bottom-full mb-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-6 gap-1 w-max">
                          {TEXT_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => insertEmoji(emoji, comment.id)}
                              className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-lg transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">Ctrl + Enter で保存</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(comment.id)}
                      className="bg-blue-600 hover:bg-blue-700 h-8 text-sm px-3"
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
                      className="h-8 text-sm px-3"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {comment.content}
                </p>

                {/* Action buttons with emoji picker */}
                <div className="flex items-center gap-2 mt-1">
                  {depth < maxDepth && (
                    <button
                      onClick={() => {
                        setReplyingTo(comment.id)
                        setReplyContent("")
                      }}
                      className="text-xs text-gray-400 hover:text-blue-500 font-medium"
                    >
                      返信
                    </button>
                  )}
                  {canModifyComment(comment) && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditContent(comment.content)
                        }}
                        className="text-xs text-gray-400 hover:text-blue-500 font-medium"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-gray-400 hover:text-red-500 font-medium"
                      >
                        削除
                      </button>
                    </>
                  )}
                  
                  {/* Add reaction button - visible on hover or when picker is open */}
                  <div className={`relative emoji-picker-container transition-opacity ${
                    showEmojiPicker === comment.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <button
                      onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                      title="リアクションを追加"
                    >
                      <span className="text-xs">😊</span>
                    </button>
                    
                    {/* Emoji Picker */}
                    {showEmojiPicker === comment.id && (
                      <div className="absolute left-0 top-full mt-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1">
                        {COMMON_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(comment.id, emoji)}
                            className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reactions - only show if there are reactions */}
                {Object.keys(getReactionCounts(comment.id)).length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {Object.entries(getReactionCounts(comment.id)).map(([emoji, { count, hasReacted }]) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(comment.id, emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                          hasReacted
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="font-medium">{count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Reply form */}
            {isReplying && (
              <div className="mt-1.5 space-y-1.5">
                <Textarea
                  placeholder="返信を入力..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => handleReplyKeyDown(e, comment.id)}
                  rows={2}
                  className="text-gray-900 border-gray-200 text-sm"
                  autoFocus
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Emoji picker for reply */}
                    <div className="relative text-emoji-picker-container">
                      <button
                        type="button"
                        onClick={() => setShowTextEmojiPicker(showTextEmojiPicker === 'reply' ? null : 'reply')}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="絵文字を追加"
                      >
                        <span className="text-base">😊</span>
                      </button>
                      
                      {showTextEmojiPicker === 'reply' && (
                        <div className="absolute left-0 bottom-full mb-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-6 gap-1 w-max">
                          {TEXT_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => insertEmoji(emoji, 'reply')}
                              className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-lg transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">Ctrl + Enter で送信</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => handleReplySubmit(comment.id)}
                      disabled={!replyContent.trim() || submitting}
                      className="bg-blue-600 hover:bg-blue-700 h-8 text-sm px-3"
                    >
                      {submitting ? "送信中..." : "返信"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent("")
                      }}
                      className="h-8 text-sm px-3"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Render nested replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-1.5">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <aside className="mt-8 bg-white rounded-xl border border-gray-100 p-5" aria-label="コメント">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900 text-base">コメント</h3>
        <span className="text-sm text-gray-500 ml-auto">
          {countTotalComments(comments)}件
        </span>
      </div>

      {/* Comment Form - Always shown */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden flex-shrink-0">
            {user && profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || ""}
                width={36}
                height={36}
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
              rows={2}
              className="text-gray-900 border-gray-200 placeholder:text-gray-400 resize-none text-sm"
            />
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-2">
                {!user && (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    ログインして名前を表示
                  </button>
                )}
                
                {/* Emoji picker for text */}
                <div className="relative text-emoji-picker-container">
                  <button
                    type="button"
                    onClick={() => setShowTextEmojiPicker(showTextEmojiPicker === 'new' ? null : 'new')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="絵文字を追加"
                  >
                    <span className="text-base">😊</span>
                  </button>
                  
                  {showTextEmojiPicker === 'new' && (
                    <div className="absolute left-0 bottom-full mb-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-6 gap-1 w-max">
                      {TEXT_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => insertEmoji(emoji, 'new')}
                          className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <span className="text-xs text-gray-400">
                  Ctrl + Enter で送信
                </span>
              </div>
              <Button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="bg-blue-600 hover:bg-blue-700 ml-auto h-8 text-sm px-3"
              >
                {submitting ? "送信中..." : "コメントする"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/4" />
                <div className="h-3.5 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">まだコメントはありません</p>
          <p className="text-xs mt-1 text-gray-400">最初のコメントを投稿しましょう</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {comments.map((comment) => renderComment(comment))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="mt-4 text-center">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
                className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {loadingMore ? "読み込み中..." : "もっと読み込む"}
              </Button>
            </div>
          )}
        </>
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

