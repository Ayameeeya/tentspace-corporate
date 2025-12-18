"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"

export default function NotFound() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchInput.trim())}`)
    }
  }
  // 人気記事（静的に定義）
  const popularArticles = [
    {
      title: "ChatGPTの使い方を初心者向けに徹底解説",
      category: "AI活用",
      href: "/blog/%e3%80%902025%e5%b9%b4%e6%9c%80%e6%96%b0%e3%80%91chatgpt%e3%81%ae%e4%bd%bf%e3%81%84%e6%96%b9%e3%82%92%e5%88%9d%e5%bf%83%e8%80%85%e5%90%91%e3%81%91%e3%81%ab%e5%be%b9%e5%ba%95%e8%a7%a3%e8%aa%ac%ef%bc%81",
    },
    {
      title: "Docker入門｜環境構築の変遷と始め方",
      category: "テクノロジー",
      href: "/blog/docker%e5%85%a5%e9%96%80%ef%bd%9c20%e5%b9%b4%e7%8f%be%e5%a0%b4%e3%81%a7%e8%a6%8b%e3%81%a6%e3%81%8d%e3%81%9f%e7%92%b0%e5%a2%83%e6%a7%8b%e7%af%89%e3%81%ae%e5%a4%89%e9%81%b7%e3%81%a8%e5%a7%8b%e3%82%81",
    },
    {
      title: "Dockerの辛いところ｜7つの落とし穴",
      category: "テクノロジー",
      href: "/blog/docker%e3%81%ae%e8%be%9b%e3%81%84%e3%81%a8%e3%81%93%e3%82%8d%ef%bd%9c20%e5%b9%b4%e7%8f%be%e5%a0%b4%e3%81%a7%e8%a6%8b%e3%81%a6%e3%81%8d%e3%81%9f%e3%80%8c%e4%be%bf%e5%88%a9%e3%81%a0%e3%81%91%e3%81%a9",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <BlogHeader />

      {/* Main Content */}
      <main className="pt-[136px] pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="パンくずリスト">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  ホーム
                </Link>
              </li>
              <li aria-hidden="true">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gray-900 transition-colors">
                  ブログ
                </Link>
              </li>
              <li aria-hidden="true">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-gray-400">記事が見つかりません</li>
            </ol>
          </nav>

          {/* Error Message */}
          <div className="text-center mb-12">
            {/* 404 Illustration */}
            <div className="mb-8 relative">
              <div className="text-[100px] md:text-[140px] font-black text-gray-100 leading-none select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 md:w-14 md:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              記事が見つかりませんでした
            </h1>

            <p className="text-gray-600 mb-2 max-w-lg mx-auto">
              お探しの記事は削除されたか、URLが変更された可能性があります。
            </p>
            <p className="text-sm text-gray-500 mb-8">
              以下から他の記事をお探しいただくか、ブログ一覧からご覧ください。
            </p>

            {/* Primary Action */}
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              ブログ一覧を見る
            </Link>
          </div>

          {/* Search Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">記事を検索</p>
                  <p className="text-xs text-gray-500">キーワードで探す</p>
                </div>
              </div>
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Docker, AI, ChatGPT..."
                  className="flex-1 px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  検索
                </button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400 font-medium">人気の記事</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Popular Articles */}
          <div className="mb-12">
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                    <h3 className="font-medium text-gray-900 mt-1 group-hover:text-blue-600 transition-colors truncate">
                      {article.title}
                    </h3>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  お探しの記事が見つかりませんか？
                </h3>
                <p className="text-gray-600 text-sm">
                  特定のトピックについてお知りになりたい場合は、お気軽にお問い合わせください。
                  リクエストに応じて記事を作成することも可能です。
                </p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="mailto:back-office@tentspace.net"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-white hover:border-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  お問い合わせ
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
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
              <Link href="/about" className="hover:text-gray-900 transition-colors">
                About
              </Link>
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
