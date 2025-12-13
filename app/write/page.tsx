"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"

export default function WritePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Editor state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [syncScroll, setSyncScroll] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser?.email_confirmed_at) {
        setUser(currentUser)
      } else {
        router.push("/pricing")
      }
      setLoading(false)
    }
    loadUser()
  }, [router])

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || content) {
        handleSave()
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [title, content])

  // Sync scroll
  const handleEditorScroll = useCallback(() => {
    if (!syncScroll || !editorRef.current || !previewRef.current) return
    const editor = editorRef.current
    const preview = previewRef.current
    const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
    preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight)
  }, [syncScroll])

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: 実際の保存処理
    await new Promise(resolve => setTimeout(resolve, 500))
    setLastSaved(new Date())
    setIsSaving(false)
  }

  // Simple markdown to HTML conversion
  const renderMarkdown = (text: string) => {
    if (!text) return ""
    
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code>$2</code></pre>')
      // Inline code
      .replace(/`(.*?)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-500 hover:underline">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-violet-500 pl-4 my-4 text-muted-foreground italic">$1</blockquote>')
      // Unordered lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Line breaks
      .replace(/\n/gim, '<br />')
    
    return html
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  // Insert text helper
  const insertText = (before: string, after: string = "") => {
    const textarea = editorRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    setContent(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Header */}
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="戻る"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          {mounted && (
            <Image
              src={theme === 'dark' ? "/logo_white_yoko.png" : "/logo_black_yoko.png"}
              alt="tent space"
              width={80}
              height={35}
              className="h-5 w-auto hidden sm:block"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="フルスクリーン切替 (Ctrl+Enter)"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>

          {/* Settings */}
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="設定"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          {/* Publish toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">公開する</span>
            <button
              className="w-10 h-5 bg-muted-foreground/30 rounded-full relative transition-colors"
            >
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" />
            </button>
          </div>

          {/* Save status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
            isSaving 
              ? "bg-yellow-500/10 text-yellow-500" 
              : lastSaved 
                ? "bg-green-500/10 text-green-500" 
                : "bg-muted text-muted-foreground"
          }`}>
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                保存中...
              </>
            ) : lastSaved ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                保存済み
              </>
            ) : (
              "未保存"
            )}
          </div>
        </div>
      </header>

      {/* Main Editor Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Title */}
        <div className="px-4 md:px-8 py-4 border-b border-border">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            className="w-full text-2xl md:text-3xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Editor & Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col border-r border-border">
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onScroll={handleEditorScroll}
              placeholder="マークダウンで書く..."
              className="flex-1 w-full p-4 md:p-8 bg-card text-foreground placeholder:text-muted-foreground/50 resize-none outline-none font-mono text-sm leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col bg-background hidden md:flex">
            <div className="flex items-center justify-end px-4 py-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                Preview
              </span>
            </div>
            <div
              ref={previewRef}
              className="flex-1 p-8 overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
            >
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
              ) : (
                <p className="text-muted-foreground/50 text-center mt-20">
                  コンテンツがありません
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="h-12 border-t border-border bg-background flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-1">
            {/* Image upload */}
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="画像をアップロード"
            >
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Insert menu */}
            <button
              onClick={() => insertText("**", "**")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="太字"
            >
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Help */}
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="マークダウンヘルプ"
            >
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Scroll sync toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSyncScroll(!syncScroll)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                syncScroll ? "bg-violet-500/10 text-violet-500" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className={`w-8 h-4 rounded-full relative transition-colors ${
                syncScroll ? "bg-violet-500" : "bg-muted-foreground/30"
              }`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                  syncScroll ? "left-4" : "left-0.5"
                }`} />
              </div>
              スクロール同期
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

