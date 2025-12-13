"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { AuthModal } from "@/components/auth-modal"
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

export function BlogHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo - Home Link */}
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors"
              title="ホームに戻る"
            >
              <Image
                src="/logo_black_yoko.png"
                alt="tent space"
                width={90}
                height={40}
                className="h-6 md:h-7 w-auto"
                priority
              />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-3 md:gap-5">
              <Link
                href="/blog"
                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
              >
                About
              </Link>
              <a
                href="mailto:back-office@tentspace.net"
                className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors hidden sm:block"
              >
                お問い合わせ
              </a>

              {/* Auth Section */}
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 focus:outline-none group">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden ring-2 ring-transparent group-hover:ring-blue-200 transition-all">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={displayName}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer text-gray-700 hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        ダッシュボード
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/account" className="cursor-pointer text-gray-700 hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        アカウント
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/blog/favorites" className="cursor-pointer text-gray-700 hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        お気に入り
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer text-gray-700 hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        設定
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 hover:bg-red-50"
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
                  className="text-sm px-3 py-1.5 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  ログイン
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  )
}
