"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { BlogHeader } from "@/components/blog-header"
import { getCurrentUser } from "@/lib/auth"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      
      if (!currentUser || !currentUser.email_confirmed_at) {
        router.push("/blog")
        return
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/blog")
    }
    setLoading(false)
  }

  const menuItems = [
    { id: "general", label: "一般設定", icon: "⚙️", href: "/settings/general" },
    { id: "account", label: "アカウント", icon: "👤", href: "/settings/account" },
    { id: "security", label: "セキュリティ", icon: "🔐", href: "/settings/security" },
    { id: "privacy", label: "プライバシー", icon: "🔒", href: "/settings/privacy" },
    { id: "notifications", label: "通知", icon: "🔔", href: "/settings/notifications" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="pt-24 pb-12">
          <div className="animate-pulse space-y-4 max-w-6xl mx-auto px-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />

      <div className="pt-14 md:pt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {/* Sidebar */}
            <aside className="w-56 bg-card border-r border-border min-h-screen pt-6 px-4 fixed left-0 top-14 md:top-16">
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Settings
                </h2>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-blue-500/10 text-blue-500 font-medium"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-border">
                <Link
                  href="/blog"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                >
                  <span>←</span>
                  <span>ブログに戻る</span>
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-56 p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

