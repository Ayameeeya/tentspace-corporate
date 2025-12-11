"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchInput.trim())}`)
    }
  }
  // おすすめコンテンツ
  const recommendedLinks = [
    {
      title: "ブログ記事一覧",
      description: "AI開発やテクノロジーに関する最新情報をお届け",
      href: "/blog",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      title: "会社概要",
      description: "tent spaceについて詳しく知る",
      href: "/about",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "お問い合わせ",
      description: "ご質問やご相談はこちらから",
      href: "mailto:back-office@tentspace.net",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo_black_yoko.png"
                alt="tent space"
                width={90}
                height={40}
                className="h-6 md:h-7 w-auto"
                priority
              />
            </Link>
            <nav className="flex items-center gap-4 md:gap-6">
              <Link href="/blog" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                Blog
              </Link>
              <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Error Message */}
          <div className="text-center mb-12">
            {/* 404 Illustration */}
            <div className="mb-8 relative">
              <div className="text-[120px] md:text-[180px] font-black text-gray-100 leading-none select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              お探しのページが見つかりませんでした
            </h1>
            
            <p className="text-gray-600 mb-2 max-w-lg mx-auto">
              申し訳ありません。お探しのページは削除されたか、
              URLが変更された可能性があります。
            </p>
            <p className="text-sm text-gray-500 mb-8">
              以下のリンクから目的のページをお探しください。
            </p>

            {/* Primary Action */}
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              トップページへ戻る
            </Link>
          </div>

          {/* Search Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-10">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                記事を検索しますか？
              </h2>
              <p className="text-sm text-gray-500">
                キーワードでブログ記事を探すことができます
              </p>
            </div>
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="例: Docker, AI, ChatGPT..."
                    className="w-full px-4 py-3 pl-10 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <svg 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  検索
                </button>
              </div>
            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400 font-medium">または</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Recommended Links */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
              こちらのページはいかがでしょうか？
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      {link.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 md:p-8 text-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              お困りですか？
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              お探しの情報が見つからない場合は、お気軽にお問い合わせください。
            </p>
            <a
              href="mailto:back-office@tentspace.net"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              back-office@tentspace.net
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/logo_black_symbol.png"
                alt="tent space"
                width={32}
                height={32}
                className="opacity-60"
              />
              <span className="text-sm text-gray-500">© 2025 tent space Inc.</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                利用規約
              </Link>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                プライバシー
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
