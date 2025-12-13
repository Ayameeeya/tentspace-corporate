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
    await signOut()
    setUser(null)
    setProfile(null)
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
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        プロフィール
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/blog/favorites" className="cursor-pointer">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        お気に入り
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      ログアウト
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
        onSuccess={loadUser}
      />
    </>
  )
}
