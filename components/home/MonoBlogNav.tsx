"use client"

import "@/app/home.css"

import { lazy, Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { BlogTicker } from "@/components/blog-ticker"
import { getCurrentUser, getProfile, onAuthStateChange, signOut, type Profile } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { attachHoverScramble } from "./scramble"
import { MonoMenu } from "./MonoMenu"
import { MENU_ENTRIES } from "./MonoNav"

const AuthModal = lazy(() =>
  import("@/components/auth-modal").then((module) => ({ default: module.AuthModal })),
)

const ITEMS = [
  { href: "/blog", label: "blog" },
  { href: "/blog/n8n", label: "n8n" },
  { href: "/blog/seo", label: "seo" },
]

/** Blog header in the mono design language — same bar as the top page, blog items. */
export function MonoBlogNav({ ticker = false }: { ticker?: boolean } = {}) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // the nav is em-scaled so its height varies with viewport width; publish it
  // as --blog-nav-h so page content can pad itself below the fixed header
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const set = () =>
      document.documentElement.style.setProperty("--blog-nav-h", `${Math.ceil(el.offsetHeight)}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty("--blog-nav-h")
    }
  }, [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  // hover scramble on nav links
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const cleanups = Array.from(nav.querySelectorAll<HTMLElement>("[data-mono-hover]")).map((el) =>
      attachHoverScramble(el, 3),
    )
    return () => cleanups.forEach((fn) => fn())
  }, [loading, user])

  // auth state (same behaviour as the previous blog header)
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      try {
        const currentUser = await getCurrentUser()
        if (currentUser && currentUser.email_confirmed_at) {
          setUser(currentUser)
          setLoading(false)
          getProfile(currentUser.id)
            .then((p) => setProfile(p))
            .catch((error) => console.error("Error loading profile:", error))
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
    loadUser()

    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, session) => {
      if (session?.user && session.user.email_confirmed_at) {
        setUser(session.user)
        setLoading(false)
        getProfile(session.user.id)
          .then((p) => setProfile(p))
          .catch((error) => console.error("Error loading profile:", error))
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    const handleOpenAuthModal = () => setShowAuthModal(true)
    window.addEventListener("open-auth-modal", handleOpenAuthModal)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("open-auth-modal", handleOpenAuthModal)
    }
  }, [])

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
    <div className="mono-page" style={{ background: "transparent" }}>
      {/* header stack: mono bar on top, ticker beneath it */}
      <div ref={headerRef} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 900 }}>
      {/* blog content is white-based, so the bar grounds on white (not the top page's off-white) */}
      <nav
        ref={navRef}
        className="mono-nav"
        data-nav-theme="base"
        style={{ position: "relative", ["--nav-bg" as string]: "#ffffff" }}
      >
        <div className="mono-nav__main">
          <div className="mono-nav__left">
            <button
              type="button"
              className="mono-menu-btn"
              aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
            </button>
            <Link href="/" className="mono-logo" aria-label="Home">
              <img src="/logo_black_yoko.png" alt="tent space" className="mono-logo__img mono-logo__img--dark" />
            </Link>
          </div>
          <div className="mono-nav__progress">
            <div className="mono-nav__labels">
              {ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mono-nav__label"
                  style={{ textDecoration: "none" }}
                  data-active={pathname === item.href}
                  data-mono-hover
                >
                  <span className="paragraph-regular" data-mono-hover-target>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="mono-nav__docs">
            <Link href="/" className="paragraph-regular" data-mono-hover style={{ textDecoration: "none", color: "inherit" }}>
              <span data-mono-hover-target>[ top ]</span>
            </Link>
          </div>
          <div className="mono-nav__signin" style={{ alignItems: "center" }}>
            {loading ? (
              <span className="paragraph-regular" style={{ opacity: 0.4 }}>
                …
              </span>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="アカウントメニュー"
                    style={{
                      width: "2em",
                      height: "2em",
                      border: "1px solid var(--m-ink)",
                      borderRadius: "999em",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--m-indigo)",
                      color: "#e5e5e5",
                      cursor: "crosshair",
                      padding: 0,
                      fontFamily: "inherit",
                    }}
                  >
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={displayName} width={36} height={36} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                    ) : (
                      <span className="paragraph-s">{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      ダッシュボード
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/blog/favorites" className="cursor-pointer">
                      お気に入り
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      設定
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={signingOut} className="text-destructive cursor-pointer">
                    {signingOut ? "ログアウト中..." : "ログアウト"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="paragraph-regular mono-ul"
                data-mono-hover
                style={{ background: "none", border: "none", padding: 0, fontFamily: "inherit", color: "inherit" }}
              >
                <span data-mono-hover-target>sign in</span>
              </button>
            )}
          </div>
        </div>
        <div className="mono-nav__border" />
      </nav>
      {ticker && <BlogTicker fixed={false} />}
      </div>

      <MonoMenu open={menuOpen} entries={MENU_ENTRIES} onClose={() => setMenuOpen(false)} />

      {showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal isOpen onClose={() => setShowAuthModal(false)} onSuccess={() => window.location.reload()} />
        </Suspense>
      )}
    </div>
  )
}
