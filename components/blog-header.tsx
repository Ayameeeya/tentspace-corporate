"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { gsap } from "gsap"
import { AuthModal } from "@/components/auth-modal"
import { BlogTicker } from "@/components/blog-ticker"
import { getCurrentUser, getProfile, onAuthStateChange, type Profile } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth"
import GlassSurface from "@/components/GlassSurface"

export function BlogHeader() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mobile menu animation
  useEffect(() => {
    if (!mobileMenuRef.current) return

    if (mobileMenuOpen) {
      // Open animation
      gsap.to(mobileMenuRef.current, {
        x: 0,
        duration: 0.4,
        ease: "power2.out",
      })
    } else {
      // Close animation
      gsap.to(mobileMenuRef.current, {
        x: "100%",
        duration: 0.3,
        ease: "power2.in",
      })
    }
  }, [mobileMenuOpen])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [mobileMenuOpen])

  useEffect(() => {
    // Initial load
    loadUser()

    // Listen to auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      // Only consider user logged in if email is confirmed
      if (session?.user && session.user.email_confirmed_at) {
        setUser(session.user)
        setLoading(false)

        // Load profile separately (non-blocking)
        getProfile(session.user.id)
          .then(userProfile => setProfile(userProfile))
          .catch(error => console.error("Error loading profile:", error))
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    // Listen for custom event to open auth modal
    const handleOpenAuthModal = () => {
      setShowAuthModal(true)
    }
    window.addEventListener("open-auth-modal", handleOpenAuthModal)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("open-auth-modal", handleOpenAuthModal)
    }
  }, [])

  const loadUser = async () => {
    setLoading(true)
    try {
      const currentUser = await getCurrentUser()

      // Only consider user logged in if email is confirmed
      if (currentUser && currentUser.email_confirmed_at) {
        setUser(currentUser)
        setLoading(false) // Set loading to false immediately after user is loaded

        // Load profile separately (non-blocking)
        getProfile(currentUser.id)
          .then(userProfile => setProfile(userProfile))
          .catch(error => console.error("Error loading profile:", error))
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error loading user:", error)
      setUser(null)
      setProfile(null)
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      setUser(null)
      setProfile(null)
      window.location.href = "/blog"
    } catch (error) {
      console.error("Error signing out:", error)
      setSigningOut(false)
    }
  }

  const displayName = profile?.display_name || user?.email?.split("@")[0] || ""
  const avatarUrl = profile?.avatar_url

  // AIと一緒に執筆ボタンのクリックハンドラ
  const handleWriteWithAI = () => {
    if (user) {
      // ログイン済みなら直接プラン選択ページへ
      router.push("/pricing")
    } else {
      // 未ログインならサインアップモーダルを開いて、成功後にリダイレクト
      setPendingRedirect("/pricing")
      setShowAuthModal(true)
    }
  }

  // 認証成功時のハンドラ
  const handleAuthSuccess = () => {
    if (pendingRedirect) {
      router.push(pendingRedirect)
      setPendingRedirect(null)
    } else {
      window.location.reload()
    }
  }

  return (
    <>
      {/* 電光掲示板 */}
      <BlogTicker />

      <header className="fixed top-10 left-0 right-0 z-40 pointer-events-none">
        <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-6">
          {/* Logo - Home Link */}
          <div className="pointer-events-auto">
            <Link
              href="/"
              className="flex items-center relative block group"
            >
              <Image
                src={mounted && theme === 'dark' ? "/logo_white_yoko.png" : "/logo_black_yoko.png"}
                alt="tent space"
                width={110}
                height={50}
                className="transition-all duration-500 relative z-10 w-[80px] h-auto md:w-[110px]"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Links + Auth Section - Right Side */}
          <div className="pointer-events-auto hidden md:flex items-center gap-3 md:gap-6">
            {/* Navigation Links */}
            <nav className="flex items-center gap-3 md:gap-5">
              <Link
                href="/blog"
                className="text-foreground text-[10px] md:text-xs font-semibold tracking-wide hover:text-primary transition-colors"
              >
                BLOG
              </Link>
              <Link
                href="/blog/n8n"
                className="text-foreground text-[10px] md:text-xs font-semibold tracking-wide hover:text-primary transition-colors"
              >
                n8n
              </Link>
              <Link
                href="/blog/seo"
                className="text-foreground text-[10px] md:text-xs font-semibold tracking-wide hover:text-primary transition-colors"
              >
                SEO
              </Link>
            </nav>

            {/* Auth Section */}
            <div>
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 focus:outline-none group">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={displayName}
                            width={36}
                            height={36}
                            className="object-cover"
                          />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-popover text-popover-foreground border-border">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        ダッシュボード
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/blog/favorites" className="cursor-pointer text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-accent hover:text-slate-900 dark:hover:text-accent-foreground">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        お気に入り
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        設定
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10"
                    >
                      {signingOut ? (
                        <>
                          <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          ログアウト中...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          ログアウト
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="relative group"
                >
                  <GlassSurface
                    width="auto"
                    height={40}
                    borderRadius={8}
                    blur={8}
                    className="px-4 md:px-5 transition-all duration-300"
                  >
                    <span className="text-foreground text-[10px] md:text-xs font-semibold tracking-wide whitespace-nowrap">
                      SIGN IN
                    </span>
                  </GlassSurface>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            ref={hamburgerRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="pointer-events-auto md:hidden flex flex-col items-center justify-center w-10 h-10 gap-[6px] focus:outline-none group"
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-[2px] bg-foreground transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-[2px] bg-foreground transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-[2px] bg-foreground transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        ref={mobileMenuRef}
        className="fixed top-0 right-0 bottom-0 w-[280px] bg-background border-l border-border z-[70] md:hidden"
        style={{ transform: 'translateX(100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo + Close Button */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center"
            >
              <Image
                src="/logo_black_yoko.png"
                alt="tent space"
                width={110}
                height={50}
                className="w-[90px] h-auto"
                priority
              />
            </Link>

            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-6 mb-8">
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground text-2xl font-pixel tracking-wider hover:text-primary transition-colors"
            >
              ABOUT
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground text-2xl font-pixel tracking-wider hover:text-primary transition-colors"
            >
              BLOG
            </Link>
            <Link
              href="/blog/n8n"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground text-2xl font-pixel tracking-wider hover:text-primary transition-colors"
            >
              n8n
            </Link>
            <Link
              href="/blog/seo"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground text-2xl font-pixel tracking-wider hover:text-primary transition-colors"
            >
              SEO
            </Link>
          </nav>

          {/* Divider */}
          <div className="h-[2px] bg-border mb-8" />

          {/* Auth Section */}
          {loading ? (
            <div className="w-full h-12 rounded-lg bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-medium overflow-hidden">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted transition-colors text-foreground font-pixel text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                DASHBOARD
              </Link>

              <Link
                href="/blog/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted transition-colors text-foreground font-pixel text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                FAVORITES
              </Link>

              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted transition-colors text-foreground font-pixel text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                SETTINGS
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleSignOut()
                }}
                disabled={signingOut}
                className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-destructive/10 transition-colors text-destructive font-pixel text-sm mt-2"
              >
                {signingOut ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    SIGNING OUT...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    SIGN OUT
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setShowAuthModal(true)
              }}
              className="w-full py-3.5 px-6 bg-foreground text-background rounded-lg text-sm font-semibold tracking-wide hover:bg-foreground/90 transition-all hover:shadow-lg"
            >
              SIGN IN
            </button>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          setPendingRedirect(null)
        }}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}
